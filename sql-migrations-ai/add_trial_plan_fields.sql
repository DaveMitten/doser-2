-- Add trial and plan fields to profiles table
-- This migration adds fields to track user's selected plan and trial status

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_plan TEXT,
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_expired BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';

-- Create index for efficient trial expiration queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_start_date ON public.profiles(trial_start_date);

-- Update the handle_new_user function to include plan information
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, selected_plan, trial_start_date, trial_expired, subscription_status)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'selected_plan',
    NOW(), -- Set trial start date to now
    FALSE, -- Trial not expired initially
    'trial' -- Default to trial status
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create a function to check if a user's trial has expired
CREATE OR REPLACE FUNCTION public.is_trial_expired(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_start TIMESTAMP WITH TIME ZONE;
  trial_duration INTERVAL := '7 days';
BEGIN
  -- Get the trial start date for the user
  SELECT trial_start_date INTO trial_start
  FROM public.profiles
  WHERE id = user_id;
  
  -- If no trial start date, consider trial expired
  IF trial_start IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if 7 days have passed
  RETURN (NOW() - trial_start) > trial_duration;
END;
$$;

-- Create a function to update trial status
CREATE OR REPLACE FUNCTION public.update_trial_status()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profiles where trial has expired
  UPDATE public.profiles 
  SET trial_expired = TRUE, subscription_status = 'expired'
  WHERE trial_start_date IS NOT NULL 
    AND trial_expired = FALSE
    AND (NOW() - trial_start_date) > INTERVAL '7 days';
END;
$$;

-- Create a scheduled function to run trial expiration checks (if using pg_cron)
-- This would need to be set up in Supabase dashboard or via a cron job
-- For now, we'll handle this in the application logic


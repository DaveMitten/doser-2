-- Simplify Trial System Migration
-- This migration removes trial-related fields from profiles table
-- and moves all trial logic to user_subscriptions table

-- Drop the old trial-related columns from profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS selected_plan,
DROP COLUMN IF EXISTS trial_start_date,
DROP COLUMN IF EXISTS trial_expired,
DROP COLUMN IF EXISTS subscription_status;

-- Drop index that's no longer needed
DROP INDEX IF EXISTS idx_profiles_trial_start_date;

-- Update the handle_new_user function to create user_subscriptions record automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Insert user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  -- Insert user subscription with 7-day trial
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    status,
    trial_start,
    trial_end,
    current_period_start,
    current_period_end
  )
  VALUES (
    NEW.id,
    'pdt_QT8CsZEYopzV38iWlE0Sb', -- Default to Track plan (Dodo product ID) for all new users
    'trialing',
    NOW(),
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW() + INTERVAL '7 days'
  );
  
  RETURN NEW;
END;
$$;

-- Drop old trial-related functions that are no longer needed
DROP FUNCTION IF EXISTS public.is_trial_expired(UUID);
DROP FUNCTION IF EXISTS public.update_trial_status();

-- Add a comment to document the change
COMMENT ON TABLE public.user_subscriptions IS 'Stores user subscription data including trial periods. All trial logic is managed here.';


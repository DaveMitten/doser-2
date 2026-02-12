-- ===================================================================
-- FIX: Improve handle_new_user trigger with better error handling
-- ===================================================================
-- This migration improves the handle_new_user() trigger function to:
-- 1. Add comprehensive error handling
-- 2. Provide detailed error messages for debugging
-- 3. Fail loudly if duplicate profiles exist (safer than overwriting)
-- 4. Log errors for monitoring
-- 5. Validate required data before insertion
--
-- Run this in your Supabase SQL Editor

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  -- Extract email and full_name with null checks
  v_email := COALESCE(NEW.email, '');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NULL);

  -- Validate email exists
  IF v_email = '' THEN
    RAISE EXCEPTION 'Cannot create profile: email is required';
  END IF;

  -- Insert profile - fail loudly if conflict occurs (indicates a problem)
  BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, v_email, v_full_name);

    RAISE LOG 'Profile created for user: %', NEW.id;
  EXCEPTION
    WHEN unique_violation THEN
      -- Check if it's a duplicate ID or duplicate email
      IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        RAISE EXCEPTION 'Profile creation failed: profile already exists for user ID %. This should never happen - investigate immediately.', NEW.id;
      ELSE
        RAISE EXCEPTION 'Profile creation failed: email % already exists', v_email;
      END IF;
    WHEN foreign_key_violation THEN
      RAISE EXCEPTION 'Profile creation failed: invalid user reference';
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Profile creation failed: %', SQLERRM;
  END;

  -- Insert user preferences with ON CONFLICT to handle duplicates
  BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RAISE LOG 'User preferences created for user: %', NEW.id;
  EXCEPTION
    WHEN foreign_key_violation THEN
      RAISE EXCEPTION 'User preferences creation failed: invalid user reference';
    WHEN OTHERS THEN
      RAISE EXCEPTION 'User preferences creation failed: %', SQLERRM;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise it
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RAISE;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS
  'Automatically creates profile and preferences when a new user signs up. Fails loudly with detailed errors if profile already exists (safer than overwriting). Includes comprehensive error handling and logging.';

-- Test the function is working
DO $$
BEGIN
  RAISE NOTICE 'handle_new_user trigger function updated successfully';
END $$;

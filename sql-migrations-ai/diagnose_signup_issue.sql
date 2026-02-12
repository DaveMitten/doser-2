-- ===================================================================
-- DIAGNOSTIC SCRIPT: Diagnose Signup Issues
-- ===================================================================
-- This script helps identify issues with the user signup process
-- Run this in your Supabase SQL Editor to check for common problems

-- 1. Check if profiles table exists and structure
SELECT
  'profiles table check' as check_type,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) as table_exists;

-- 2. Check if user_preferences table exists
SELECT
  'user_preferences table check' as check_type,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_preferences'
  ) as table_exists;

-- 3. Check if handle_new_user function exists
SELECT
  'handle_new_user function check' as check_type,
  EXISTS (
    SELECT FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'handle_new_user'
  ) as function_exists;

-- 4. Check if trigger exists
SELECT
  'on_auth_user_created trigger check' as check_type,
  EXISTS (
    SELECT FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'auth'
    AND c.relname = 'users'
    AND t.tgname = 'on_auth_user_created'
  ) as trigger_exists;

-- 5. Check RLS policies on profiles
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 6. Check RLS policies on user_preferences
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_preferences';

-- 7. Check for any orphaned auth users (users without profiles)
SELECT
  'orphaned users check' as check_type,
  COUNT(*) as orphaned_count
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 8. Check for duplicate emails in profiles
SELECT
  'duplicate emails check' as check_type,
  email,
  COUNT(*) as duplicate_count
FROM public.profiles
GROUP BY email
HAVING COUNT(*) > 1;

-- 9. Check profiles table constraints
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'profiles';

-- 10. Check recent auth logs for errors (if available)
-- Note: This might not work depending on your Supabase plan
-- SELECT * FROM auth.audit_log_entries
-- WHERE created_at > NOW() - INTERVAL '1 hour'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- 11. Test if handle_new_user function can be executed
-- This shows the function definition
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user'
AND pronamespace = 'public'::regnamespace;

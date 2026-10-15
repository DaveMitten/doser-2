-- ============================================================================
-- VERIFY STAGING DATABASE SETUP
-- ============================================================================
-- Run this in Supabase SQL Editor to verify everything was created correctly
-- ============================================================================

-- Check all tables were created
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected tables:
-- - payment_history
-- - profiles
-- - sessions
-- - user_preferences
-- - user_subscriptions

-- ============================================================================
-- Check RLS is enabled on all tables
-- ============================================================================
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- All should show rls_enabled = true

-- ============================================================================
-- Check policies exist
-- ============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- Check triggers
-- ============================================================================
SELECT
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- Check functions
-- ============================================================================
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Expected functions:
-- - get_subscription_by_dodo_id
-- - handle_new_user
-- - handle_updated_at
-- - update_subscription_status_by_dodo_id

-- ============================================================================
-- Check indexes
-- ============================================================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

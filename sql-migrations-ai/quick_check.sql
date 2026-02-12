-- Quick diagnostic check - single query
SELECT
  'handle_new_user function exists' as check_name,
  EXISTS (
    SELECT FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'handle_new_user'
  ) as status
UNION ALL
SELECT
  'on_auth_user_created trigger exists',
  EXISTS (
    SELECT FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'auth'
    AND c.relname = 'users'
    AND t.tgname = 'on_auth_user_created'
  )
UNION ALL
SELECT
  'orphaned users (no profile)',
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.id WHERE p.id IS NULL) > 0;

-- ===================================================================
-- DODO PAYMENTS SETUP VERIFICATION
-- ===================================================================
-- Run this script to verify your Dodo Payments database setup
-- This will check if all required tables and columns exist

-- Check if user_subscriptions table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_subscriptions'
    )
    THEN '✅ user_subscriptions table EXISTS'
    ELSE '❌ user_subscriptions table MISSING - Run dodo-payments-migration.sql'
  END as user_subscriptions_status;

-- Check if payment_history table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'payment_history'
    )
    THEN '✅ payment_history table EXISTS'
    ELSE '❌ payment_history table MISSING - Run dodo-payments-migration.sql'
  END as payment_history_status;

-- Check if dodo columns exist in user_subscriptions
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_subscriptions'
  AND column_name IN ('dodo_subscription_id', 'dodo_customer_id')
ORDER BY column_name;

-- If user_subscriptions exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- Show existing subscriptions count (if table exists)
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(dodo_subscription_id) as with_dodo_id,
  COUNT(dodo_customer_id) as with_customer_id
FROM public.user_subscriptions
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_subscriptions'
);



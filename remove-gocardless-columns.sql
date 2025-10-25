-- ===================================================================
-- REMOVE GOCARDLESS COLUMNS MIGRATION
-- ===================================================================
-- This migration removes all GoCardless-related columns from user_subscriptions
-- since we've migrated to Dodo Payments
--
-- Run this in your Supabase SQL Editor
-- ===================================================================

-- Drop GoCardless columns from user_subscriptions table
ALTER TABLE user_subscriptions 
DROP COLUMN IF EXISTS gocardless_customer_id,
DROP COLUMN IF EXISTS gocardless_subscription_id,
DROP COLUMN IF EXISTS gocardless_mandate_id;

-- Drop any indexes related to GoCardless columns (if they exist)
DROP INDEX IF EXISTS idx_user_subscriptions_gocardless_customer_id;
DROP INDEX IF EXISTS idx_user_subscriptions_gocardless_subscription_id;
DROP INDEX IF EXISTS idx_user_subscriptions_gocardless_mandate_id;

-- Verify the columns are removed
-- Run this to check:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_subscriptions' 
-- ORDER BY ordinal_position;

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================
-- The following GoCardless columns have been removed:
-- ✅ gocardless_customer_id
-- ✅ gocardless_subscription_id
-- ✅ gocardless_mandate_id
--
-- Your user_subscriptions table now only contains Dodo Payments fields:
-- ✅ dodo_customer_id
-- ✅ dodo_subscription_id
-- ===================================================================


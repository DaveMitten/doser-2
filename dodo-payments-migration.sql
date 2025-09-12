-- Dodo Payments Migration
-- This migration adds Dodo Payments specific fields to the existing subscription tables

-- Add Dodo Payments specific fields to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dodo_subscription_id 
ON user_subscriptions(dodo_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dodo_customer_id 
ON user_subscriptions(dodo_customer_id);

-- Update the existing subscription plans to include Dodo product IDs
-- Note: These product IDs need to be created in your Dodo Payments dashboard first
-- and then updated here with the actual product IDs

-- Add a comment explaining the migration
COMMENT ON COLUMN user_subscriptions.dodo_subscription_id IS 'Dodo Payments subscription ID';
COMMENT ON COLUMN user_subscriptions.dodo_customer_id IS 'Dodo Payments customer ID';

-- Update RLS policies to include new fields
-- The existing RLS policies should already cover these fields since they're part of the user_subscriptions table
-- But let's make sure the policies are up to date

-- Ensure users can only access their own subscription data
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;
CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON user_subscriptions;
CREATE POLICY "Users can insert own subscription" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add a function to get subscription by Dodo subscription ID (for webhook processing)
CREATE OR REPLACE FUNCTION get_subscription_by_dodo_id(dodo_sub_id TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  plan_id TEXT,
  status TEXT,
  dodo_subscription_id TEXT,
  dodo_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.dodo_subscription_id,
    us.dodo_customer_id,
    us.current_period_start,
    us.current_period_end,
    us.trial_start,
    us.trial_end,
    us.created_at,
    us.updated_at
  FROM user_subscriptions us
  WHERE us.dodo_subscription_id = dodo_sub_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_subscription_by_dodo_id(TEXT) TO authenticated;

-- Add a function to update subscription status by Dodo subscription ID
CREATE OR REPLACE FUNCTION update_subscription_status_by_dodo_id(
  dodo_sub_id TEXT,
  new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_subscriptions 
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE dodo_subscription_id = dodo_sub_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_subscription_status_by_dodo_id(TEXT, TEXT) TO authenticated;

-- Complete Plan ID Migration Script
-- This script:
-- 1. Checks for existing subscriptions with old plan IDs
-- 2. Updates them to use Dodo product IDs
-- 3. Drops the old constraint
-- 4. Creates the new constraint with Dodo product IDs

-- ===================================================================
-- STEP 1: Check existing plan_id values
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '=== Checking existing plan_id values ===';
END $$;

SELECT 
  plan_id,
  COUNT(*) as count
FROM user_subscriptions
GROUP BY plan_id
ORDER BY count DESC;

-- ===================================================================
-- STEP 2: Update existing subscriptions to use Dodo product IDs
-- ===================================================================
DO $$
DECLARE
  update_count INTEGER;
BEGIN
  RAISE NOTICE '=== Updating existing subscriptions ===';
  
  -- Update 'track' to Track plan Dodo product ID
  UPDATE user_subscriptions 
  SET 
    plan_id = 'pdt_QT8CsZEYopzV38iWlE0Sb',
    updated_at = NOW()
  WHERE plan_id = 'track';
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  RAISE NOTICE 'Updated % records from track to pdt_QT8CsZEYopzV38iWlE0Sb', update_count;
  
  -- Update 'learn' to Learn plan Dodo product ID
  UPDATE user_subscriptions 
  SET 
    plan_id = 'pdt_euP6KahnWde9Ew1jvhIJj',
    updated_at = NOW()
  WHERE plan_id = 'learn';
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  RAISE NOTICE 'Updated % records from learn to pdt_euP6KahnWde9Ew1jvhIJj', update_count;
  
  -- Update 'optimize' to Optimize plan Dodo product ID
  UPDATE user_subscriptions 
  SET 
    plan_id = 'pdt_cseHYcjUQrkC7iti2ysVR',
    updated_at = NOW()
  WHERE plan_id = 'optimize';
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  RAISE NOTICE 'Updated % records from optimize to pdt_cseHYcjUQrkC7iti2ysVR', update_count;
END $$;

-- ===================================================================
-- STEP 3: Drop the old check constraint
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '=== Dropping old constraint ===';
  
  -- Drop the constraint if it exists
  ALTER TABLE public.user_subscriptions 
  DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_check;
  
  RAISE NOTICE 'Old constraint dropped';
END $$;

-- ===================================================================
-- STEP 4: Create new constraint with Dodo product IDs
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '=== Creating new constraint ===';
  
  -- Add the new constraint
  ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_plan_id_check 
  CHECK (plan_id IN (
    'pdt_euP6KahnWde9Ew1jvhIJj',  -- Learn plan
    'pdt_QT8CsZEYopzV38iWlE0Sb',  -- Track plan
    'pdt_cseHYcjUQrkC7iti2ysVR'   -- Optimize plan
  ));
  
  RAISE NOTICE 'New constraint created';
END $$;

-- Add a comment to explain the constraint
COMMENT ON CONSTRAINT user_subscriptions_plan_id_check ON user_subscriptions 
IS 'Validates plan_id matches one of the Dodo Payments product IDs: Learn (pdt_euP6KahnWde9Ew1jvhIJj), Track (pdt_QT8CsZEYopzV38iWlE0Sb), or Optimize (pdt_cseHYcjUQrkC7iti2ysVR)';

-- ===================================================================
-- STEP 5: Verify the migration
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '=== Verification ===';
END $$;

-- Check the new constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_subscriptions'::regclass
  AND conname = 'user_subscriptions_plan_id_check';

-- Check plan_id distribution after migration
SELECT 
  plan_id,
  COUNT(*) as count,
  CASE 
    WHEN plan_id = 'pdt_euP6KahnWde9Ew1jvhIJj' THEN 'Learn'
    WHEN plan_id = 'pdt_QT8CsZEYopzV38iWlE0Sb' THEN 'Track'
    WHEN plan_id = 'pdt_cseHYcjUQrkC7iti2ysVR' THEN 'Optimize'
    ELSE 'Unknown'
  END as plan_name
FROM user_subscriptions
GROUP BY plan_id
ORDER BY count DESC;

-- ===================================================================
-- Migration Complete!
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '=== ✅ Migration complete! ===';
  RAISE NOTICE 'All subscriptions now use Dodo product IDs';
  RAISE NOTICE 'New constraint accepts: pdt_euP6KahnWde9Ew1jvhIJj, pdt_QT8CsZEYopzV38iWlE0Sb, pdt_cseHYcjUQrkC7iti2ysVR';
END $$;


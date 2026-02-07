-- ============================================================================
-- MIGRATION: Update Plan IDs to Production (with Constraint Fix)
-- Date: 2026-02-03
-- COPY THIS ENTIRE SCRIPT AND PASTE IT INTO SUPABASE SQL EDITOR
-- ============================================================================

BEGIN;

-- Step 1: Drop the old check constraint that blocks the migration
DO $$
BEGIN
  ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_check;
  RAISE NOTICE '✅ Step 1: Dropped old check constraint';
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'ℹ️  Step 1: No constraint to drop, continuing...';
END $$;

-- Step 2: Show current state
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 Step 2: Current plan IDs before migration:';
END $$;

SELECT
  plan_id,
  COUNT(*) as count,
  CASE
    WHEN plan_id = 'pdt_euP6KahnWde9Ew1jvhIJj' THEN '(Learn - OLD)'
    WHEN plan_id = 'pdt_QT8CsZEYopzV38iWlE0Sb' THEN '(Track - OLD)'
    WHEN plan_id = 'pdt_cseHYcjUQrkC7iti2ysVR' THEN '(Optimize - OLD)'
    ELSE '(Unknown)'
  END as plan_name
FROM user_subscriptions
GROUP BY plan_id
ORDER BY plan_id;

-- Step 3: Update plan IDs from old to new
DO $$
DECLARE
  learn_count INTEGER;
  track_count INTEGER;
  optimize_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 Step 3: Updating plan IDs...';

  -- Update Learn plan
  UPDATE user_subscriptions
  SET
    plan_id = 'pdt_0NVzLG1q7MTDYaO5KluZr',
    updated_at = NOW()
  WHERE plan_id = 'pdt_euP6KahnWde9Ew1jvhIJj';
  GET DIAGNOSTICS learn_count = ROW_COUNT;
  RAISE NOTICE '   ✅ Learn: % subscriptions updated', learn_count;

  -- Update Track plan
  UPDATE user_subscriptions
  SET
    plan_id = 'pdt_0NVzLQtP39PxN3StTeSUD',
    updated_at = NOW()
  WHERE plan_id = 'pdt_QT8CsZEYopzV38iWlE0Sb';
  GET DIAGNOSTICS track_count = ROW_COUNT;
  RAISE NOTICE '   ✅ Track: % subscriptions updated', track_count;

  -- Update Optimize plan
  UPDATE user_subscriptions
  SET
    plan_id = 'pdt_0NVzLjKPEFGIYMmqDQ4mS',
    updated_at = NOW()
  WHERE plan_id = 'pdt_cseHYcjUQrkC7iti2ysVR';
  GET DIAGNOSTICS optimize_count = ROW_COUNT;
  RAISE NOTICE '   ✅ Optimize: % subscriptions updated', optimize_count;
END $$;

-- Step 4: Show final state
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 Step 4: Plan IDs after migration:';
END $$;

SELECT
  plan_id,
  COUNT(*) as count,
  CASE
    WHEN plan_id = 'pdt_0NVzLG1q7MTDYaO5KluZr' THEN '(Learn - PRODUCTION)'
    WHEN plan_id = 'pdt_0NVzLQtP39PxN3StTeSUD' THEN '(Track - PRODUCTION)'
    WHEN plan_id = 'pdt_0NVzLjKPEFGIYMmqDQ4mS' THEN '(Optimize - PRODUCTION)'
    ELSE '(UNKNOWN - ERROR!)'
  END as plan_name
FROM user_subscriptions
GROUP BY plan_id
ORDER BY plan_id;

-- Step 5: Add new check constraint with production plan IDs
ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_plan_id_check
CHECK (plan_id IN (
  'pdt_0NVzLG1q7MTDYaO5KluZr',  -- Learn (production)
  'pdt_0NVzLQtP39PxN3StTeSUD',  -- Track (production)
  'pdt_0NVzLjKPEFGIYMmqDQ4mS'   -- Optimize (production)
));

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Step 5: Added new check constraint with production plan IDs';
END $$;

-- Step 6: Verify no old IDs remain
DO $$
DECLARE
  old_id_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_id_count
  FROM user_subscriptions
  WHERE plan_id IN (
    'pdt_euP6KahnWde9Ew1jvhIJj',
    'pdt_QT8CsZEYopzV38iWlE0Sb',
    'pdt_cseHYcjUQrkC7iti2ysVR'
  );

  IF old_id_count > 0 THEN
    RAISE EXCEPTION '❌ ERROR: % subscriptions still have old plan IDs!', old_id_count;
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅✅✅ MIGRATION COMPLETED SUCCESSFULLY! ✅✅✅';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'All subscriptions now use production plan IDs';
    RAISE NOTICE 'New constraint enforces production IDs only';
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and click "Run"
-- 4. Review the output to confirm success
-- 5. Test your trial upgrade at https://doserapp.com/pricing
-- ============================================================================

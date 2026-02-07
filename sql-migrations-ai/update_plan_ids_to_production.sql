-- Migration: Update Plan IDs to Production Dodo Payments IDs
-- Date: 2026-02-03
-- Purpose: Replace old/test plan IDs with correct production Dodo Payments product IDs
--
-- Background: The database contains old plan IDs that don't exist in Dodo Payments production.
-- This migration updates all subscriptions to use the correct production plan IDs.

-- Old Plan IDs → New Production Plan IDs:
-- pdt_euP6KahnWde9Ew1jvhIJj (Learn - old) → pdt_0NVzLG1q7MTDYaO5KluZr (Learn - production)
-- pdt_QT8CsZEYopzV38iWlE0Sb (Track - old) → pdt_0NVzLQtP39PxN3StTeSUD (Track - production)
-- pdt_cseHYcjUQrkC7iti2ysVR (Optimize - old) → pdt_0NVzLjKPEFGIYMmqDQ4mS (Optimize - production)

BEGIN;

-- Show current state before migration
DO $$
BEGIN
  RAISE NOTICE '=== Before Migration ===';
END $$;

SELECT
  plan_id,
  COUNT(*) as subscription_count,
  CASE
    WHEN plan_id = 'pdt_euP6KahnWde9Ew1jvhIJj' THEN 'Learn (OLD)'
    WHEN plan_id = 'pdt_QT8CsZEYopzV38iWlE0Sb' THEN 'Track (OLD)'
    WHEN plan_id = 'pdt_cseHYcjUQrkC7iti2ysVR' THEN 'Optimize (OLD)'
    WHEN plan_id = 'pdt_0NVzLG1q7MTDYaO5KluZr' THEN 'Learn (NEW)'
    WHEN plan_id = 'pdt_0NVzLQtP39PxN3StTeSUD' THEN 'Track (NEW)'
    WHEN plan_id = 'pdt_0NVzLjKPEFGIYMmqDQ4mS' THEN 'Optimize (NEW)'
    ELSE 'Unknown'
  END as plan_name
FROM user_subscriptions
GROUP BY plan_id
ORDER BY plan_id;

-- Update Learn plan (old → new)
UPDATE user_subscriptions
SET
  plan_id = 'pdt_0NVzLG1q7MTDYaO5KluZr',
  updated_at = NOW()
WHERE plan_id = 'pdt_euP6KahnWde9Ew1jvhIJj';

-- Update Track plan (old → new)
UPDATE user_subscriptions
SET
  plan_id = 'pdt_0NVzLQtP39PxN3StTeSUD',
  updated_at = NOW()
WHERE plan_id = 'pdt_QT8CsZEYopzV38iWlE0Sb';

-- Update Optimize plan (old → new)
UPDATE user_subscriptions
SET
  plan_id = 'pdt_0NVzLjKPEFGIYMmqDQ4mS',
  updated_at = NOW()
WHERE plan_id = 'pdt_cseHYcjUQrkC7iti2ysVR';

-- Show results after migration
DO $$
BEGIN
  RAISE NOTICE '=== After Migration ===';
END $$;

SELECT
  plan_id,
  COUNT(*) as subscription_count,
  CASE
    WHEN plan_id = 'pdt_0NVzLG1q7MTDYaO5KluZr' THEN 'Learn (PRODUCTION)'
    WHEN plan_id = 'pdt_0NVzLQtP39PxN3StTeSUD' THEN 'Track (PRODUCTION)'
    WHEN plan_id = 'pdt_0NVzLjKPEFGIYMmqDQ4mS' THEN 'Optimize (PRODUCTION)'
    ELSE 'Unknown - NEEDS ATTENTION'
  END as plan_name
FROM user_subscriptions
GROUP BY plan_id
ORDER BY plan_id;

-- Verify no old plan IDs remain
DO $$
DECLARE
  old_plan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_plan_count
  FROM user_subscriptions
  WHERE plan_id IN (
    'pdt_euP6KahnWde9Ew1jvhIJj',
    'pdt_QT8CsZEYopzV38iWlE0Sb',
    'pdt_cseHYcjUQrkC7iti2ysVR'
  );

  IF old_plan_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % subscriptions still have old plan IDs', old_plan_count;
  ELSE
    RAISE NOTICE '✅ Migration successful! All subscriptions updated to production plan IDs.';
  END IF;
END $$;

COMMIT;

-- Instructions:
-- 1. Run this in your Supabase SQL Editor (production database)
-- 2. Review the "Before" and "After" output
-- 3. Verify all subscriptions now use production plan IDs
-- 4. Test subscription operations (upgrade, cancel, etc.)

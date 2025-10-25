-- Fix plan_id check constraint in user_subscriptions table
-- The constraint was expecting lowercase plan names ('learn', 'track', 'optimize')
-- but the application now uses Dodo product IDs ('pdt_...')

-- First, let's check what constraint exists
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_subscriptions'::regclass
  AND conname LIKE '%plan_id%';

-- Drop the old check constraint if it exists
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_check;

-- Add a new check constraint that allows the Dodo product IDs
-- These are the actual product IDs from your SUBSCRIPTION_PLANS array
ALTER TABLE public.user_subscriptions
ADD CONSTRAINT user_subscriptions_plan_id_check 
CHECK (plan_id IN (
  'pdt_euP6KahnWde9Ew1jvhIJj',  -- Learn plan
  'pdt_QT8CsZEYopzV38iWlE0Sb',  -- Track plan
  'pdt_cseHYcjUQrkC7iti2ysVR'   -- Optimize plan
));

-- Add a comment to explain the constraint
COMMENT ON CONSTRAINT user_subscriptions_plan_id_check ON user_subscriptions 
IS 'Validates plan_id matches one of the Dodo Payments product IDs for Learn, Track, or Optimize plans';

-- Verify the constraint was added
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_subscriptions'::regclass
  AND conname = 'user_subscriptions_plan_id_check';


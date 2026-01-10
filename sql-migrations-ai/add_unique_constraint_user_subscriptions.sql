-- Add UNIQUE constraint to user_id in user_subscriptions table
-- This is required for the upsert operation to work correctly
-- Each user should only have one active subscription record

-- First, check if there are any duplicate user_ids and clean them up
-- Keep only the most recent subscription for each user
DO $$
DECLARE
    duplicate_record RECORD;
BEGIN
    FOR duplicate_record IN 
        SELECT user_id, COUNT(*) as count
        FROM user_subscriptions
        GROUP BY user_id
        HAVING COUNT(*) > 1
    LOOP
        -- Delete all but the most recent subscription for this user
        DELETE FROM user_subscriptions
        WHERE user_id = duplicate_record.user_id
        AND id NOT IN (
            SELECT id
            FROM user_subscriptions
            WHERE user_id = duplicate_record.user_id
            ORDER BY updated_at DESC
            LIMIT 1
        );
        
        RAISE NOTICE 'Cleaned up % duplicate subscriptions for user %', 
            duplicate_record.count - 1, duplicate_record.user_id;
    END LOOP;
END $$;

-- Now add the UNIQUE constraint
-- Note: This will fail if there are still duplicates, which means the cleanup above didn't work
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id);

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT user_subscriptions_user_id_unique ON user_subscriptions 
IS 'Ensures each user can only have one subscription record. Required for upsert operations in webhook handlers.';

-- Verify the constraint was added
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'user_subscriptions_user_id_unique';


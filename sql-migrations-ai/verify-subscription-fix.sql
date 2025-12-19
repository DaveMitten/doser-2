-- Verification script for subscription update fix
-- Run this in Supabase SQL Editor to verify the fix was applied correctly

-- ============================================================
-- 1. CHECK IF UNIQUE CONSTRAINT EXISTS
-- ============================================================
SELECT 
    '✅ UNIQUE constraint check' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_constraint 
            WHERE conrelid = 'user_subscriptions'::regclass
            AND conname = 'user_subscriptions_user_id_unique'
            AND contype = 'u'
        ) THEN '✅ UNIQUE constraint on user_id EXISTS'
        ELSE '❌ UNIQUE constraint on user_id MISSING - Run add_unique_constraint_user_subscriptions.sql'
    END as result;

-- ============================================================
-- 2. CHECK FOR DUPLICATE user_id ENTRIES
-- ============================================================
SELECT 
    '✅ Duplicate check' as test,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No duplicate user_id entries found'
        ELSE '❌ Found ' || COUNT(*) || ' users with duplicate subscriptions!'
    END as result
FROM (
    SELECT user_id, COUNT(*) as count
    FROM user_subscriptions
    GROUP BY user_id
    HAVING COUNT(*) > 1
) duplicates;

-- ============================================================
-- 3. LIST ALL SUBSCRIPTIONS (if any)
-- ============================================================
SELECT 
    '📋 Current subscriptions' as info,
    COUNT(*) as total_subscriptions,
    COUNT(DISTINCT user_id) as unique_users,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT user_id) THEN '✅ One subscription per user'
        ELSE '⚠️ Multiple subscriptions detected for some users'
    END as status
FROM user_subscriptions;

-- ============================================================
-- 4. CHECK RLS POLICIES
-- ============================================================
SELECT 
    '🔒 RLS Policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression
FROM pg_policies
WHERE tablename = 'user_subscriptions'
ORDER BY policyname;

-- ============================================================
-- 5. CHECK IF TABLE HAS ROW LEVEL SECURITY ENABLED
-- ============================================================
SELECT 
    '🔒 RLS Status' as info,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS is ENABLED'
        ELSE '❌ RLS is DISABLED'
    END as rls_status
FROM pg_tables
WHERE tablename = 'user_subscriptions';

-- ============================================================
-- 6. SHOW SAMPLE SUBSCRIPTION (if exists)
-- ============================================================
SELECT 
    '📄 Sample subscription' as info,
    user_id,
    plan_id,
    status,
    dodo_subscription_id,
    dodo_customer_id,
    current_period_start,
    current_period_end,
    trial_start,
    trial_end,
    created_at,
    updated_at
FROM user_subscriptions
ORDER BY updated_at DESC
LIMIT 1;

-- ============================================================
-- 7. CHECK INDEXES ON user_subscriptions
-- ============================================================
SELECT 
    '🔍 Indexes' as info,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'user_subscriptions'
ORDER BY indexname;

-- ============================================================
-- SUMMARY
-- ============================================================
SELECT 
    '📊 Summary' as info,
    (SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = 'user_subscriptions'::regclass
            AND conname = 'user_subscriptions_user_id_unique'
        ) THEN '✅' ELSE '❌' END
    ) as unique_constraint,
    (SELECT CASE 
        WHEN COUNT(*) = 0 THEN '✅' ELSE '❌' END
        FROM (
            SELECT user_id FROM user_subscriptions 
            GROUP BY user_id HAVING COUNT(*) > 1
        ) d
    ) as no_duplicates,
    (SELECT CASE 
        WHEN rowsecurity THEN '✅' ELSE '❌' END
        FROM pg_tables WHERE tablename = 'user_subscriptions'
    ) as rls_enabled,
    (SELECT COUNT(*)::text || ' subscriptions' 
        FROM user_subscriptions
    ) as total_records;


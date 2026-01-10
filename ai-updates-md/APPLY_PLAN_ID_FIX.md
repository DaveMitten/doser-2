# Quick Fix: Apply Plan ID Constraint Update

## Problem

Webhooks are failing with: `violates check constraint "user_subscriptions_plan_id_check"`

## Solution

Run the migration script to update the database constraint.

## Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of `migrate_plan_ids.sql`
4. Paste and run it
5. Check the output for success messages

### Option 2: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd /Users/davidmitten/Documents/dev/side-projects/doser-2

# Run the migration
supabase db execute -f migrate_plan_ids.sql
```

## What This Does

1. ✅ Finds all subscriptions with old plan IDs (`'learn'`, `'track'`, `'optimize'`)
2. ✅ Updates them to use Dodo product IDs (`'pdt_...'`)
3. ✅ Drops the old constraint
4. ✅ Creates a new constraint that accepts Dodo product IDs
5. ✅ Verifies the migration was successful

## After Migration

### Test the Webhook

1. Trigger a test subscription event from Dodo Payments dashboard
2. Check your application logs - the error should be gone
3. Verify the subscription was created in the database:
   ```sql
   SELECT id, user_id, plan_id, status, dodo_subscription_id
   FROM user_subscriptions
   ORDER BY created_at DESC
   LIMIT 5;
   ```

### Expected Results

- ✅ No more constraint violation errors
- ✅ Webhooks process successfully
- ✅ All plan_id values use Dodo product IDs format

## Rollback (If Needed)

If you need to rollback (not recommended):

```sql
-- Drop the new constraint
ALTER TABLE user_subscriptions
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_check;

-- Recreate the old constraint (only if you're reverting the entire system)
ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_plan_id_check
CHECK (plan_id IN ('learn', 'track', 'optimize'));
```

## Valid Plan IDs After Migration

Your application now uses these Dodo product IDs:

| Plan Name | Product ID                  |
| --------- | --------------------------- |
| Learn     | `pdt_euP6KahnWde9Ew1jvhIJj` |
| Track     | `pdt_QT8CsZEYopzV38iWlE0Sb` |
| Optimize  | `pdt_cseHYcjUQrkC7iti2ysVR` |

These match your `SUBSCRIPTION_PLANS` array in `src/lib/dodo-types.ts`.

## Support

If you encounter any issues:

1. Check the Supabase logs for detailed error messages
2. Run the verification queries in `fix_plan_id_constraint.sql`
3. Review the full documentation in `PLAN_ID_CONSTRAINT_FIX.md`

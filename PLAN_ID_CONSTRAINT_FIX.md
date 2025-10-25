# Plan ID Constraint Fix

## Issue

The application is receiving this error when webhooks try to create/update subscriptions:

```
Error: Failed to upsert subscription: new row for relation "user_subscriptions" violates check constraint "user_subscriptions_plan_id_check"
```

## Root Cause

The `user_subscriptions` table has a CHECK constraint on the `plan_id` column that expects lowercase plan names (`'learn'`, `'track'`, `'optimize'`), but the application code is now using the actual Dodo Payments product IDs (e.g., `'pdt_QT8CsZEYopzV38iWlE0Sb'`).

### Where the mismatch occurred:

1. **Old system** (in `simplify_trial_system.sql`):

   - Used simple string identifiers: `'learn'`, `'track'`, `'optimize'`
   - Database constraint validated against these values

2. **Current system** (in `src/lib/dodo-types.ts`):
   - Uses actual Dodo product IDs:
     - Learn: `'pdt_euP6KahnWde9Ew1jvhIJj'`
     - Track: `'pdt_QT8CsZEYopzV38iWlE0Sb'`
     - Optimize: `'pdt_cseHYcjUQrkC7iti2ysVR'`

## Solution

Run the migration script to update the database constraint to accept the Dodo product IDs.

### Steps to Fix

1. **Apply the migration:**

   ```bash
   # Run this in your Supabase SQL Editor
   # or use the Supabase CLI
   ```

   Execute the SQL in `fix_plan_id_constraint.sql`

2. **Update existing subscriptions (if any exist with old plan IDs):**

   ```sql
   -- If you have existing subscriptions with old plan IDs, update them:
   UPDATE user_subscriptions
   SET plan_id = 'pdt_QT8CsZEYopzV38iWlE0Sb'
   WHERE plan_id = 'track';

   UPDATE user_subscriptions
   SET plan_id = 'pdt_euP6KahnWde9Ew1jvhIJj'
   WHERE plan_id = 'learn';

   UPDATE user_subscriptions
   SET plan_id = 'pdt_cseHYcjUQrkC7iti2ysVR'
   WHERE plan_id = 'optimize';
   ```

3. **Verify the fix:**
   ```sql
   -- Check the constraint definition
   SELECT
     conname AS constraint_name,
     pg_get_constraintdef(oid) AS constraint_definition
   FROM pg_constraint
   WHERE conrelid = 'public.user_subscriptions'::regclass
     AND conname = 'user_subscriptions_plan_id_check';
   ```

## Files Modified

1. **`fix_plan_id_constraint.sql`** (NEW)

   - Migration script to fix the constraint

2. **`simplify_trial_system.sql`** (UPDATED)
   - Changed default plan_id from `'track'` to `'pdt_QT8CsZEYopzV38iWlE0Sb'`
   - This ensures new user signups get the correct Dodo product ID

## Testing

After applying the migration:

1. Test webhook processing:

   - Trigger a subscription.active webhook from Dodo Payments
   - Verify no constraint violation errors

2. Test new user signup:

   - Create a new account
   - Verify the user_subscriptions record has the correct Dodo product ID

3. Check existing subscriptions:
   ```sql
   SELECT id, user_id, plan_id, status
   FROM user_subscriptions;
   ```

## Prevention

To prevent this issue in the future:

1. Always use the Dodo product IDs defined in `src/lib/dodo-types.ts` for plan identification
2. When creating database constraints, reference the actual values used in the application code
3. Add integration tests that verify webhook handling with real product IDs

## Related Files

- `src/lib/dodo-types.ts` - Defines SUBSCRIPTION_PLANS with Dodo product IDs
- `src/lib/dodo-service.ts` - Uses plan IDs when creating subscriptions
- `simplify_trial_system.sql` - Auto-creates subscriptions for new users
- `database.types.ts` - TypeScript types for database tables

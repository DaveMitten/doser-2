# Subscription Database Update Fix

## Problem

The subscription update was failing because the `user_subscriptions` table was missing a UNIQUE constraint on `user_id`, but the code was trying to perform an upsert with `onConflict: "user_id"`.

### Why This Fails

Supabase's `upsert()` with `onConflict` requires the specified column(s) to have a UNIQUE constraint in the database. Without it:

- PostgreSQL doesn't know which row to update
- The upsert defaults to INSERT behavior
- This can create duplicate rows or fail silently

## The Fix

### 1. Add UNIQUE Constraint to Database

Run the migration file to add the unique constraint:

```bash
# Apply the migration using Supabase SQL Editor
# Copy and paste the contents of add_unique_constraint_user_subscriptions.sql
```

Or using Supabase CLI:

```bash
supabase db push --file add_unique_constraint_user_subscriptions.sql
```

### 2. Enhanced Logging

The code has been updated with detailed logging to help debug any future issues:

```typescript
// Before upsert
console.log("🔄 Attempting upsert to user_subscriptions table...");
console.log("  - user_id:", userId);
console.log("  - dodo_subscription_id:", subscriptionId);
console.log("  - plan_id:", planId);
console.log("  - status:", subscriptionStatus);

// After upsert
if (data) {
  console.log("✅ Upsert successful! Returned data:", data);
}
```

## Testing the Fix

### Step 1: Apply the Migration

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `add_unique_constraint_user_subscriptions.sql`
4. Run the migration
5. Verify no errors occur

### Step 2: Test Subscription Creation

1. Start your dev server with webhook tunnel:

   ```bash
   npm run dev
   ```

2. Go to your pricing page and subscribe to a plan

3. Monitor the console logs for:
   ```
   🔄 Attempting upsert to user_subscriptions table...
     - user_id: <uuid>
     - dodo_subscription_id: <dodo_sub_id>
     - plan_id: <plan_id>
     - status: active
   ✅ Upsert successful! Returned data: [...]
   ```

### Step 3: Verify Database Update

Check the database to confirm the subscription was created:

```sql
SELECT * FROM user_subscriptions
WHERE user_id = '<your_user_id>';
```

You should see:

- ✅ A row with your user_id
- ✅ The correct plan_id
- ✅ Status matching what Dodo sent (active/trialing)
- ✅ dodo_subscription_id populated
- ✅ dodo_customer_id populated

### Step 4: Test Subscription Update

Trigger another webhook (or update an existing subscription) and verify:

- No duplicate rows are created
- The existing row is updated with new data
- Logs show "✅ Upsert successful!"

## Common Issues and Solutions

### Issue: Migration fails with "duplicate key value violates unique constraint"

**Cause**: You already have duplicate user_id entries in the table.

**Solution**: The migration script includes cleanup logic, but if it fails:

```sql
-- Manually check for duplicates
SELECT user_id, COUNT(*) as count
FROM user_subscriptions
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Delete duplicates, keeping only the most recent
DELETE FROM user_subscriptions
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM user_subscriptions
    ORDER BY user_id, updated_at DESC
);

-- Then run the migration again
ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id);
```

### Issue: Webhook still doesn't update database

**Possible causes**:

1. Service role key not configured
2. RLS policies blocking service role
3. Webhook not reaching your server

**Debugging steps**:

1. **Check service role key**:

   ```bash
   # Verify it's set in your environment
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Check webhook is being received**:

   - Look for `"Webhook onSubscriptionActive received:"` in logs
   - If not appearing, webhook isn't reaching your server

3. **Check for errors in logs**:

   ```bash
   # Look for these patterns
   "❌ Webhook processing failed:"
   "Failed to upsert subscription:"
   ```

4. **Test service role client manually**:
   ```typescript
   // Add this temporarily to test
   const supabase = createSupabaseServiceClient();
   const { data, error } = await supabase
     .from("user_subscriptions")
     .select("*")
     .limit(1);
   console.log("Service role test:", { data, error });
   ```

### Issue: Error "column user_id is not a unique constraint"

**Cause**: The UNIQUE constraint wasn't applied successfully.

**Solution**:

```sql
-- Check if constraint exists
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'user_subscriptions'::regclass
AND conname = 'user_subscriptions_user_id_unique';

-- If not found, apply it
ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id);
```

## Verification Checklist

After applying the fix, verify:

- [ ] Migration applied successfully without errors
- [ ] UNIQUE constraint exists on `user_id` column
- [ ] Webhook receives subscription.active events
- [ ] Console shows "🔄 Attempting upsert..." messages
- [ ] Console shows "✅ Upsert successful!" messages
- [ ] Database has subscription record with correct data
- [ ] No duplicate user_id entries in table
- [ ] User can access paid features after subscription
- [ ] TrialStatusBanner updates to show subscription active

## Production Deployment

Once tested locally:

1. **Apply migration to production database**:

   - Go to Supabase Dashboard (production project)
   - Run the migration SQL in SQL Editor
   - Verify constraint was added

2. **Deploy code changes**:

   ```bash
   git add src/lib/dodo-service.ts
   git commit -m "fix: add logging and return data from subscription upsert"
   git push origin main
   ```

3. **Monitor production**:
   - Watch Vercel logs for webhook processing
   - Check Sentry for any errors
   - Verify real subscriptions are being created

## Additional Notes

### Why One Subscription Per User?

The UNIQUE constraint on `user_id` enforces a business rule: **each user can only have one active subscription**. This is the correct behavior because:

- Users upgrade/downgrade by changing their existing subscription
- Users don't have multiple simultaneous subscriptions
- Historical subscriptions are tracked in `payment_history` table

If your business logic requires multiple subscriptions per user, you would need to:

1. Remove the UNIQUE constraint
2. Change the upsert to use a different conflict target (e.g., `dodo_subscription_id`)
3. Update the application logic to handle multiple subscriptions

### Performance Considerations

The UNIQUE constraint also creates an index on `user_id`, which improves query performance for:

- Looking up user's subscription: `WHERE user_id = ?`
- Upsert operations during webhook processing
- Checking subscription status in middleware

## Related Files

- `add_unique_constraint_user_subscriptions.sql` - Migration file
- `src/lib/dodo-service.ts` - Updated webhook handler
- `src/lib/supabase-server.ts` - Service role client
- `dodo-payments-migration.sql` - Original Dodo setup migration

## Need Help?

If issues persist:

1. Check Vercel logs for webhook processing
2. Check Sentry for error details
3. Verify Supabase RLS policies
4. Ensure service role key is configured
5. Test webhook delivery from Dodo dashboard

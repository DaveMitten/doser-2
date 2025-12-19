# Quick Start: Fix Subscription Database Update

## The Problem

Your subscription updates weren't working because the database table was missing a **UNIQUE constraint** on the `user_id` column, but your code was trying to use `user_id` for upsert conflict resolution.

## The Solution (3 Steps)

### Step 1: Apply Database Migration ⚡️

1. **Open Supabase Dashboard**

   - Go to https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" in the left sidebar

2. **Run the migration**

   - Copy ALL contents from `add_unique_constraint_user_subscriptions.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Wait for "Success" message

3. **Verify it worked**
   - Copy ALL contents from `verify-subscription-fix.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Look for ✅ symbols in the results

Expected output:

```
✅ UNIQUE constraint on user_id EXISTS
✅ No duplicate user_id entries found
✅ One subscription per user
✅ RLS is ENABLED
```

### Step 2: Deploy Code Changes 🚀

The code has already been updated with better logging. Just deploy:

```bash
# Stage changes
git add src/lib/dodo-service.ts
git add add_unique_constraint_user_subscriptions.sql
git add verify-subscription-fix.sql
git add SUBSCRIPTION_UPDATE_FIX.md
git add QUICK_START_FIX.md

# Commit
git commit -m "fix: add UNIQUE constraint for subscription upserts and improve logging"

# Push (auto-deploys if using Vercel)
git push origin main
```

### Step 3: Test It Works ✅

1. **Start your dev server**

   ```bash
   npm run dev
   ```

2. **Subscribe to a plan**

   - Go to http://localhost:3000/pricing
   - Click "Subscribe" on any paid plan
   - Complete payment in Dodo Payments

3. **Watch the logs** - You should see:

   ```
   Webhook onSubscriptionActive received: {...}
   🔄 Attempting upsert to user_subscriptions table...
     - user_id: <your-uuid>
     - dodo_subscription_id: sub_xxx
     - plan_id: pro
     - status: active
   ✅ Upsert successful! Returned data: [...]
   ✅ Webhook processed successfully
   ```

4. **Verify in database**

   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM user_subscriptions WHERE user_id = '<your-user-id>';
   ```

   Should return:

   - ✅ One row with your subscription
   - ✅ Correct `plan_id`
   - ✅ Status = 'active' or 'trialing'
   - ✅ `dodo_subscription_id` filled in

## What Changed?

### Database

- ✅ Added UNIQUE constraint on `user_id` column
- ✅ Cleaned up any duplicate subscriptions first
- ✅ Created index for better query performance

### Code (`src/lib/dodo-service.ts`)

- ✅ Added detailed logging before upsert
- ✅ Added `.select()` to return upserted data
- ✅ Added success logging after upsert
- ✅ Fixed variable naming conflict

## Troubleshooting

### Migration fails with "duplicate key" error

Some users have multiple subscriptions. Run this first:

```sql
-- Find duplicates
SELECT user_id, COUNT(*)
FROM user_subscriptions
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Keep only the most recent for each user
DELETE FROM user_subscriptions
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM user_subscriptions
    ORDER BY user_id, updated_at DESC
);

-- Now run the migration again
```

### Webhook still doesn't update

Check these in order:

1. **Is SUPABASE_SERVICE_ROLE_KEY set?**

   ```bash
   # Check locally
   grep SUPABASE_SERVICE_ROLE_KEY .env.local

   # Check on Vercel (if deployed)
   # Go to Vercel Dashboard → Settings → Environment Variables
   ```

2. **Is webhook reaching your server?**

   - Look for `"Webhook onSubscriptionActive received:"` in logs
   - If missing, check Dodo webhook URL is correct

3. **Any errors in logs?**

   - Look for `"❌ Webhook processing failed:"`
   - Look for `"Failed to upsert subscription:"`
   - Check Sentry dashboard

4. **Is RLS blocking the service role?**

   ```sql
   -- Check policies allow service role
   SELECT * FROM pg_policies WHERE tablename = 'user_subscriptions';

   -- Should have: "Service can manage subscriptions" policy
   ```

### User can't see subscription in app

If database has the subscription but user can't see it:

1. **Check RLS policies allow user to read their own data**

   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'user_subscriptions'
   AND cmd = 'SELECT';
   ```

2. **Verify user is authenticated**

   - Check browser console for auth errors
   - User might need to logout/login

3. **Clear cache and refresh**
   ```bash
   # In browser console
   localStorage.clear()
   sessionStorage.clear()
   # Then refresh page
   ```

## Still Having Issues?

1. **Check all logs**:

   - Browser console (F12)
   - Terminal/dev server output
   - Vercel logs (if deployed)
   - Sentry dashboard

2. **Run verification query**:

   ```sql
   -- In Supabase SQL Editor
   \i verify-subscription-fix.sql
   ```

3. **Test webhook manually** in Dodo dashboard:

   - Go to Dodo Payments dashboard
   - Navigate to Webhooks
   - Find your webhook
   - Click "Send test event"
   - Choose "subscription.active"

4. **Enable verbose logging**:
   ```typescript
   // Temporarily add to dodo-service.ts
   console.log("FULL WEBHOOK PAYLOAD:", JSON.stringify(payload, null, 2));
   console.log(
     "FULL USER SUBSCRIPTION:",
     JSON.stringify(userSubscription, null, 2)
   );
   ```

## Success Indicators

You'll know it's working when:

1. ✅ Logs show "✅ Upsert successful!"
2. ✅ Database has subscription row
3. ✅ User can access paid features
4. ✅ TrialStatusBanner shows correct status
5. ✅ No Sentry errors
6. ✅ Subsequent webhooks update (not duplicate) the row

## Next Steps

After fixing:

1. ✅ Test on production with real payment
2. ✅ Monitor Sentry for any new errors
3. ✅ Set up alerts for webhook failures
4. ✅ Document your subscription flow

## Files Reference

- `add_unique_constraint_user_subscriptions.sql` - Database migration
- `verify-subscription-fix.sql` - Verification queries
- `SUBSCRIPTION_UPDATE_FIX.md` - Detailed documentation
- `src/lib/dodo-service.ts` - Updated webhook handler

---

**Need more help?** Check `SUBSCRIPTION_UPDATE_FIX.md` for detailed explanations and advanced troubleshooting.

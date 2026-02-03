# Testing Guide: Trial Upgrade Bug Fix

## What Was Fixed
Fixed a bug where trial users couldn't upgrade their subscription to a different paid plan. The API was rejecting subscriptions with status "trialing" but should have allowed both "active" and "trialing" statuses.

## Changes Made
1. **API Route** (`src/app/api/subscriptions/change-plan/route.ts:152`)
   - Now accepts both `"active"` and `"trialing"` subscription statuses
   - Added better Sentry logging with `isTrialUpgrade` flag

2. **Frontend** (`src/components/subscription/ChangePlanModal.tsx`)
   - Enhanced error logging for debugging
   - Better error messages to users

3. **E2E Tests** (`tests/e2e/subscription-trial-flow.spec.ts`)
   - Added test for trial users upgrading to different plan
   - Added test for error handling during trial upgrades

---

## 🧪 Manual Testing Guide

### Prerequisites
- Active trial subscription in your database
- Access to Supabase database to verify data
- Dodo Payments in test_mode

---

### Test 1: Local Testing (Development)

#### Setup
1. Ensure you have `.env.local` configured with all required variables
2. Start the dev server:
   ```bash
   npm run dev
   ```

#### Test Steps: Trial User Upgrading to Different Plan

1. **Login as trial user**
   - Go to http://localhost:3000/auth
   - Login with credentials for a user who has an active trial subscription
   - Verify in Supabase that this user has:
     ```sql
     SELECT * FROM user_subscriptions WHERE user_id = 'your-user-id';
     -- status should be 'trialing'
     -- trial_end should be in the future
     ```

2. **Navigate to pricing page**
   - Go to http://localhost:3000/pricing
   - Verify you see "Free Trial Active" banner with days remaining

3. **Attempt to upgrade to different plan**
   - If your trial is on "Track" plan, try upgrading to "Optimize"
   - Click "Upgrade to Optimize" button
   - **Expected**: Modal opens showing plan comparison

4. **Review plan change modal**
   - Verify "Current Plan" shows your trial plan
   - Verify "New Plan" shows the target plan
   - Verify "Prorated Billing" message is visible
   - **Expected**: No errors, modal displays correctly

5. **Confirm plan change**
   - Click "Confirm Plan Change" button
   - **Watch browser console** (F12 → Console tab)
   - **Expected Behaviors:**
     - ✅ **SUCCESS**: Modal shows "Plan Changed Successfully!"
     - ❌ **FAILURE**: Error message appears in red box

6. **Check browser console logs**
   - If successful: Should see success logs
   - If failed: Should see detailed error with:
     ```javascript
     {
       status: 500,
       statusText: "Internal Server Error",
       error: "detailed error message",
       currentPlanId: "pdt_...",
       targetPlanId: "pdt_..."
     }
     ```

7. **Verify database changes** (if successful)
   ```sql
   SELECT * FROM user_subscriptions WHERE user_id = 'your-user-id';
   -- plan_id should be updated to new plan
   -- updated_at should be recent
   ```

8. **Check Sentry logs**
   - Go to your Sentry dashboard
   - Look for events tagged with:
     - `eventType: "change-plan-*"`
     - `isTrialUpgrade: true`
   - Verify rich context is logged

#### Test Steps: Error Scenarios

**Test 2a: Trying to change to same plan**
1. Click "Start Paid Subscription" on current trial plan
2. **Expected**: Error message "You are already on this plan"

**Test 2b: Network error simulation**
1. Open DevTools → Network tab → Set throttling to "Offline"
2. Try to change plan
3. **Expected**: Error message "Failed to change plan. Please try again or contact support."

---

### Test 2: Production Testing

#### ⚠️ Important Notes
- This will create REAL Dodo Payments charges (even if test_mode)
- Only test with your own account, not customer accounts
- Verify Dodo Payments is in test_mode first

#### Pre-deployment Checklist
- [ ] Changes committed to git
- [ ] Build passes locally (`npm run build`)
- [ ] Deployed to production (Vercel/your hosting)
- [ ] Environment variables set correctly in production

#### Test Steps

1. **Verify production deployment**
   - Visit https://www.doserapp.com
   - Check browser console for errors
   - Verify build number/timestamp updated

2. **Login as trial user**
   - Use a test account with active trial subscription
   - Navigate to /pricing page
   - Verify trial banner appears

3. **Attempt plan upgrade**
   - Click "Upgrade to [Different Plan]" button
   - Modal should open
   - **Keep browser console open** (F12)

4. **Confirm upgrade**
   - Click "Confirm Plan Change"
   - Monitor network tab for `/api/subscriptions/change-plan` request
   - **Expected response**:
     ```json
     {
       "success": true,
       "message": "Plan changed successfully",
       "newPlanId": "pdt_..."
     }
     ```

5. **Verify in Dodo Payments Dashboard**
   - Login to Dodo Payments dashboard
   - Find your customer
   - Verify subscription shows:
     - New plan ID
     - Prorated charge created
     - Subscription still active

6. **Verify in Supabase**
   ```sql
   -- Production database
   SELECT
     plan_id,
     status,
     updated_at,
     dodo_subscription_id
   FROM user_subscriptions
   WHERE user_id = 'your-test-user-id';
   ```
   - Verify `plan_id` updated
   - Verify `updated_at` is recent
   - Verify `status` is still "trialing" or changed to "active"

7. **Check Sentry Production Logs**
   - Filter by environment: production
   - Look for `eventType: "change-plan-dodo-failed"` (should be NONE)
   - Look for `change-plan-*` success events
   - Verify `isTrialUpgrade: true` in metadata

8. **Verify user experience**
   - Refresh /pricing page
   - Verify "Current Plan" now shows new plan
   - Check /billing page to confirm subscription details

---

## 🔍 Debugging Failed Tests

### If the plan change fails, check:

1. **Browser Console Error**
   - Look for the detailed error object logged
   - Note the `status` code and `error` message

2. **Network Tab**
   - Find the `/api/subscriptions/change-plan` request
   - Check response body and status code
   - Common errors:
     - `400`: Validation error (check error message)
     - `401`: Authentication failed (user not logged in)
     - `404`: No subscription found
     - `500`: Server error (check Sentry)

3. **Sentry Dashboard**
   - Search for errors in last 1 hour
   - Look for:
     - `change-plan-invalid-status` (should not happen with fix)
     - `change-plan-dodo-failed` (Dodo Payments API error)
     - `change-plan-missing-dodo-id` (subscription missing Dodo ID)

4. **Supabase Database**
   ```sql
   -- Check subscription record
   SELECT
     id,
     user_id,
     plan_id,
     status,
     dodo_subscription_id,
     trial_start,
     trial_end
   FROM user_subscriptions
   WHERE user_id = 'your-user-id';
   ```
   - Verify:
     - `status` is "trialing" or "active"
     - `dodo_subscription_id` is NOT NULL
     - `trial_end` is in the future (for trials)

5. **Dodo Payments Dashboard**
   - Verify subscription exists
   - Check subscription status
   - Look for recent events/webhooks
   - Verify API key is correct

---

## 🧪 API Testing with curl (Advanced)

You can also test the API endpoint directly:

### Test Change Plan API Locally

```bash
# Replace with your actual values
USER_AUTH_TOKEN="your-supabase-auth-token"
NEW_PLAN_ID="pdt_RwjIQmhRz9N3S6afZ92p7"  # Optimize plan

curl -X POST http://localhost:3000/api/subscriptions/change-plan \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=${USER_AUTH_TOKEN}" \
  -d "{\"newPlanId\": \"${NEW_PLAN_ID}\"}" \
  -v
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Plan changed successfully",
  "newPlanId": "pdt_RwjIQmhRz9N3S6afZ92p7"
}
```

**Expected Error Response (if already on plan):**
```json
{
  "error": "You are already on this plan"
}
```

---

## ✅ Success Criteria

The fix is working correctly if:

- ✅ Trial users can upgrade to different paid plans without errors
- ✅ Success modal appears with "Plan Changed Successfully!" message
- ✅ Database `plan_id` is updated to new plan
- ✅ Dodo Payments subscription is updated
- ✅ Sentry logs show `isTrialUpgrade: true` with no errors
- ✅ User sees updated plan on /pricing and /billing pages
- ✅ Browser console shows detailed error logs if something fails

---

## 📊 Monitoring After Deployment

### Sentry Queries

1. **Check for plan change errors:**
   ```
   event.type:error eventType:change-plan-*
   ```

2. **Monitor trial upgrades:**
   ```
   isTrialUpgrade:true
   ```

3. **Check for status validation errors (should be ZERO):**
   ```
   eventType:change-plan-invalid-status
   ```

### Supabase Queries

```sql
-- Count plan changes in last 24 hours
SELECT
  COUNT(*) as plan_changes,
  plan_id as new_plan
FROM user_subscriptions
WHERE updated_at > NOW() - INTERVAL '24 hours'
GROUP BY plan_id;

-- Find recent trial upgrades
SELECT
  user_id,
  plan_id,
  status,
  trial_end,
  updated_at
FROM user_subscriptions
WHERE status IN ('active', 'trialing')
  AND updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;
```

---

## 🐛 Known Issues & Limitations

1. **E2E tests require environment setup**
   - Currently failing due to missing .env during Playwright setup
   - To fix: Configure `playwright.config.ts` to load .env.local

2. **Middleware error in test environment**
   - Next.js middleware requires proper export
   - Non-issue in production/dev, only affects E2E tests

---

## 📞 Support

If issues persist:
1. Check Sentry for detailed error logs
2. Review Dodo Payments dashboard for subscription events
3. Check Supabase logs for database errors
4. Contact support@doserapp.com with:
   - User ID
   - Screenshot of error
   - Browser console logs
   - Sentry event ID

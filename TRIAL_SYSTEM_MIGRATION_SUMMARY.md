# Trial System Simplification - Implementation Summary

## Overview

Successfully simplified the trial system by removing plan selection from signup and consolidating all trial logic into the `user_subscriptions` table.

## What Was Changed

### 1. Database Changes ✅

- **Created**: `simplify_trial_system.sql` migration file
  - Removes `selected_plan`, `trial_start_date`, `trial_expired`, and `subscription_status` columns from `profiles` table
  - Updates `handle_new_user()` function to automatically create trial subscription in `user_subscriptions` table
  - Sets 7-day trial period automatically for all new users
  - Default plan: "Track"

### 2. Type Definitions Updated ✅

- **Updated**: `src/lib/database.types.ts`
  - Removed trial-related fields from `profiles` interface
  - Cleaned up Row, Insert, and Update types

### 3. Trial Service Cleanup ✅

- **Deleted**:
  - `src/lib/trial-service.ts`
  - `src/lib/useTrialStatus.ts`
  - `src/components/trial/TrialExpirationHandler.tsx`
  - `src/app/api/trial/update-status/route.ts`

### 4. Subscription Hook Enhanced ✅

- **Updated**: `src/lib/useSubscription.ts`
  - Added trial status helpers:
    - `isTrialActive`: Checks if trial is currently active
    - `isTrialExpired`: Checks if trial has expired
    - `daysRemaining`: Calculates days left in trial
    - `trialEndsAt`: Returns trial end date

### 5. New Simplified Banner ✅

- **Recreated**: `src/components/trial/TrialStatusBanner.tsx`
  - Uses `useSubscription` hook instead of old trial service
  - Displays trial status based on `user_subscriptions` data
  - Shows appropriate messages for active, expiring, and expired trials

### 6. Signup Flow Simplified ✅

- **Updated**:
  - `src/components/auth/SignUpForm.tsx` - Removed plan selection prop
  - `src/context/AuthContext.tsx` - Removed selectedPlan parameter
  - `src/app/(public)/auth/actions.ts` - Removed plan metadata
  - `src/app/(public)/auth/page.tsx` - Removed plan query parameter handling

### 7. Signup Pages Updated ✅

- **Updated**: `src/app/(public)/signup/SignUpContent.tsx`

  - Replaced plan selection UI with simple "Start Free Trial" CTA
  - Lists trial features clearly
  - Direct redirect to signup page

- **Updated**: `src/app/(public)/pricing/page.tsx`
  - All pricing cards now redirect to `/auth?signup=true` (no plan parameter)

### 8. Middleware Simplified ✅

- **Updated**: `src/lib/supabase-middleware.ts`
  - Removed profile-based trial checking
  - Now checks `user_subscriptions` table only
  - Verifies `trial_end` date against current time
  - Redirects to pricing if no subscription or trial expired

### 9. Dashboard Updated ✅

- **Updated**: `src/app/(authorised)/dashboard/page.tsx`
  - Removed `TrialExpirationHandler` component
  - Uses new simplified `TrialStatusBanner`

## Database Migration Required

**IMPORTANT**: You need to run the migration on your Supabase database:

```bash
# Run this SQL file in your Supabase SQL Editor:
simplify_trial_system.sql
```

This will:

1. Remove old columns from profiles table
2. Update the `handle_new_user()` trigger function
3. Automatically create trial subscriptions for new users

## Testing Checklist

### New User Signup Flow

- [ ] Sign up without selecting a plan
- [ ] Verify email confirmation works
- [ ] Check that `user_subscriptions` record is created automatically
- [ ] Verify `trial_start` and `trial_end` dates are set correctly
- [ ] Verify default plan is "track"
- [ ] Verify status is "trialing"

### Trial Status Display

- [ ] Dashboard shows trial banner with correct days remaining
- [ ] Banner shows different states:
  - Green banner for 3+ days remaining
  - Yellow banner for 1-2 days remaining
  - Red banner for expired trial

### Trial Expiration

- [ ] Users with expired trials are redirected to pricing page
- [ ] Middleware blocks access to protected routes when trial expired
- [ ] Query parameter `?trial_expired=true` is set on redirect

### Subscription Hook

- [ ] `isTrialActive` returns correct value
- [ ] `isTrialExpired` returns correct value
- [ ] `daysRemaining` calculates correctly
- [ ] `trialEndsAt` returns correct date

## Migration Strategy for Existing Users

For users who signed up before this change:

1. **Users with data in old `profiles` fields**:

   - Create a one-time script to migrate existing trial data to `user_subscriptions`
   - Or let the middleware redirect them to pricing (they'll need to select a plan)

2. **Recommended approach**:
   ```sql
   -- Example migration for existing users
   INSERT INTO user_subscriptions (user_id, plan_id, status, trial_start, trial_end, current_period_start, current_period_end)
   SELECT
     id as user_id,
     COALESCE(selected_plan, 'track') as plan_id,
     CASE
       WHEN trial_expired THEN 'inactive'
       ELSE 'trialing'
     END as status,
     trial_start_date as trial_start,
     trial_start_date + INTERVAL '7 days' as trial_end,
     trial_start_date as current_period_start,
     trial_start_date + INTERVAL '7 days' as current_period_end
   FROM profiles
   WHERE NOT EXISTS (
     SELECT 1 FROM user_subscriptions WHERE user_id = profiles.id
   )
   AND trial_start_date IS NOT NULL;
   ```

## Benefits of This Change

1. **Simpler User Experience**: No need to choose a plan upfront
2. **Single Source of Truth**: All subscription/trial data in `user_subscriptions`
3. **Cleaner Code**: Removed redundant trial checking logic
4. **Easier to Maintain**: One hook (`useSubscription`) for all subscription needs
5. **Better Database Design**: Trial data alongside subscription data

## Next Steps

1. **Run the database migration** in Supabase SQL Editor
2. **Test the signup flow** with a new test user
3. **Consider migrating existing users** if you have any
4. **Monitor for any edge cases** after deployment
5. **Update any documentation** that references the old signup flow

## Files to Deploy

All changes are in the codebase. Make sure to:

1. Run the database migration first
2. Then deploy the code changes
3. Test thoroughly in staging before production

## Rollback Plan

If you need to rollback:

1. The old trial fields still exist in the database until you run the migration
2. Keep the `simplify_trial_system.sql` file - you can reverse the ALTER TABLE commands
3. Git revert to the previous commit if needed

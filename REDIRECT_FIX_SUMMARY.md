# Email Verification Redirect Fix

## Problem Diagnosed

When users clicked the email verification link, they were being signed in but not redirected to the dashboard. The verification email link showed:

```
https://cppbdcylcwpjuhyxiwud.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=https://e0682b612cdb.ngrok.app/
```

The `redirect_to` parameter was only pointing to the base URL (`/`) instead of `/dashboard`.

## Root Cause

The `emailRedirectTo` option in signup and resend verification functions was set to `/auth/callback` without explicitly specifying where to redirect after the callback. While the callback route had a default fallback to `/dashboard`, the Supabase verification link wasn't preserving this in the `redirect_to` parameter.

## Solution Implemented

Updated all `emailRedirectTo` configurations to explicitly include the `next=/dashboard` query parameter:

### Files Modified

1. **`src/context/AuthContext.tsx`**

   - Updated `signUp()` method (line 143)
   - Updated `resendVerificationEmail()` method (line 203)
   - Changed from: `${getBaseUrl()}/auth/callback`
   - Changed to: `${getBaseUrl()}/auth/callback?next=/dashboard`

2. **`src/app/(public)/auth/actions.ts`**

   - Updated `signup()` function (line 75)
   - Updated `resendVerificationEmail()` function (line 124)
   - Changed from: `${getBaseUrl()}/auth/callback`
   - Changed to: `${getBaseUrl()}/auth/callback?next=/dashboard`

3. **`src/context/__tests__/AuthContext.test.tsx`**
   - Updated test expectations to match new redirect URL format
   - Updated mock to use `getBaseUrl()` instead of `getAuthCallbackUrl()`
   - Updated expected `emailRedirectTo` to include `?next=/dashboard`

## How It Works

1. User signs up or requests a verification email resend
2. Supabase sends an email with a verification link containing `redirect_to=https://your-domain.com/auth/callback?next=/dashboard`
3. User clicks the link in their email
4. Supabase verifies the token and redirects to `/auth/callback?next=/dashboard`
5. The callback route (which already has logic to read the `next` parameter) redirects to `/dashboard`
6. User lands on the dashboard, fully authenticated

## Testing

To test this fix:

1. Sign up with a new email address
2. Check the verification email
3. The link should now include `redirect_to=https://your-domain.com/auth/callback?next=/dashboard`
4. Click the verification link
5. You should be redirected to the dashboard

## Notes

- The callback route already had the logic to handle the `next` parameter (see line 25 in `/auth/callback/route.ts`)
- This fix ensures that Supabase passes through the full redirect path including the query parameter
- No changes were needed to the callback route itself
- All existing tests have been updated to reflect the new behavior

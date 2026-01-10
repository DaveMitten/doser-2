# Email Verification Update Guide

## Overview

This guide explains how to update your Supabase email templates to use the improved server-side verification route that handles all email client URL transformations.

## Why This Change?

**Before:** Email links pointed to `/auth/verify` (client-side verification)

- ❌ Cookie synchronization timing issues
- ❌ Users sometimes redirected to landing page instead of dashboard
- ❌ Race conditions between session creation and navigation

**After:** Email links point to `/auth/callback` (server-side verification)

- ✅ Cookies properly set before redirect
- ✅ Universal parameter extraction works with ALL email clients
- ✅ No timing issues
- ✅ Reliable session creation

## What's Been Implemented

### 1. Universal Parameter Extraction (`src/lib/utils.ts`)

The new `extractVerificationParams()` function handles URL transformations from:

- Gmail (wraps URLs in `?q=` parameter)
- Outlook SafeLinks
- Yahoo Mail transformations
- Corporate email security scanners
- Hash-based parameters
- Any future email client variations

### 2. Enhanced Server-Side Route (`src/app/(public)/auth/callback/route.ts`)

- Uses universal parameter extraction
- Comprehensive debugging logs
- Proper cookie handling via server Supabase client
- Works across all email clients and browsers

### 3. Fixed Middleware Protection (`src/lib/supabase-middleware.ts`)

- Now correctly protects actual routes: `/dashboard`, `/calculator`, etc.
- Automatically refreshes sessions on protected route access

### 4. Comprehensive Debugging

Added detailed console logging to track:

- Parameter extraction methods used
- Session creation success/failure
- Auth state changes
- User state on dashboard mount

## Steps to Update Supabase Email Template

### 1. Access Your Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Email Templates**

### 2. Update the "Confirm Signup" Template

Find the template that contains `{{ .ConfirmationURL }}` or similar.

**Change from:**

```html
{{ .SiteURL }}/auth/verify?token_hash={{ .TokenHash }}&type=email
```

**Change to:**

```html
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
```

**Or if you have a more complex template:**

Find any line that looks like:

```html
<a href="{{ .ConfirmationURL }}">Verify Email</a>
```

Replace with:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email"
  >Verify Email</a
>
```

### 3. Update Magic Link Template (if used)

Follow the same pattern as above for the Magic Link template.

### 4. Save Changes

Click **Save** in the Supabase dashboard.

### 5. Test the New Flow

1. Sign up with a test account using a different email provider
2. Check your email and click the verification link
3. Open browser DevTools → Console to see debug logs
4. Verify you land on `/dashboard` as a logged-in user
5. Check DevTools → Application → Cookies for Supabase auth cookies (`sb-*`)
6. Refresh the page to ensure session persists

## Testing Different Email Clients

Test with various email providers to verify universal extraction works:

- [ ] Gmail
- [ ] Outlook/Hotmail
- [ ] Yahoo Mail
- [ ] Apple Mail
- [ ] ProtonMail
- [ ] Corporate email (if applicable)

For each test:

1. Check console logs for "Extraction method used"
2. Verify successful login
3. Document which extraction method was used

## Backwards Compatibility

The `/auth/verify` route still exists and works, but it's now primarily for fallback/debugging purposes. If you have existing verification links in emails that haven't been opened yet, they will still work with the client-side verification.

## Troubleshooting

### Users Still Landing on Landing Page

1. **Check console logs** - Look for:

   - "AUTH CALLBACK DEBUG" or "AUTH VERIFY DEBUG"
   - "Extraction method used"
   - "Session created"
   - "AUTH STATE CHANGE"

2. **Check cookies** - Open DevTools → Application → Cookies

   - Look for cookies starting with `sb-`
   - Verify they have values and aren't expired

3. **Check middleware logs** - Server logs should show:
   - Session refresh attempts
   - User authentication status

### Verification Link Says "Invalid"

1. **Check link expiration** - Supabase verification links typically expire after 1-24 hours
2. **Try resending** - Use the "Resend verification email" feature
3. **Check console logs** - Look for specific error messages

### Different Email Client Not Working

1. **Check console logs** - Look for "Universal extraction result"
2. **Document the URL format** - Share the full URL structure (remove actual tokens)
3. **May need to add additional extraction logic** - The universal extractor should handle most cases, but edge cases may require updates

## Debug Log Examples

### Successful Verification (Direct Parameters)

```
=== AUTH CALLBACK DEBUG ===
Full URL: https://yourapp.com/auth/callback?token_hash=abc123&type=email
Universal extraction result: { token_hash: 'abc123', type: 'email', source: 'direct' }
✅ OTP verification successful!
Extraction method used: direct
Session created: { userId: '...', email: '...', expiresAt: ... }
Redirecting to: https://yourapp.com/dashboard
```

### Successful Verification (Gmail Wrapped)

```
=== AUTH CALLBACK DEBUG ===
Full URL: https://yourapp.com/auth/callback?q=https://yourapp.com/auth/callback?token_hash=abc123&type=email
Universal extraction result: { token_hash: 'abc123', type: 'email', source: 'wrapped-q' }
✅ OTP verification successful!
Extraction method used: wrapped-q
```

### Dashboard Load with Session

```
=== DASHBOARD MOUNTED ===
User: { id: '...', email: 'user@example.com' }
```

## Next Steps

After updating the email template:

1. ✅ Test with multiple email providers
2. ✅ Monitor console logs for any extraction failures
3. ✅ Document which email clients required fallback extraction
4. ✅ Remove debug logs from production (optional, or leave for ongoing monitoring)
5. ✅ Update any documentation that references `/auth/verify`

## Support

If you encounter issues:

1. Check console logs for detailed error messages
2. Verify Supabase email template was updated correctly
3. Test with a different email provider
4. Check that cookies are being set properly
5. Ensure middleware is running on protected routes

## Summary of Changes

| File                                      | Change                                    | Purpose                        |
| ----------------------------------------- | ----------------------------------------- | ------------------------------ |
| `src/lib/utils.ts`                        | Added `extractVerificationParams()`       | Universal parameter extraction |
| `src/app/(public)/auth/callback/route.ts` | Uses universal extraction + debugging     | Handle all email clients       |
| `src/lib/supabase-middleware.ts`          | Fixed protected paths array               | Actually protect routes        |
| `src/context/AuthContext.tsx`             | Added debug logging                       | Track auth state changes       |
| `src/app/(authorised)/dashboard/page.tsx` | Added debug logging                       | Verify user state on mount     |
| `src/app/(public)/auth/verify/page.tsx`   | Added debug logging                       | Track client-side verification |
| Supabase Email Template                   | Change `/auth/verify` to `/auth/callback` | Use server-side verification   |

---

**Last Updated:** $(date)
**Status:** Ready for testing


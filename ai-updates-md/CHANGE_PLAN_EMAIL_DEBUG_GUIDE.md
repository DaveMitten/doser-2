# Change Plan Email Debugging Guide

## Issue

Change plan email is not sending when users request to change their subscription plan.

## Changes Made

### 1. Added Comprehensive Sentry Logging

Updated `/src/app/api/subscriptions/change-plan-request/route.ts` with extensive logging throughout the email sending flow:

#### Configuration Check

- Added startup check for `RESEND_API_KEY` environment variable
- Logs to Sentry if API key is missing

#### Authentication Logging

- Logs authentication failures with detailed error context
- Sets Sentry user context for all subsequent logs

#### Rate Limiting Logging

- Logs when users hit rate limits
- Tracks limit, reset time, and remaining requests

#### Validation Logging

- Logs missing required fields with details of what's missing
- Logs invalid email format attempts

#### Email Send Logging

- **Pre-send**: Logs attempt to send email with all relevant details
- **Success**: Logs successful send with email ID from Resend
- **Failure**: Comprehensive error logging including:
  - Error message and stack trace
  - All request parameters (plan names, user email, etc.)
  - Resend API key presence and length (for debugging config issues)
  - Full error context in Sentry

#### Unexpected Errors

- Catches and logs any unexpected errors with full context

### 2. Enhanced Error Logger

Updated `/src/lib/error-logger.ts` to better support email-related errors:

- Added `"email"` as a valid error type
- Enhanced `logInfo` to add Sentry breadcrumbs for better debugging flow
- Enhanced `logWarning` to capture messages in Sentry
- Improved error context metadata handling

## How to Debug

### Step 1: Check Sentry Dashboard

After deploying these changes, when a user attempts to change plans:

1. Go to your Sentry dashboard
2. Look for issues tagged with:
   - `component: "change-plan-request"`
   - `errorType: "subscription"`
3. Check for these specific event types:
   - `change-plan-request-auth-failed` - Authentication issues
   - `change-plan-request-validation-failed` - Missing form fields
   - `change-plan-request-invalid-email` - Email format issues
   - `change-plan-request-email-failed` - **Email sending failure (most important)**
   - `change-plan-request-unexpected-error` - Unexpected errors

### Step 2: Check Breadcrumbs

In Sentry, for any captured issue:

1. Look at the "Breadcrumbs" section
2. You should see a trail like:
   ```
   [info] Attempting to send change plan email
   [info] Change plan email sent successfully (if successful)
   ```

### Step 3: Review Error Metadata

For email send failures, check the metadata field in Sentry, which includes:

- `currentPlan` - What plan the user is currently on
- `targetPlan` - What plan they want to switch to
- `requestEmail` - Email they provided in the form
- `requestName` - Name they provided
- `errorMessage` - The actual error from Resend
- `errorStack` - Full stack trace
- `hasResendKey` - Whether RESEND_API_KEY is configured (true/false)
- `resendKeyLength` - Length of the API key (helps identify truncated keys)

### Step 4: Common Issues to Check

#### Missing or Invalid RESEND_API_KEY

**Symptom**: Error mentions API key or authentication
**Solution**:

- Check `.env.local` or production environment variables
- Ensure `RESEND_API_KEY` is set correctly
- Verify key is not expired in Resend dashboard

#### Domain Not Verified

**Symptom**: Error mentions "domain not verified" or similar
**Solution**:

- Go to Resend dashboard
- Verify `doserapp.com` domain
- Add required DNS records (SPF, DKIM, etc.)
- Wait for verification (can take up to 48 hours)

#### For Testing: Use Resend Test Mode

If you want to test without domain verification:

```typescript
from: "onboarding@resend.dev",
to: "delivered@resend.dev",
```

#### Rate Limiting Issues

**Symptom**: Users getting "Rate limit exceeded" message
**Solution**:

- Check if Redis is configured correctly
- Adjust rate limits in the code if needed (currently 3 per hour)
- Consider removing rate limiting for testing

#### Email Service Issues

**Symptom**: Timeout errors or 500 responses from Resend
**Solution**:

- Check Resend status page
- Verify Resend account is in good standing
- Check if you've hit any sending limits

## Testing the Fix

### Manual Test

1. Deploy the changes
2. Log in as a test user
3. Go to the upgrade page
4. Click "Change Plan" on a different plan
5. Fill out and submit the form
6. Check:
   - User sees success message
   - Check Sentry for logged events
   - Check support@doserapp.com for the email

### What You Should See in Sentry

**Successful Flow:**

```
[Breadcrumb] Attempting to send change plan email
  - userId: xxx
  - currentPlan: Premium
  - targetPlan: Enterprise
  - hasResendKey: true

[Breadcrumb] Change plan email sent successfully
  - emailId: abc123
```

**Failed Flow:**

```
[Error] change-plan-request-email-failed
  - errorType: subscription
  - userId: xxx
  - errorMessage: "Domain not verified" (or similar)
  - hasResendKey: true
  - resendKeyLength: 45
  - currentPlan: Premium
  - targetPlan: Enterprise
```

## Environment Variables Checklist

Ensure these are set in your production environment:

```bash
# Required for email sending
RESEND_API_KEY=re_xxxxxxxxxxxx

# Optional for rate limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx

# Required for Sentry logging
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
```

## Next Steps

1. Deploy the updated code
2. Trigger a test change plan request
3. Check Sentry dashboard for logged events
4. Based on the error in Sentry, apply the appropriate fix from the "Common Issues" section
5. If the error is unclear, share the full Sentry error context for further investigation

## Additional Debugging

If you still can't identify the issue:

1. **Check server logs**: Look at your hosting platform's logs (Vercel, etc.)
2. **Test Resend directly**: Use Resend's API playground to send a test email
3. **Verify network connectivity**: Ensure your server can reach Resend's API
4. **Check for firewall rules**: Ensure outbound HTTPS traffic is allowed

## Files Modified

- `/src/app/api/subscriptions/change-plan-request/route.ts` - Added comprehensive logging
- `/src/lib/error-logger.ts` - Enhanced logging functions and added email error type

# Change Plan Email Debug Implementation Summary

## Overview

Added comprehensive Sentry logging and debugging tools to diagnose why the change plan email is not sending.

## Changes Made

### 1. Enhanced API Route (`src/app/api/subscriptions/change-plan-request/route.ts`)

#### Added Imports

```typescript
import * as Sentry from "@sentry/nextjs";
import { logError, logInfo } from "@/lib/error-logger";
```

#### Added Configuration Check

- Check for `RESEND_API_KEY` at module initialization
- Log to Sentry if missing
- Helps identify environment configuration issues immediately

#### Added Comprehensive Logging Throughout

**Authentication Stage:**

- Logs auth failures with error details
- Sets Sentry user context for request tracking

**Rate Limiting Stage:**

- Logs when users hit rate limits
- Tracks remaining attempts and reset time

**Validation Stage:**

- Logs missing required fields with specific details
- Logs invalid email format attempts

**Email Sending Stage (Critical):**

- **Before sending**: Logs attempt with all parameters
- **Success**: Logs email ID from Resend for tracking
- **Failure**: Captures detailed error including:
  - Error message and stack trace
  - Request context (plan names, user details)
  - Config status (API key presence and length)
  - Full Sentry context with tags

**Unexpected Errors:**

- Catches any uncaught errors
- Logs with full context to Sentry

### 2. Enhanced Error Logger (`src/lib/error-logger.ts`)

#### Added `email` Error Type

```typescript
errorType: "webhook" | "payment" | "subscription" | "database" | "email";
```

#### Enhanced `logError` Function

- Spreads metadata into logger for better visibility
- Adds tags to Sentry exceptions

#### Enhanced `logInfo` Function

- Now adds Sentry breadcrumbs automatically
- Creates debugging trail through the request flow

#### Enhanced `logWarning` Function

- Captures warnings in Sentry for better visibility
- Adds warning context

### 3. New Diagnostic Script (`scripts/test-email-config.js`)

Created a comprehensive diagnostic tool that checks:

1. **Environment Variables**

   - Verifies `RESEND_API_KEY` is set
   - Validates key format

2. **API Connectivity**

   - Tests connection to Resend API
   - Lists account domains

3. **Domain Configuration**

   - Checks if `doserapp.com` is configured
   - Verifies domain verification status
   - Provides guidance on DNS records

4. **Actionable Guidance**
   - Provides specific instructions based on findings
   - Suggests fixes for common issues
   - Offers testing alternatives

**Usage:**

```bash
node scripts/test-email-config.js
```

### 4. Comprehensive Debug Guide (`CHANGE_PLAN_EMAIL_DEBUG_GUIDE.md`)

Created detailed documentation covering:

- How to use Sentry to debug
- Common issues and solutions
- Step-by-step debugging process
- Environment variable checklist
- Testing procedures

## How to Use These Changes

### Step 1: Deploy the Changes

Deploy the updated code to your environment where the issue is occurring.

### Step 2: Run the Diagnostic Script

Before triggering a test, run the diagnostic:

```bash
cd /Users/davidmitten/Documents/dev/side-projects/doser-2
node scripts/test-email-config.js
```

This will tell you if there are any obvious configuration issues.

### Step 3: Trigger a Test Request

1. Log in to the application
2. Go to the pricing/upgrade page
3. Click "Change Plan" on a different plan
4. Fill out and submit the form

### Step 4: Check Sentry

Go to your Sentry dashboard and look for:

**Tags to filter by:**

- `component: change-plan-request`
- `errorType: subscription`

**Event types to look for:**

- `change-plan-request-email-failed` (most important for email issues)
- `change-plan-request-auth-failed`
- `change-plan-request-validation-failed`
- `change-plan-request-invalid-email`
- `change-plan-request-unexpected-error`

### Step 5: Analyze the Error

Check the error metadata in Sentry for:

- `errorMessage`: The actual error from Resend
- `hasResendKey`: Confirms if API key is present
- `resendKeyLength`: Helps identify truncated keys
- Full stack trace

### Step 6: Apply the Fix

Based on the error, apply the appropriate fix:

**Common Issues:**

1. **Missing API Key**

   - Add `RESEND_API_KEY` to environment variables
   - Restart the application

2. **Domain Not Verified**

   - Go to Resend dashboard
   - Add required DNS records for doserapp.com
   - Wait for verification (up to 48 hours)
   - Alternative: Use test mode (see guide)

3. **Invalid API Key**

   - Generate new key in Resend dashboard
   - Update environment variables

4. **Rate Limiting**
   - Check Redis configuration
   - Adjust limits if needed
   - Clear rate limit for test user

## Logging Flow

A successful request will create this trail in Sentry:

```
[Breadcrumb] Attempting to send change plan email
  └─ userId, currentPlan, targetPlan, hasResendKey

[Breadcrumb] Change plan email sent successfully
  └─ emailId, userId
```

A failed request will create:

```
[Breadcrumb] Attempting to send change plan email
  └─ userId, currentPlan, targetPlan, hasResendKey

[Error] change-plan-request-email-failed
  └─ Full error details, metadata, context
```

## Files Modified

1. `/src/app/api/subscriptions/change-plan-request/route.ts` - Added comprehensive logging
2. `/src/lib/error-logger.ts` - Enhanced logging functions
3. `/scripts/test-email-config.js` - New diagnostic script
4. `CHANGE_PLAN_EMAIL_DEBUG_GUIDE.md` - New debugging guide
5. `CHANGE_PLAN_EMAIL_IMPLEMENTATION_SUMMARY.md` - This file

## Environment Variables Required

```bash
# Required for email functionality
RESEND_API_KEY=re_xxxxxxxxxxxx

# Required for Sentry logging
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Optional for rate limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx
```

## What to Expect

After deployment, every change plan request will:

1. ✅ Be logged to Sentry with full context
2. ✅ Create a breadcrumb trail showing the flow
3. ✅ Capture detailed errors if email sending fails
4. ✅ Include all metadata needed to diagnose the issue

You will be able to:

- See exactly where the email sending fails
- Understand why it's failing (error message)
- Have all the context needed to fix it
- Track if emails are being sent successfully

## Next Steps

1. ✅ Deploy these changes to your environment
2. ⏭️ Run `node scripts/test-email-config.js` to check configuration
3. ⏭️ Trigger a test change plan request
4. ⏭️ Check Sentry for logged events and errors
5. ⏭️ Based on findings, apply appropriate fix from debug guide

## Support

If you need help interpreting the Sentry logs, share:

- The full error message from Sentry
- The metadata section
- The breadcrumb trail
- Output from `test-email-config.js`

This will provide enough context to identify and fix the issue quickly.

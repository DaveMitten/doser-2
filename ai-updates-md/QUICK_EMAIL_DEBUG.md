# Quick Email Debug Instructions

## Problem

Change plan emails are not sending.

## Solution Implemented

Added comprehensive Sentry logging to identify the issue.

## Quick Start

### 1. Run the Diagnostic Script

```bash
# Make sure you're in the project directory
cd /Users/davidmitten/Documents/dev/side-projects/doser-2

# Run the diagnostic with your environment variables
node -r dotenv/config scripts/test-email-config.js dotenv_config_path=.env.local
```

Or if that doesn't work:

```bash
# Load environment variables first
export $(cat .env.local | xargs)
node scripts/test-email-config.js
```

### 2. Deploy the Changes

Deploy the updated code (especially these files):

- `src/app/api/subscriptions/change-plan-request/route.ts`
- `src/lib/error-logger.ts`

### 3. Test the Feature

1. Log in to your app
2. Go to the pricing/upgrade page
3. Click "Change Plan" on a different tier
4. Fill out and submit the form

### 4. Check Sentry

1. Go to your Sentry dashboard
2. Filter by tag: `component:change-plan-request`
3. Look for event type: `change-plan-request-email-failed`
4. Check the error metadata for the reason

### 5. Common Fixes

**If error says "RESEND_API_KEY is not set":**

```bash
# Add to .env.local or production environment
RESEND_API_KEY=re_xxxxxxxxxxxx
```

**If error says "Domain not verified":**

1. Go to https://resend.com/domains
2. Add DNS records for doserapp.com
3. Wait for verification (up to 48 hours)

**For testing without domain verification:**
Change these lines in `route.ts`:

```typescript
from: "onboarding@resend.dev",
to: "delivered@resend.dev",
```

**If error says "API key invalid":**

1. Go to https://resend.com/api-keys
2. Generate a new API key
3. Update your environment variables

## What Was Changed

### API Route Logging

Added Sentry logging for:

- ✅ Configuration checks (API key presence)
- ✅ Authentication failures
- ✅ Validation errors
- ✅ Rate limiting
- ✅ **Email sending attempts and failures** ⭐
- ✅ Success cases

### Error Logger Enhancement

- Added `email` as an error type
- Enhanced logging functions to create Sentry breadcrumbs
- Improved metadata tracking

### Diagnostic Script

- Tests Resend configuration
- Checks domain verification
- Validates API key
- Provides actionable fixes

## Expected Output in Sentry

**Successful Email:**

```
Breadcrumbs:
  → Attempting to send change plan email
  → Change plan email sent successfully (emailId: abc123)
```

**Failed Email:**

```
Error: change-plan-request-email-failed
Metadata:
  - errorMessage: "Domain not verified" (or actual error)
  - hasResendKey: true/false
  - resendKeyLength: 45
  - currentPlan: "Premium"
  - targetPlan: "Enterprise"
  - userId: "xxx"
```

## Need More Help?

See detailed guides:

- `CHANGE_PLAN_EMAIL_DEBUG_GUIDE.md` - Comprehensive debugging guide
- `CHANGE_PLAN_EMAIL_IMPLEMENTATION_SUMMARY.md` - Technical details of changes

## Files You Need to Deploy

1. ✅ `src/app/api/subscriptions/change-plan-request/route.ts`
2. ✅ `src/lib/error-logger.ts`
3. ℹ️ `scripts/test-email-config.js` (for local testing only)

After deploying, the Sentry logs will tell you exactly why emails aren't sending!

# Sentry Error Monitoring Setup

## Overview

This project now has comprehensive error monitoring using **Sentry** for structured error tracking and **Vercel Logs** for real-time debugging. All webhook failures and subscription update issues are now properly logged and reported.

## What Was Fixed

### 1. **Silent Webhook Failures** ✅

- **Before**: When metadata (`user_id` or `plan_id`) was missing, the webhook handler would return early without throwing an error
- **After**: Missing metadata now throws an error, which is logged to both Sentry and Vercel, and returns 500 to Dodo Payments for retry

### 2. **Error Reporting** ✅

- **Before**: Errors were only logged to console
- **After**: Dual reporting system:
  - **Sentry**: Structured error tracking with context, user info, and error grouping
  - **Vercel Logs**: Real-time log streaming for immediate debugging

### 3. **Metadata Fallback** ✅

- **Before**: No fallback if `user_id` was missing from metadata
- **After**: Attempts to lookup user via `customer_id` from existing subscription records before failing

### 4. **Database Error Handling** ✅

- **Before**: Generic error messages
- **After**: Specific error messages for different Supabase error codes (23505, 23503, 42P01)

### 5. **Performance Tracing** ✅

- **Before**: No visibility into webhook processing times
- **After**: Sentry spans track processing time for each webhook event type

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@o0.ingest.sentry.io/0
SENTRY_ORG=doser
SENTRY_PROJECT=javascript-nextjs
SENTRY_AUTH_TOKEN=your-auth-token-here
```

### Getting Your Sentry DSN

1. Go to [Sentry.io](https://sentry.io)
2. Navigate to **Settings** → **Projects** → **javascript-nextjs**
3. Go to **Client Keys (DSN)**
4. Copy the **DSN** value

### Getting Your Sentry Auth Token

1. Go to [Sentry.io](https://sentry.io/settings/account/api/auth-tokens/)
2. Click **Create New Token**
3. Name: "Vercel Deployment"
4. Scopes: Select `project:releases` and `org:read`
5. Copy the token and add to `.env.local`

## Files Modified

### New Files Created

- `src/lib/error-logger.ts` - Centralized error logging with Sentry integration
- `sentry.server.config.ts` - Server-side Sentry configuration
- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.edge.config.ts` - Edge runtime Sentry configuration
- `instrumentation.ts` - Next.js instrumentation hook for Sentry

### Files Updated

- `src/lib/dodo-service.ts` - Fixed silent failures, added error logging, improved metadata extraction
- `src/app/api/webhooks/dodo-payments/route.ts` - Added Sentry tracing spans and error handling
- `next.config.ts` - Added Sentry webpack plugin configuration
- `package.json` - Added `@sentry/nextjs` dependency

## How It Works

### Error Flow

1. **Webhook Receives Event** → Wrapped in `Sentry.startSpan()` for performance tracking
2. **Event Processing Starts** → Sets Sentry context with webhook type, subscription ID, etc.
3. **Error Occurs** → Caught by try-catch block
4. **Error Logged** → `logError()` function:
   - Logs structured error to Sentry logger
   - Sets user context if `userId` available
   - Captures exception in Sentry with metadata
   - Logs to console (captured by Vercel)
5. **Error Thrown** → Returns 500 to Dodo Payments for retry

### Monitoring Strategy

**Sentry** (Primary - Production Monitoring):

- View errors: https://sentry.io/organizations/doser/issues/
- Check logs: https://sentry.io/organizations/doser/logs/
- View traces: https://sentry.io/organizations/doser/traces/
- Set up email/Slack alerts for new errors

**Vercel Logs** (Secondary - Real-time Debugging):

- View logs: Vercel Dashboard → Project → Logs
- Real-time streaming during development
- Full webhook payloads visible
- 7-day retention

## Testing

### 1. Test Missing Metadata

Trigger a webhook without `user_id` in metadata:

- ✅ Should see error in Sentry with full context
- ✅ Should see structured log entry
- ✅ Should see error in Vercel logs
- ✅ Dodo Payments should receive 500 and retry

### 2. Test Database Error

Trigger webhook with invalid `user_id`:

- ✅ Should see descriptive error in both systems
- ✅ Error message should indicate specific issue

### 3. Test Successful Payment

Complete a real payment:

- ✅ Subscription created in database
- ✅ No errors in Sentry or Vercel
- ✅ Trace in Sentry showing processing time

## Sentry Features Enabled

### Logs

- Console integration automatically sends `console.warn` and `console.error` to Sentry
- Structured logging with `logger.error()`, `logger.warn()`, `logger.info()`

### Tracing

- Performance monitoring for all webhook events
- Tracks processing time and success/failure status

### Error Tracking

- Automatic error grouping and deduplication
- User context attached when available
- Stack traces with source maps
- Metadata attached for debugging

### Session Replay (Client-side only)

- Records 10% of sessions
- Records 100% of sessions with errors
- Helps debug frontend issues

## Deployment Notes

### Vercel Integration

When deploying to Vercel:

1. Add environment variables in Vercel Dashboard → Project Settings → Environment Variables
2. Add the same Sentry variables as in `.env.local`
3. Sentry will automatically upload source maps during build
4. Monitor errors in Sentry dashboard

### Production Configuration

For production, consider adjusting these values in `sentry.server.config.ts`:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Lower trace sample rate in production to reduce costs
  tracesSampleRate: 0.1, // 10% instead of 100%

  environment: "production",

  // Enable logging
  _experiments: {
    enableLogs: true,
  },

  integrations: [
    Sentry.consoleLoggingIntegration({
      levels: ["warn", "error"],
    }),
  ],
});
```

## Support

If you see errors in Sentry:

1. Check the error message and stack trace
2. Review the attached metadata for webhook payload
3. Check user context to identify affected users
4. View related traces to see processing time
5. Check Vercel logs for full request details

## Next Steps

1. ✅ Set up Sentry DSN and auth token
2. ✅ Deploy to Vercel with environment variables
3. ✅ Configure Sentry alerts (email/Slack)
4. ✅ Test with a real payment
5. ✅ Monitor Sentry dashboard for any issues
6. ✅ Adjust trace sample rate based on volume

# Subscription Update Fix - Implementation Summary

## Problem Statement

When users paid for a subscription through Dodo Payments, the subscription was created in Dodo's system but **not being updated in the Supabase `user_subscriptions` table**. This caused users to appear as having no active subscription despite successful payment.

## Root Causes Identified

### 1. Silent Webhook Failures

**Location**: `src/lib/dodo-service.ts` lines 407-413

**Issue**: When webhook metadata was missing `user_id` or `plan_id`, the handler would return early without throwing an error:

```typescript
if (!userId || !planId) {
  console.error("Missing user_id or plan_id...");
  return; // ❌ SILENT FAILURE
}
```

**Impact**:

- No error thrown = No 500 response to Dodo Payments
- Dodo doesn't retry the webhook
- Subscription never gets created in Supabase
- User appears as having no subscription

### 2. No Error Monitoring

**Issue**: All errors were only logged to console with no structured monitoring system

**Impact**:

- No alerts when webhooks fail
- Difficult to debug production issues
- No visibility into error patterns or frequency

### 3. Poor Error Context

**Issue**: Generic error messages without context about what failed and why

**Impact**:

- Hard to diagnose issues
- No way to track which users are affected
- Limited debugging information

## Solution Implemented

### 1. Fixed Silent Failures ✅

**File**: `src/lib/dodo-service.ts`

**Changes**:

```typescript
// Added fallback to lookup user_id from customer_id
if (!userId && subscription.customer_id) {
  logWarning("user_id missing from metadata, attempting customer lookup", {
    subscriptionId,
    customerId: subscription.customer_id as string,
  });

  const supabase = this.getServiceSupabase();
  const { data: existingSubscription } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("dodo_customer_id", subscription.customer_id as string)
    .maybeSingle();

  if (existingSubscription?.user_id) {
    userId = existingSubscription.user_id;
    logInfo("Found user_id via customer lookup", { userId, subscriptionId });
  }
}

// Now throw error if still missing
if (!userId || !planId) {
  const error = new Error(
    `Missing required metadata: ${!userId ? "user_id" : "plan_id"} not found`
  );
  logError(error, {
    errorType: "webhook",
    subscriptionId,
    dodoSubscriptionId: subscriptionId,
    eventType: "subscription.active",
    metadata: metadata || {},
  });
  throw error; // ✅ NOW THROWS ERROR
}
```

**Benefits**:

- Attempts to recover from missing metadata using customer lookup
- Throws proper error with full context if recovery fails
- Returns 500 to Dodo Payments, triggering automatic retry
- Error logged to both Sentry and Vercel for monitoring

### 2. Implemented Dual Error Monitoring ✅

**System Architecture**:

```
┌─────────────────────────────────────────────────┐
│           Webhook Processing Flow               │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Webhook Event Received                      │
│     ↓                                            │
│  2. Sentry.startSpan() - Start Tracing         │
│     ↓                                            │
│  3. Process Event                               │
│     ↓                                            │
│  4. Error Occurs? ──────────────────┐           │
│     ↓                                │           │
│  5. logError()                      │           │
│     ├─→ Sentry.captureException()  │           │
│     ├─→ logger.error() (Sentry)    │           │
│     └─→ console.error() (Vercel)   │           │
│     ↓                                │           │
│  6. Throw Error                     │           │
│     ↓                                │           │
│  7. Return 500 to Dodo Payments     │           │
│     ↓                                │           │
│  8. Dodo Auto-Retries Webhook      │           │
│                                     │           │
│  Success Path ←────────────────────┘           │
│     ↓                                            │
│  9. Subscription Created in Supabase            │
│     ↓                                            │
│ 10. Return 200 to Dodo Payments                │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Components**:

1. **Sentry (Primary Monitoring)**

   - Error grouping and deduplication
   - Performance tracing for webhook processing
   - Structured logging with context
   - User identification
   - Email/Slack alerts
   - 5,000 events/month free tier

2. **Vercel Logs (Secondary/Real-time)**
   - Built-in, no setup required
   - Real-time log streaming
   - Full webhook payload inspection
   - 7-day retention
   - Great for active development debugging

### 3. Enhanced Error Handling ✅

**File**: `src/lib/error-logger.ts` (NEW)

**Features**:

```typescript
export function logError(error: Error, context: ErrorContext) {
  // Structured Sentry logger
  logger.error(logger.fmt`[${context.errorType}] ${error.message}`, {
    error: error.message,
    stack: error.stack,
    userId: context.userId,
    subscriptionId: context.subscriptionId,
    dodoSubscriptionId: context.dodoSubscriptionId,
    eventType: context.eventType,
    errorType: context.errorType,
  });

  // Set user context
  if (context.userId) {
    Sentry.setUser({ id: context.userId });
  }

  // Set error details context
  Sentry.setContext("error_details", {
    errorType: context.errorType,
    subscriptionId: context.subscriptionId,
    dodoSubscriptionId: context.dodoSubscriptionId,
    eventType: context.eventType,
  });

  // Capture exception with metadata
  Sentry.captureException(error, {
    level: context.errorType === "database" ? "error" : "warning",
  });
}
```

### 4. Improved Database Error Handling ✅

**File**: `src/lib/dodo-service.ts`

**Changes**:

```typescript
if (error) {
  let errorMessage = `Failed to upsert subscription: ${error.message}`;

  // Handle specific Supabase errors
  if (error.code === "23505") {
    errorMessage = "Duplicate subscription entry";
  } else if (error.code === "23503") {
    errorMessage = "Foreign key constraint violation - user may not exist";
  } else if (error.code === "42P01") {
    errorMessage = "Table user_subscriptions not found - run migrations";
  }

  const dbError = new Error(errorMessage);
  logError(dbError, {
    errorType: "database",
    userId,
    subscriptionId,
    dodoSubscriptionId: subscriptionId,
    eventType: "subscription.active",
    metadata: {
      supabaseError: error,
      errorCode: error.code,
    },
  });

  throw dbError;
}
```

**Benefits**:

- Clear, actionable error messages
- Error code context for debugging
- Proper error categorization
- Full Supabase error details in metadata

### 5. Added Performance Tracing ✅

**File**: `src/app/api/webhooks/dodo-payments/route.ts`

**Implementation**:

```typescript
onSubscriptionActive: async (payload) => {
  return Sentry.startSpan(
    {
      op: "webhook.process",
      name: "Dodo Webhook - Subscription Active",
    },
    async (span) => {
      const subscriptionId = /* extract from payload */;
      span.setAttribute("webhook.type", "subscription.active");
      span.setAttribute("subscription_id", subscriptionId);

      try {
        Sentry.setContext("webhook", {
          event: "subscription.active",
          subscriptionId,
        });

        await dodoService.handleWebhookEvent({
          type: "subscription.active",
          data: payload,
        });

        span.setAttribute("status", "success");
      } catch (error) {
        span.setAttribute("status", "error");
        logError(/* ... */);
        throw error; // Returns 500 for retry
      }
    }
  );
},
```

**Benefits**:

- Track webhook processing time
- Identify performance bottlenecks
- Correlate slow requests with errors
- Monitor success/failure rates

## Files Created

1. **`src/lib/error-logger.ts`** - Centralized error logging with Sentry
2. **`sentry.server.config.ts`** - Server-side Sentry configuration
3. **`sentry.client.config.ts`** - Client-side Sentry configuration
4. **`sentry.edge.config.ts`** - Edge runtime Sentry configuration
5. **`instrumentation.ts`** - Next.js instrumentation hook
6. **`SENTRY_SETUP.md`** - Comprehensive setup documentation
7. **`SUBSCRIPTION_FIX_IMPLEMENTATION.md`** - This file

## Files Modified

1. **`src/lib/dodo-service.ts`**

   - Added error logger import
   - Fixed silent failures with proper error throwing
   - Added metadata fallback via customer lookup
   - Enhanced database error handling

2. **`src/app/api/webhooks/dodo-payments/route.ts`**

   - Added Sentry import
   - Wrapped all webhook handlers in Sentry.startSpan()
   - Added try-catch blocks with proper error logging
   - Added span attributes for better tracing

3. **`next.config.ts`**

   - Added Sentry webpack plugin configuration
   - Configured source map upload
   - Set organization and project

4. **`.gitignore`**

   - Added Sentry CLI config files

5. **`package.json`**
   - Added `@sentry/nextjs` dependency

## Environment Variables Required

Add to `.env.local` (and Vercel Dashboard for production):

```bash
# Sentry Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@o0.ingest.sentry.io/0
SENTRY_ORG=doser
SENTRY_PROJECT=javascript-nextjs
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

## Testing Checklist

### Test 1: Missing Metadata

- [ ] Trigger webhook without `user_id` in metadata
- [ ] Verify error appears in Sentry with full context
- [ ] Verify error appears in Vercel logs
- [ ] Verify Dodo Payments receives 500 response
- [ ] Verify Dodo Payments retries the webhook

### Test 2: Successful Payment

- [ ] Complete real payment through Dodo Payments
- [ ] Verify subscription created in `user_subscriptions` table
- [ ] Verify no errors in Sentry
- [ ] Verify trace shows successful processing
- [ ] Verify user can access paid features

### Test 3: Database Errors

- [ ] Trigger webhook with invalid `user_id`
- [ ] Verify descriptive error message in Sentry
- [ ] Verify Supabase error code included in metadata
- [ ] Verify error categorized correctly

### Test 4: Performance Monitoring

- [ ] Complete multiple payments
- [ ] Check Sentry Traces page
- [ ] Verify webhook processing times are tracked
- [ ] Verify span attributes are correct

## Monitoring Setup

### Sentry Dashboard

1. **Issues**: https://sentry.io/organizations/doser/issues/

   - View all captured errors
   - Group by error type
   - See affected users
   - Track error frequency

2. **Logs**: https://sentry.io/organizations/doser/logs/

   - View structured logs
   - Filter by severity
   - Search by context

3. **Traces**: https://sentry.io/organizations/doser/traces/
   - View webhook processing times
   - Identify performance issues
   - See success/failure rates

### Vercel Dashboard

1. Navigate to Project → Logs
2. Filter by:
   - Time range
   - Search term (e.g., "webhook", "error")
   - Log level (info, warn, error)
3. Click on log entry to see full details

### Alerts

Set up Sentry alerts:

1. Go to Sentry → Alerts
2. Create new alert rule
3. Trigger: "New issue"
4. Filter: Project = "javascript-nextjs"
5. Action: Email or Slack notification

## Production Considerations

### 1. Adjust Trace Sample Rate

In `sentry.server.config.ts`:

```typescript
tracesSampleRate: 0.1, // 10% in production (vs 100% in dev)
```

### 2. Monitor Sentry Quota

- Free tier: 5,000 events/month
- Monitor usage at: https://sentry.io/settings/doser/usage/
- If approaching limit, adjust sample rates or filter less important errors

### 3. Set Up Alerts

Configure alerts for:

- New error types
- High error frequency
- Specific users affected
- Slow webhook processing

## Success Metrics

After implementation, you should see:

1. **Zero Silent Failures**

   - All webhook errors now throw exceptions
   - All errors logged to Sentry
   - All errors visible in monitoring

2. **100% Subscription Creation Rate**

   - All successful payments create Supabase subscription
   - Failed payments properly retried
   - Users never stuck without subscription

3. **Complete Visibility**

   - Full webhook payload in logs
   - User context on all errors
   - Performance metrics tracked
   - Error trends visible

4. **Faster Resolution**
   - Errors grouped by type
   - Immediate alerts on issues
   - Rich context for debugging
   - Source maps for stack traces

## Next Steps

1. **Immediate**:

   - [ ] Add Sentry DSN to `.env.local`
   - [ ] Test with a real payment
   - [ ] Verify subscription created
   - [ ] Check Sentry for errors/traces

2. **Production Deployment**:

   - [ ] Add Sentry env vars to Vercel
   - [ ] Deploy to production
   - [ ] Test production payment
   - [ ] Monitor Sentry dashboard

3. **Ongoing**:
   - [ ] Review Sentry weekly for new issues
   - [ ] Adjust trace sample rates based on volume
   - [ ] Set up Slack integration for alerts
   - [ ] Document common errors and solutions

## Support

If you encounter issues:

1. Check Sentry Issues page for error details
2. Review Vercel Logs for full webhook payloads
3. Verify Dodo Payments webhook is configured correctly
4. Ensure all environment variables are set
5. Check Supabase tables and RLS policies

## Related Documentation

- `SENTRY_SETUP.md` - Detailed Sentry configuration guide
- `WEBHOOK_TROUBLESHOOTING.md` - Webhook debugging guide
- `DODO_PAYMENTS_SETUP.md` - Dodo Payments configuration

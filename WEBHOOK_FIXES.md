# Webhook Fixes - Subscription Payment Errors

## Issues Fixed

### 1. RLS Policy Violations

**Problem**: Webhooks were failing with "new row violates row-level security policy for table 'user_subscriptions'"

**Cause**: Webhooks run without an authenticated user session, so `auth.uid()` is null. The existing RLS policies required `auth.uid() = user_id`, which always failed for webhooks.

**Solution**:

- Added service role policy to `user_subscriptions` table that allows service role to bypass RLS
- Created `createSupabaseServiceClient()` function that uses service role key
- Updated all webhook handlers to use service role client instead of anon key client

### 2. Missing Payment Amount

**Problem**: Payment history insertion was failing with "null value in column 'amount' of relation 'payment_history' violates not-null constraint"

**Cause**: The payment webhook data structure wasn't being parsed correctly, and amount field was undefined.

**Solution**:

- Added better null handling for payment amount extraction
- Added fallback to `total_amount` field if `amount` is undefined
- Added currency conversion logic (cents to decimal)
- Only insert payment history if amount > 0
- Added detailed logging to debug webhook payload structure

### 3. Missing Subscription Fields

**Problem**: Several subscription fields were undefined (customer_id, period dates, etc.)

**Cause**: The webhook payload structure wasn't being handled properly.

**Solution**:

- Added default values for missing required fields
- Added comprehensive logging to see raw webhook payload
- Improved data extraction with proper null coalescing

## Files Modified

### 1. `dodo-payments-migration.sql`

Added new RLS policies:

- `"Service can manage subscriptions"` - Allows service role to insert/update subscriptions
- `"Service can update payment history"` - Allows service role to update payment records

### 2. `src/lib/supabase-server.ts`

Added new function:

```typescript
export function createSupabaseServiceClient();
```

Creates a Supabase client with service role key for webhook operations that need to bypass RLS.

### 3. `src/lib/dodo-service.ts`

- Added `getServiceSupabase()` method
- Updated all webhook handlers to use service role client:
  - `handleSubscriptionActivated()`
  - `handleSubscriptionCancelled()`
  - `handleSubscriptionFailed()`
  - `handleSubscriptionExpired()`
  - `handlePaymentSucceeded()`
  - `handlePaymentFailed()`
- Added comprehensive logging for debugging webhook payloads
- Added better null handling and default values
- Added payment amount extraction with fallbacks

## Required Actions

### 1. Apply Database Migration

Run the updated migration to add the new RLS policies:

```bash
# Using Supabase CLI
supabase db push

# Or manually execute the SQL
psql -h your-db-host -U postgres -d postgres -f dodo-payments-migration.sql
```

### 2. Verify Environment Variables

Make sure you have the service role key set:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

This key can be found in your Supabase project settings under API settings.

### 3. Test the Webhooks

After applying the migration:

1. Process a test payment through Dodo Payments
2. Check the logs for the detailed webhook payload logging
3. Verify that subscription and payment records are created successfully
4. Check that no RLS policy violations occur

## Debugging

If you still encounter issues, check the logs for:

- `"Raw subscription webhook data:"` - Shows the complete subscription webhook payload
- `"Raw payment webhook data:"` - Shows the complete payment webhook payload
- `"Extracted payment details:"` - Shows what was extracted from the payment webhook
- `"Prepared subscription data for upsert:"` - Shows the final data being inserted

## Environment Requirements

Ensure these environment variables are set:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key (for user operations)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for webhook operations)
- `DODO_PAYMENTS_API_KEY` - Your Dodo Payments API key
- `DODO_PAYMENTS_WEBHOOK_KEY` - Your Dodo Payments webhook secret
- `DODO_PAYMENTS_ENVIRONMENT` - Either "test_mode" or "live_mode"

# Dodo Payments Setup Instructions

This guide will walk you through the complete setup of the Dodo Payments subscription system.

## Overview

The subscription system has been fixed to handle:

- ✅ User subscription creation in Dodo Payments
- ✅ Evidence of subscriptions in Supabase DB tables
- ✅ Failed payment tracking
- ✅ Successful payment tracking
- ✅ Proper error handling and logging

## Step 1: Verify and Run Database Migrations

### 1.1 Check Current Database State

Run this SQL in your Supabase SQL Editor to check what's missing:

```bash
# Open the verification script
psql -f check-dodo-setup.sql
```

Or copy the contents of `check-dodo-setup.sql` and run it in your Supabase SQL Editor.

### 1.2 Run the Migration

If the `user_subscriptions` or `payment_history` tables don't exist, run the migration:

```bash
# Run in Supabase SQL Editor
psql -f dodo-payments-migration.sql
```

Or copy the contents of `dodo-payments-migration.sql` and run it in your Supabase SQL Editor.

This migration will:

- Add `dodo_subscription_id` and `dodo_customer_id` columns to `user_subscriptions`
- Create the `payment_history` table
- Set up RLS (Row Level Security) policies
- Create indexes for better performance
- Add helper functions for webhook processing

## Step 2: Verify Environment Variables

Make sure your `.env.local` file contains:

```env
# Dodo Payments Configuration
DODO_PAYMENTS_API_KEY=your_api_key_here
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_KEY=your_webhook_secret_here
DODO_PAYMENTS_RETURN_URL=http://localhost:3000/billing/success

# App URL (use ngrok for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration (should already exist)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 3: Set Up Webhook in Dodo Dashboard

1. Go to your Dodo Payments dashboard
2. Navigate to **Webhooks** section
3. Add a new webhook endpoint:
   - **URL**: `https://your-domain.com/api/webhooks/dodo-payments`
   - For local development: `https://your-ngrok-url.ngrok.io/api/webhooks/dodo-payments`
4. Select these events:
   - `subscription.created`
   - `subscription.activated`
   - `subscription.cancelled`
   - `subscription.failed`
   - `subscription.expired`
   - `payment.succeeded`
   - `payment.failed`
5. Copy the webhook secret and add it to your `.env.local` as `DODO_PAYMENTS_WEBHOOK_KEY`

## Step 4: Set Up Ngrok for Local Development

To test webhooks locally:

```bash
# Install ngrok (if not already installed)
brew install ngrok

# Start your Next.js app
npm run dev

# In another terminal, start ngrok
npx ngrok http 3000

# Copy the ngrok HTTPS URL and update:
# 1. Your Dodo webhook URL
# 2. NEXT_PUBLIC_APP_URL in .env.local
```

## Step 5: Test the Integration

### Test Subscription Creation

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `/pricing` in your browser

3. Click "Start 7-Day Free Trial" on any plan

4. Complete the checkout flow

5. Check the console logs for:
   ```
   getOrCreateCustomer { userId: '...', email: '...', name: '...' }
   Creating new customer in Dodo Payments
   Customer created successfully: cus_xxxxx
   Creating checkout session with request: {...}
   Checkout session created: https://checkout.dodopayments.com/...
   ```

### Verify Database Updates

After completing checkout, run this SQL in Supabase:

```sql
-- Check user subscription
SELECT * FROM user_subscriptions
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 1;

-- Check payment history
SELECT * FROM payment_history
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 5;
```

### Check Webhook Logs

Monitor your application logs for webhook events:

```bash
# In your terminal running npm run dev
# You should see:
Dodo webhook event received: { type: 'subscription.activated', ... }
Processing subscription activation: { subscriptionId: 'sub_xxx', ... }
Subscription activated successfully: { userId: '...', planId: '...', status: 'trialing' }
```

## What Changed

### Database Schema

1. **user_subscriptions table**:

   - Added `dodo_subscription_id` (TEXT)
   - Added `dodo_customer_id` (TEXT)
   - Status now includes `trialing` state

2. **payment_history table** (NEW):
   - Tracks all payment events
   - Includes success, failure, and pending states
   - Links to subscriptions
   - Stores error messages for failed payments

### Code Changes

1. **Fixed `getOrCreateCustomer` method**:

   - Changed from `.single()` to `.maybeSingle()` to handle missing subscriptions
   - Added comprehensive error handling
   - Better logging for debugging

2. **Enhanced webhook handlers**:

   - `handlePaymentSucceeded`: Records successful payments in `payment_history`
   - `handlePaymentFailed`: Records failed payments with error messages
   - `handleSubscriptionActivated`: Properly sets status to `trialing` or `active`

3. **Improved error messages**:
   - More detailed logging throughout
   - Helpful error messages that point to specific issues
   - Non-throwing errors in webhook handlers to avoid blocking Dodo retries

## Troubleshooting

### Error: "Failed to get or create customer"

**Solution**: Run the database migration to create the `user_subscriptions` table:

```bash
psql -f dodo-payments-migration.sql
```

### Webhooks Not Received

**Possible causes**:

1. Ngrok not running for local development
2. Wrong webhook URL in Dodo dashboard
3. Wrong webhook secret

**Solution**:

```bash
# Check ngrok is running
curl https://your-ngrok-url.ngrok.io/api/webhooks/dodo-payments

# Should return: Method Not Allowed (expecting POST)
```

### Payment Tracking Not Working

**Check**:

1. Verify `payment_history` table exists
2. Check RLS policies allow inserts
3. Review webhook logs for errors

### Subscription Status Stuck on 'trialing'

This is normal during the trial period. The status will change to `active` after the first payment succeeds.

## Database Tables Reference

### user_subscriptions

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan_id TEXT,
  status TEXT, -- 'active', 'cancelled', 'expired', 'trialing', 'failed'
  dodo_subscription_id TEXT,
  dodo_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### payment_history

```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  dodo_payment_id TEXT UNIQUE,
  dodo_subscription_id TEXT,
  amount NUMERIC,
  currency TEXT,
  status TEXT, -- 'pending', 'processing', 'succeeded', 'failed', 'cancelled'
  payment_method TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Next Steps

1. ✅ Run database migrations
2. ✅ Verify environment variables
3. ✅ Set up webhooks in Dodo dashboard
4. ✅ Test subscription creation
5. ✅ Monitor webhook events
6. ✅ Test payment success and failure scenarios

## Production Deployment

Before going live:

1. Update environment variables:

   - Set `DODO_PAYMENTS_ENVIRONMENT=live_mode`
   - Update `DODO_PAYMENTS_API_KEY` to live key
   - Update `DODO_PAYMENTS_RETURN_URL` to production URL

2. Update webhook URL in Dodo dashboard to production URL

3. Test thoroughly in production environment

4. Monitor logs and payment history for the first few transactions

## Support

If you encounter issues:

1. Check the logs in your terminal
2. Review the Supabase logs
3. Check the Dodo Payments dashboard for webhook delivery status
4. Run `check-dodo-setup.sql` to verify database state


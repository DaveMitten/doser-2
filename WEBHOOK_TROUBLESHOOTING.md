# Webhook Troubleshooting Guide

## 🔍 Issue Summary

After successful payment in Dodo Payments, users are redirected back to the app but see an error modal. The subscription is not being created in the database because **webhooks are not being received**.

## ✅ What I Fixed

### 1. Billing Success Page (`/billing/success/page.tsx`)

**Problem**: The page was not properly configured for Dodo Payments redirect handling.

**Solution**: Updated the page to:

- Wait 2 seconds for webhooks to process
- Refetch subscription data from the database
- Show success message and redirect to dashboard

**Status**: ✅ FIXED

## ❌ What Still Needs to Be Done

### 2. Webhook Configuration

**Problem**: Dodo Payments webhooks are not being received by your app. This means:

- Payment succeeds in Dodo ✅
- User is redirected back to app ✅
- BUT webhook never fires ❌
- Subscription is never created in database ❌

**Evidence**:

- No logs found for `handleWebhookEvent` or `Processing subscription activation`
- No subscription records in database
- Payment shows as successful in Dodo dashboard but doesn't create subscription locally

## 🔧 Required Actions

### Step 1: Verify Webhook URL in Dodo Dashboard

1. Go to your **Dodo Payments Dashboard**
2. Navigate to **Settings** → **Webhooks**
3. Verify your webhook URL is: `https://2d2c887a5987.ngrok.app/api/webhooks/dodo-payments`

   - ⚠️ This ngrok URL changes every time you restart ngrok!
   - If you restarted ngrok, you need to update this URL

4. Ensure these events are enabled:
   - ✅ `subscription.created`
   - ✅ `subscription.activated`
   - ✅ `subscription.cancelled`
   - ✅ `subscription.failed`
   - ✅ `payment.succeeded`
   - ✅ `payment.failed`

### Step 2: Verify Webhook Secret

1. In Dodo Payments Dashboard → Webhooks
2. Copy the **Webhook Signing Secret**
3. Ensure it matches `DODO_PAYMENTS_WEBHOOK_KEY` in your `.env.local`

### Step 3: Test Webhook Endpoint

Run this command to verify your webhook endpoint is accessible:

```bash
curl -X POST https://2d2c887a5987.ngrok.app/api/webhooks/dodo-payments \
  -H "Content-Type: application/json" \
  -d '{"test": "ping"}'
```

**Expected**: Should return HTTP 401 (this is correct - means endpoint is accessible but rejecting unauthorized requests)

**If you get connection refused**: ngrok is not running or URL is wrong

### Step 4: Check Ngrok Status

Your current ngrok URL: `https://2d2c887a5987.ngrok.app`

To verify ngrok is running:

```bash
curl http://127.0.0.1:4040/api/tunnels
```

If ngrok is not running, start it:

```bash
npx ngrok http 3000
```

⚠️ **IMPORTANT**: Every time you restart ngrok, you get a NEW URL. You must update the webhook URL in Dodo dashboard!

### Step 5: Run Diagnostic Tool

I've created a diagnostic tool to check your subscription status:

```bash
node check-subscription-status.js
```

This will:

- Check Supabase database for subscriptions
- Check Supabase database for payment history
- Query Dodo Payments API for subscriptions
- Show you what's missing

## 🔍 How to Verify It's Working

### 1. Check Terminal Logs

When webhooks are working, you should see logs like:

```
Dodo webhook event received: { type: 'subscription.created', ... }
Processing subscription activation: { subscriptionId: 'sub_xxx', userId: '...', ... }
Subscription activated successfully: { userId: '...', planId: '...', status: 'trialing' }
```

### 2. Check Database

Run this in Supabase SQL Editor:

```sql
-- Check for recent subscriptions
SELECT * FROM user_subscriptions
ORDER BY created_at DESC
LIMIT 5;

-- Check for recent payments
SELECT * FROM payment_history
ORDER BY created_at DESC
LIMIT 5;
```

### 3. Check Dodo Dashboard

1. Go to Dodo Payments Dashboard
2. Navigate to **Webhooks** → **Logs**
3. You should see webhook delivery attempts
4. Check if they're succeeding (200) or failing (4xx/5xx)

## 🐛 Common Issues

### Issue 1: Ngrok URL Changed

**Symptom**: Webhooks stopped working after restarting ngrok

**Solution**:

1. Get new ngrok URL: `curl http://127.0.0.1:4040/api/tunnels | grep public_url`
2. Update webhook URL in Dodo dashboard
3. Update `NEXT_PUBLIC_APP_URL` in `.env.local` if needed
4. Restart your Next.js dev server

### Issue 2: Webhook Secret Mismatch

**Symptom**: Webhook endpoint returns 401

**Solution**:

1. Get webhook secret from Dodo dashboard
2. Update `DODO_PAYMENTS_WEBHOOK_KEY` in `.env.local`
3. Restart Next.js dev server

### Issue 3: Events Not Enabled

**Symptom**: Some webhooks work but subscription creation doesn't

**Solution**: Verify ALL required events are enabled in Dodo dashboard (see Step 1 above)

### Issue 4: Firewall/Network Issues

**Symptom**: Webhook endpoint not accessible from outside

**Solution**:

1. Verify ngrok is running
2. Test endpoint: `curl https://your-ngrok-url.ngrok.app/api/webhooks/dodo-payments`
3. Check firewall settings

## 📝 What Happens After Payment

Here's the correct flow:

1. User clicks "Start Trial" → Creates checkout session
2. User completes payment in Dodo Payments checkout
3. Dodo Payments sends webhooks to your app:
   - `subscription.created` or `subscription.activated`
   - `payment.succeeded`
4. Your webhook handler creates/updates subscription in database
5. Dodo Payments redirects user to `/billing/success`
6. Success page waits 2 seconds for webhooks to complete
7. Success page refetches subscription data
8. Shows success message
9. Redirects to dashboard after 3 seconds

**Current Problem**: Step 3 & 4 are not happening (webhooks not received)

## ✅ Next Steps

1. [ ] Verify webhook URL in Dodo dashboard matches current ngrok URL
2. [ ] Verify webhook events are all enabled
3. [ ] Test webhook endpoint accessibility
4. [ ] Run diagnostic tool (`node check-subscription-status.js`)
5. [ ] Do a test payment and watch terminal logs
6. [ ] Check Dodo dashboard webhook logs for delivery status
7. [ ] Verify subscription appears in database after test payment

## 🆘 Still Not Working?

If webhooks are still not working after following this guide:

1. **Check Dodo Dashboard Webhook Logs**:

   - Are webhooks being sent?
   - What's the response code? (200 = success, 4xx/5xx = error)
   - What's the error message?

2. **Check Your Terminal Logs**:

   - Are webhook requests reaching your app?
   - Are there any errors in the webhook handler?

3. **Test Manually**:
   ```bash
   # Send a test webhook manually
   curl -X POST https://2d2c887a5987.ngrok.app/api/webhooks/dodo-payments \
     -H "Content-Type: application/json" \
     -H "X-Dodo-Signature: test" \
     -d '{
       "type": "subscription.activated",
       "data": {
         "attributes": {
           "id": "sub_test123",
           "customer_id": "cus_test123",
           "status": "active",
           "current_period_start": "2025-10-19T00:00:00Z",
           "current_period_end": "2025-11-19T00:00:00Z",
           "created_at": "2025-10-19T00:00:00Z",
           "updated_at": "2025-10-19T00:00:00Z",
           "metadata": {
             "user_id": "your-user-id-here",
             "plan_id": "pdt_QT8CsZEYopzV38iWlE0Sb"
           }
         }
       }
     }'
   ```

## 📚 Reference Files

- Webhook handler: `src/app/api/webhooks/dodo-payments/route.ts`
- Dodo service: `src/lib/dodo-service.ts`
- Billing success page: `src/app/(authorised)/billing/success/page.tsx`
- Setup instructions: `SETUP_INSTRUCTIONS.md`
- Diagnostic tool: `check-subscription-status.js`

---

**Last Updated**: 2025-10-19  
**Ngrok URL (when this was written)**: `https://2d2c887a5987.ngrok.app`  
**Status**: Webhooks not being received - needs configuration in Dodo dashboard

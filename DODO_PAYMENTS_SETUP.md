# Dodo Payments Setup Guide

This guide will help you set up Dodo Payments for your Doser application.

## Prerequisites

1. A Dodo Payments account
2. Your Dodo Payments API credentials
3. A webhook endpoint URL (for local development, use ngrok)

## Step 1: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Dodo Payments Configuration
DODO_PAYMENTS_API_KEY=your_dodo_api_key_here
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_KEY=your_webhook_secret_here
DODO_PAYMENTS_RETURN_URL=https://yourdomain.com/billing/success

# Your app URL (for local development, use ngrok or similar)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Create Products in Dodo Payments Dashboard

You need to create products in your Dodo Payments dashboard for each subscription plan:

### Learn Plan

- Product Name: "Doser Learn Plan"
- Price: £4.99
- Billing Interval: Monthly
- Product ID: `pdt_learn_monthly` (or use the generated ID)

### Track Plan

- Product Name: "Doser Track Plan"
- Price: £9.99
- Billing Interval: Monthly
- Trial Period: 7 days
- Product ID: `pdt_track_monthly` (or use the generated ID)

### Optimize Plan

- Product Name: "Doser Optimize Plan"
- Price: £19.99
- Billing Interval: Monthly
- Trial Period: 7 days
- Product ID: `pdt_optimize_monthly` (or use the generated ID)

### Annual Plans

Create corresponding annual products:

- Learn Annual: £54.89
- Track Annual: £109.89
- Optimize Annual: £219.89

## Step 3: Update Product IDs

After creating products in Dodo Payments, update the product IDs in your code:

1. Open `src/lib/dodo-types.ts`
2. Update the `SUBSCRIPTION_PLANS` and `ANNUAL_PLANS` objects with the actual product IDs from Dodo Payments:

```typescript
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  learn: {
    id: "learn",
    name: "Learn",
    price: 4.99,
    currency: "GBP",
    interval: "month",
    dodo_product_id: "pdt_your_actual_learn_product_id", // Update this
    features: [
      "Basic dosage calculator",
      "5 calculations per day",
      "Basic vaporizer profiles",
      "Safety guidelines",
    ],
  },
  // ... update other plans
};
```

## Step 4: Set Up Webhooks

1. In your Dodo Payments dashboard, go to Webhooks
2. Add a new webhook endpoint: `https://yourdomain.com/api/webhooks/dodo-payments`
3. Select the following events:
   - `subscription.created`
   - `subscription.activated`
   - `subscription.cancelled`
   - `subscription.failed`
   - `subscription.expired`
   - `payment.succeeded`
   - `payment.failed`
4. Copy the webhook secret and add it to your environment variables

## Step 5: Database Migration

Run the database migration to add Dodo Payments fields:

```sql
-- Run the migration script
\i dodo-payments-migration.sql
```

## Step 6: Test the Integration

1. Start your development server:

   ```bash
   npm run dev
   ```

2. For local testing with webhooks, use ngrok:

   ```bash
   npx ngrok http 3001
   ```

3. Update your webhook URL in Dodo Payments dashboard to use the ngrok URL

4. Test the subscription flow:
   - Visit `/pricing`
   - Click on a plan
   - Complete the checkout process
   - Verify the webhook events are received

## Step 7: Production Deployment

1. Update environment variables in your production environment
2. Update webhook URLs to use your production domain
3. Switch `DODO_PAYMENTS_ENVIRONMENT` to `live_mode`
4. Test thoroughly before going live

## API Endpoints

The following API endpoints are available:

- `GET /api/checkout` - Static checkout (for direct product links)
- `POST /api/checkout` - Checkout sessions (recommended)
- `GET /api/customer-portal` - Customer portal access
- `POST /api/webhooks/dodo-payments` - Webhook handler
- `POST /api/subscriptions/create` - Create subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/status` - Get subscription status

## Troubleshooting

### Common Issues

1. **"Dodo API key not found"**

   - Check your `.env.local` file exists
   - Verify `DODO_PAYMENTS_API_KEY` is set correctly

2. **"Invalid product ID"**

   - Verify product IDs in your Dodo Payments dashboard
   - Update the product IDs in `dodo-types.ts`

3. **Webhook events not received**

   - Check webhook URL is correct
   - Verify webhook secret matches
   - Check ngrok is running for local development

4. **Checkout redirect not working**
   - Verify `DODO_PAYMENTS_RETURN_URL` is set correctly
   - Check the return URL is accessible

### Testing

Use Dodo Payments test mode for development. Test cards and scenarios are available in their documentation.

## Support

- Dodo Payments Documentation: https://docs.dodopayments.com/
- Dodo Payments Support: Contact through their dashboard
- This app's support: Check the repository issues

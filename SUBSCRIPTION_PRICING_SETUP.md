# Subscription-Aware Pricing Buttons - Setup Guide

This document provides instructions for setting up the new subscription-aware pricing functionality.

## Changes Implemented

### 1. New Components Created

- **ChangePlanModal** (`src/components/subscription/ChangePlanModal.tsx`)

  - Contact form modal for plan change requests
  - Shows success/error states
  - Auto-closes after successful submission

- **Label UI Component** (`src/components/ui/label.tsx`)

  - Form label component using Radix UI

- **Textarea UI Component** (`src/components/ui/textarea.tsx`)
  - Form textarea component for messages

### 2. New API Endpoint

- **Change Plan Request** (`src/app/api/subscriptions/change-plan-request/route.ts`)
  - Authenticated endpoint for handling plan change requests
  - Rate limiting: 3 requests per hour per user
  - Sends email to info@doserapp.com with user details and request

### 3. Updated Components

- **SubscriptionButton** (`src/components/subscription/SubscriptionButton.tsx`)

  - Now detects if user has active subscription
  - Shows "Current Plan" for current plan (disabled)
  - Shows "Change Plan" for other plans when user has subscription
  - Opens modal instead of creating subscription for plan changes

- **PricingCard** (`src/components/subscription/PricingCard.tsx`)

  - Integrates ChangePlanModal
  - Passes subscription data to SubscriptionButton
  - Manages modal open/close state

- **PricingSection** (`src/components/pricing/PricingSection.tsx`)
  - Fetches user subscription data using UserDataContext
  - Passes subscription status to all PricingCard components

## Environment Variables Required

Add the following environment variable to your `.env.local` file:

```bash
# Resend API Key (for sending plan change request emails)
RESEND_API_KEY=your_resend_api_key_here

# Optional: Upstash Redis (for rate limiting)
# If not provided, rate limiting will be skipped
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### Getting a Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys section
3. Create a new API key
4. Add it to your `.env.local` file

### Configuring Email Domain (Important!)

The API endpoint currently sends emails from `noreply@doserapp.com`. You need to:

1. Verify your domain in Resend
2. Add DNS records as instructed by Resend
3. Update the `from` address in `src/app/api/subscriptions/change-plan-request/route.ts` if using a different domain:

```typescript
from: "Doser Support <noreply@yourdomain.com>",
```

### Testing Without Domain Verification

For testing purposes, Resend provides a test email address. Update the route temporarily:

```typescript
from: "onboarding@resend.dev",
to: "delivered@resend.dev", // Change from info@doserapp.com for testing
```

## How It Works

### For Users Without Subscription

1. User visits `/upgrade` page
2. Sees "Start 7-Day Trial" buttons on all plans
3. Clicking button initiates subscription creation flow

### For Users With Active Subscription

1. User visits `/upgrade` page
2. Current plan shows "Current Plan" button (disabled)
3. Other plans show "Change Plan" button
4. Clicking "Change Plan" opens contact form modal
5. User fills out form (name, email, message)
6. Form submits to API endpoint
7. API validates, rate limits, and sends email to info@doserapp.com
8. Success message shows, modal closes after 2 seconds

## Email Content

The support team receives an email with:

- User's name and email (from form)
- User ID and account email (from session)
- Current plan
- Target plan
- User's message
- Timestamp

## Rate Limiting

- **Limit**: 3 requests per hour per user
- **Implementation**: Uses Upstash Redis (optional)
- **Fallback**: If Redis not configured, rate limiting is skipped

## Testing Checklist

- [ ] Environment variables configured
- [ ] Resend domain verified (or using test mode)
- [ ] Visit `/upgrade` as unauthenticated user - see trial buttons
- [ ] Sign up and activate subscription
- [ ] Visit `/upgrade` - current plan shows "Current Plan" (disabled)
- [ ] Other plans show "Change Plan"
- [ ] Click "Change Plan" - modal opens
- [ ] Submit form - email sent successfully
- [ ] Check rate limiting - try 4 requests within hour

## Package Dependencies Added

The following packages were installed:

- `resend` - Email sending service
- `@radix-ui/react-label` - UI component for labels

Existing packages used:

- `@upstash/ratelimit` - Rate limiting (optional)
- `@upstash/redis` - Redis client (optional)
- `@radix-ui/react-dialog` - Modal component

## Future Enhancements

Potential improvements for future iterations:

- Admin dashboard to view/manage plan change requests
- Automated plan change workflow
- In-app notifications when plan change is processed
- Plan comparison tool in modal
- Price difference calculator

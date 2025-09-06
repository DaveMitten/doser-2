# 🚀 Mollie Subscription Setup Guide

## ✅ What's Been Implemented

### 1. **Mollie Integration**

- ✅ Mollie API client installed (`@mollie/api-client`)
- ✅ TypeScript types for subscriptions and payments
- ✅ Mollie service for subscription management
- ✅ Webhook handler for payment status updates
- ✅ API routes for subscription operations

### 2. **Database Schema**

- ✅ `user_subscriptions` table for subscription data
- ✅ `subscription_payments` table for payment history
- ✅ `subscription_features` table for feature access control
- ✅ Row Level Security policies
- ✅ Database functions for feature checking

### 3. **UI Components**

- ✅ Updated pricing page with Mollie integration
- ✅ Subscription button component
- ✅ Billing dashboard for subscription management
- ✅ Billing success page for payment confirmation
- ✅ Subscription hook for state management

## 🔧 Environment Variables Setup

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://cppbdcylcwpjuhyxiwud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Mollie Configuration
MOLLIE_API_KEY=test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM
MOLLIE_ENVIRONMENT=test

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Database Setup

1. **Run the subscription SQL**:

   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `mollie-subscription-setup.sql`
   - Click "Run" to execute

2. **Verify tables created**:
   - `user_subscriptions`
   - `subscription_payments`
   - `subscription_features`

## 🔑 Mollie Account Setup

1. **Create Mollie Account**:

   - Go to [mollie.com](https://www.mollie.com)
   - Sign up for a free account
   - Complete verification process

2. **Get API Keys**:

   - Go to Developers > API Keys
   - Copy your test API key
   - Update `MOLLIE_API_KEY` in `.env.local`

3. **Get Webhook Secret**:

   - Go to Developers > Webhooks
   - Create a new webhook or edit existing one
   - Copy the webhook secret token
   - Add `MOLLIE_WEBHOOK_SECRET_PROD | MOLLIE_WEBHOOK_SECRET_LOCAL` to `.env.local`

4. **Configure Webhooks**:
   - Go to Developers > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/mollie`
   - Select events: `payment-link.paid`, `sales-invoice.paid`, `sales-invoice.created`, `sales-invoice.issued`

### 📝 **Environment Variables Setup**

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Mollie Configuration
MOLLIE_API_KEY=your_mollie_test_api_key_here
MOLLIE_WEBHOOK_SECRET=your_mollie_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Replace all placeholder values with your actual keys and secrets!

### 🌐 **Local Development with Localtunnel**

For local development, you'll need to expose your local server to the internet so Mollie can send webhooks:

#### **Quick Start (Recommended)**

```bash
# Start development server with tunnel
npm run dev:tunnel
```

This single command will:

- ✅ Start your Next.js development server
- ✅ Install localtunnel if needed
- ✅ Create a public tunnel to your local server
- ✅ Display the webhook URL for Mollie configuration
- ✅ Handle cleanup when you stop (Ctrl+C)

#### **Manual Setup (Alternative)**

```bash
# Install localtunnel globally
npm install -g localtunnel

# Start your development server (in one terminal)
npm run dev

# Expose your local server (in another terminal)
lt --port 3000 --subdomain doser-dev
```

#### **Configure Mollie for Local Development**

1. **Copy the webhook URL** from the script output (e.g., `https://doser-dev.loca.lt/api/webhooks/mollie`)
2. **Go to Mollie Dashboard** > Developers > Webhooks
3. **Add the webhook URL** from step 1
4. **Select events**: `payment-link.paid`, `sales-invoice.paid`, `sales-invoice.created`, `sales-invoice.issued`
5. **Save the configuration**

## 🧪 Testing the Integration

### **Step 1: Start Development Server with Tunnel**

```bash
npm run dev:tunnel
```

**Expected output:**

```
🚀 Starting Doser development server with localtunnel...

✅ localtunnel found
🔧 Starting Next.js development server...
[Next.js] ready - started server on 0.0.0.0:3000, url: http://localhost:3000

🌐 Starting localtunnel...
[Tunnel] your url is: https://doser-dev.loca.lt

🎉 Development server is ready!
📱 Local: http://localhost:3000
🌍 Public: https://doser-dev.loca.lt
🔗 Webhook URL: https://doser-dev.loca.lt/api/webhooks/mollie

📋 Copy this webhook URL to your Mollie dashboard:
   https://doser-dev.loca.lt/api/webhooks/mollie

⏹️  Press Ctrl+C to stop both servers
```

### **Step 2: Configure Mollie Webhook**

1. **Copy the webhook URL** from the output above
2. **Go to Mollie Dashboard** > Developers > Webhooks
3. **Add the webhook URL** (e.g., `https://doser-dev.loca.lt/api/webhooks/mollie`)
4. **Select events**: `payment-link.paid`, `sales-invoice.paid`, `sales-invoice.created`, `sales-invoice.issued`
5. **Save the configuration**

### **Step 3: Test Subscription Flow**

#### **Test Free Plan (Starter)**

- Visit `http://localhost:3000/pricing`
- Click "Get Started Free" on Starter plan
- Should create free subscription immediately
- Check `/billing` to verify subscription status

#### **Test Paid Plans (Pro/Expert)**

- Visit `http://localhost:3000/pricing`
- Click "Start 7-Day Trial" on Pro/Expert plan
- Should redirect to Mollie checkout
- Complete test payment using Mollie's test cards
- Should redirect to `/billing/success`
- Check `/billing` to verify subscription status

#### **Test Billing Dashboard**

- Visit `http://localhost:3000/billing` (requires authentication)
- Should show current subscription status
- Test subscription cancellation
- Verify webhook events in Mollie dashboard

### **Step 4: Monitor Webhook Events**

- Check your terminal for webhook logs
- Verify events are being received and processed
- Check database for updated subscription records

## 💳 Payment Methods Available

Mollie supports 30+ payment methods including:

- **Credit Cards**: Visa, Mastercard, American Express
- **European Methods**: iDEAL, Bancontact, SEPA Direct Debit
- **Digital Wallets**: PayPal, Apple Pay, Google Pay
- **Buy Now, Pay Later**: Klarna, Billie
- **Bank Transfers**: SEPA, BACS

## 🔒 Security Features

- **PCI Compliance**: Mollie handles all sensitive payment data
- **Webhook Verification**: Optional signature verification
- **Row Level Security**: Users can only access their own data
- **Environment Separation**: Test/live environment support

## 📊 Subscription Plans

### **Starter Plan** (Free)

- Basic dosage calculator
- 5 calculations per day
- Basic vaporizer profiles
- Safety guidelines

### **Pro Plan** (€9.99/month)

- Everything in Starter
- Unlimited calculations
- Session tracking & history
- Tolerance monitoring
- Custom vaporizer profiles
- Weekly insights
- Basic AI recommendations
- 7-day free trial

### **Expert Plan** (€19.99/month)

- Everything in Pro
- Advanced AI recommendations
- Medical condition profiles
- Detailed analytics & reports
- Export data (PDF/CSV)
- Priority support
- Batch calculations
- 7-day free trial

## 🚀 Next Steps

1. **Set up environment variables**
2. **Run database migration**
3. **Configure Mollie account**
4. **Test the integration**
5. **Deploy to production**

## 🐛 Troubleshooting

### Common Issues:

1. **"Mollie API key not found"**

   - Check `.env.local` file exists
   - Verify `MOLLIE_API_KEY` is set correctly

2. **"Database error"**

   - Ensure subscription SQL was run
   - Check Supabase connection

3. **"Webhook not working"**

   - Verify webhook URL is accessible
   - Check Mollie webhook configuration

4. **"Payment not processing"**
   - Check Mollie test mode
   - Verify redirect URLs are correct

## 📞 Support

- **Mollie Documentation**: [docs.mollie.com](https://docs.mollie.com)
- **Mollie Support**: Available in your Mollie dashboard
- **Supabase Support**: Available in your Supabase dashboard

---

## 🎉 Ready to Go!

Your Doser app now has full subscription billing capabilities with Mollie! Users can:

- Subscribe to free and paid plans
- Start free trials
- Manage their subscriptions
- Access features based on their plan
- Cancel subscriptions anytime

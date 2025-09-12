# 🌐 Ngrok Setup for Mollie Testing

## Prerequisites

### 1. Install Ngrok

Choose one of the following installation methods:

**Option A: Download from ngrok.com (Recommended)**

1. Visit https://ngrok.com/download
2. Download the appropriate version for your OS
3. Extract and add to your PATH

**Option B: Package Manager**

```bash
# macOS with Homebrew
brew install ngrok/ngrok/ngrok

# Or via npm (global)
npm install -g ngrok
```

**Option C: Install via npm (local)**

```bash
npm install
```

### 2. Create Ngrok Account (Optional but Recommended)

1. Sign up at https://ngrok.com/signup
2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure ngrok with your authtoken:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cppbdcylcwpjuhyxiwud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App URLs - Will be dynamically set by ngrok
NEXT_PUBLIC_SITE_URL=https://your-ngrok-url.ngrok-free.app
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok-free.app

# Mollie Configuration
MOLLIE_API_KEY=your_mollie_test_api_key_here
MOLLIE_ENVIRONMENT=test
MOLLIE_WEBHOOK_SECRET_LOCAL=your_webhook_secret_here

# Development tunnel URL (set by dev-with-tunnel.js)
DEV_WEBHOOK_URL=https://your-ngrok-url.ngrok-free.app
```

## Supabase Dashboard Configuration

### 1. Update Site URL

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/cppbdcylcwpjuhyxiwud
2. Navigate to **Authentication > URL Configuration**
3. Update **Site URL** to your ngrok URL (e.g., `https://abc123.ngrok-free.app`)
4. Add **Redirect URLs**:
   - `https://abc123.ngrok-free.app/auth/callback`
   - `https://abc123.ngrok-free.app/auth/verified`
   - `https://abc123.ngrok-free.app/auth/error`

### 2. Update Email Templates

1. Go to **Authentication > Email Templates**
2. Update **Confirm signup** template:
   - Change `{{ .ConfirmationURL }}` to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`
3. Update **Magic Link** template:
   - Change `{{ .ConfirmationURL }}` to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`

## Mollie Dashboard Configuration

### 1. Update Webhook URL

1. Go to your Mollie dashboard
2. Navigate to **Developers > Webhooks**
3. Update webhook URL to: `https://your-ngrok-url.ngrok-free.app/api/webhooks/mollie`

## Running with Ngrok

### Option 1: Using the Development Script (Recommended)

```bash
# Start the development server with ngrok tunnel
npm run dev:ngrok
# or
npm run dev:tunnel
```

The script will:

- Start Next.js on port 3000
- Create an ngrok tunnel
- Display the public URL and webhook URL
- Set the DEV_WEBHOOK_URL environment variable

### Option 2: Manual Setup

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

## Ngrok Features

### Free Tier

- Random subdomain (e.g., `abc123.ngrok-free.app`)
- Basic HTTP/HTTPS tunneling
- Limited concurrent tunnels

### Paid Tiers

- Custom subdomains
- Reserved domains
- Multiple concurrent tunnels
- Advanced features

## Testing Checklist

- [ ] Authentication flow works with ngrok URL
- [ ] Email confirmations redirect properly
- [ ] Mollie webhooks are received
- [ ] Payment redirects work correctly
- [ ] All internal links use the ngrok URL
- [ ] Ngrok warning page is bypassed (if using free tier)

## Troubleshooting

### Common Issues:

1. **Ngrok not found**: Ensure ngrok is installed and in your PATH
2. **CORS errors**: Ensure Supabase site URL is updated
3. **Webhook not received**: Check Mollie webhook URL configuration
4. **Auth redirects fail**: Verify redirect URLs in Supabase dashboard
5. **Ngrok warning page**: Free tier shows a warning page on first visit

### Debug Commands:

```bash
# Check if ngrok is working
curl https://your-ngrok-url.ngrok-free.app/api/webhooks/mollie

# Test webhook endpoint
curl -X GET https://your-ngrok-url.ngrok-free.app/api/webhooks/mollie

# Check ngrok status
ngrok status
```

### Ngrok Warning Page (Free Tier)

The free tier shows a warning page on first visit. To bypass this:

1. Click "Visit Site" on the warning page
2. Or add `--host-header=rewrite` to ngrok command
3. Or upgrade to a paid plan for custom domains

## Migration from Localtunnel

If migrating from localtunnel:

1. Install ngrok following the prerequisites above
2. Update your environment variables to use ngrok URLs
3. Update Supabase and Mollie configurations
4. Use `npm run dev:ngrok` instead of the old tunnel script

## Advantages of Ngrok over Localtunnel

- More reliable and stable
- Better performance
- Custom domains (paid tier)
- Built-in web interface
- Better error handling
- More configuration options

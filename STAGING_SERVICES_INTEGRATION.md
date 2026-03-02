# Staging Environment - Complete Services Integration Plan

This document covers how to configure EVERY service and integration for staging vs production.

---

## Services Used by Doser

| Service           | Purpose                 | Has Test Mode? | Staging Strategy               |
| ----------------- | ----------------------- | -------------- | ------------------------------ |
| **Vercel**        | Hosting                 | Yes (Preview)  | Separate deployment            |
| **Supabase**      | Database + Auth         | No             | Separate project (recommended) |
| **Dodo Payments** | Subscriptions           | ✅ Yes         | Test mode keys                 |
| **Resend**        | Email delivery          | Partial        | Same account, different sender |
| **Sentry**        | Error tracking          | Tags           | Same or separate project       |
| **Statsig**       | Analytics/Feature flags | Yes            | Separate environment           |
| **Upstash Redis** | Rate limiting           | No             | Same or separate database      |

---

## 1. Dodo Payments Configuration

### Production Setup:

```bash
DODO_PAYMENTS_API_KEY=your_live_key
DODO_PAYMENTS_ENVIRONMENT=live_mode
DODO_PAYMENTS_WEBHOOK_KEY=whsec_live_...
```

### Staging Setup:

```bash
DODO_PAYMENTS_API_KEY=your_test_key
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_KEY=whsec_test_...
```

### How to Get Test Mode Keys:

1. Go to [Dodo Payments Dashboard](https://app.dodopayments.com)
2. Toggle to **"Test Mode"** (top right corner)
3. Go to **Settings** → **API Keys**
4. Copy test mode keys
5. Go to **Settings** → **Webhooks**
6. Create webhook for staging:
   ```
   URL: https://staging.doserapp.com/api/webhooks/dodo-payments
   Events: All subscription events
   ```
7. Copy the test mode webhook secret

### Testing Subscriptions on Staging:

**Test mode features:**

- ✅ Create subscriptions without real charges
- ✅ Test webhook events
- ✅ Use test payment methods
- ✅ Test subscription lifecycle (active, cancelled, expired)

**Test Payment Methods:**

```
Test Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Trigger Test Events:**

- Successful payment: Card ending in 4242
- Failed payment: Card ending in 0002
- Requires authentication: Card ending in 3220

### Subscription Plans Configuration:

Your plans (from `src/lib/dodo-types.ts`):

- Learn: £4.99/month
- Track: £9.99/month
- Optimize: £19.99/month

**Staging Strategy:**

- Use same plan IDs for consistency
- Payments will be in test mode (no real charges)
- Can create test plans with £0.01 pricing if needed

---

## 2. Supabase Configuration

### Option A: Separate Staging Project (Recommended)

**Production:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://cppbdcylcwpjuhyxiwud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Staging:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Setup Steps:**

1. Create new Supabase project: `doser-staging`
2. Run database schema (copy from production)
3. Configure auth settings for staging URL
4. **Benefits:**
   - ✅ Separate email rate limits (2/hour each)
   - ✅ Isolated data
   - ✅ Can test database migrations safely
   - ✅ Free tier (same as production)

### Option B: Shared Project (Not Recommended)

**Issues with sharing:**

- ❌ Email rate limits shared (will affect production)
- ❌ Test data mixed with production
- ❌ Risky for testing destructive operations

**Only use if:**

- Very low traffic
- Short-term testing only
- Will upgrade to separate soon

### Database Setup for Staging:

```sql
-- Export production schema
-- In production Supabase: SQL Editor → New Query
-- Run this to get schema:

SELECT
    'CREATE TABLE ' || tablename || ' (...);' as create_statement
FROM pg_tables
WHERE schemaname = 'public';

-- Then run in staging Supabase
```

**Or use migration files:**

```bash
# If you have migration files in repo
# Apply them to staging project
```

### Auth Configuration:

**In Staging Supabase:**

1. **Authentication** → **URL Configuration**
   - Site URL: `https://staging.doserapp.com`
   - Redirect URLs: Add staging URLs

2. **Authentication** → **Email Templates**
   - Update all template URLs to use staging domain
   - Example: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`

3. **Authentication** → **SMTP Settings** (if using custom SMTP)
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: Same Resend API key
   - Sender: `staging@doserapp.com`

---

## 3. Resend Email Configuration

### Strategy: Same Account, Different Senders

**Production Emails:**

```
From: Doser <noreply@doserapp.com>
```

**Staging Emails:**

```
From: Doser Staging <staging@doserapp.com>
```

**Environment Variables:**

```bash
# Same key for both environments
RESEND_API_KEY=re_your_api_key

# App URL determines email content
NEXT_PUBLIC_APP_URL=https://staging.doserapp.com (staging)
NEXT_PUBLIC_APP_URL=https://doserapp.com (production)
```

### Update Email Sending Code:

```typescript
// src/lib/email.ts (or wherever email logic lives)

const getEmailFrom = () => {
  const isProduction =
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_APP_URL?.includes("doserapp.com") &&
    !process.env.NEXT_PUBLIC_APP_URL?.includes("staging");

  if (isProduction) {
    return "Doser <noreply@doserapp.com>";
  }

  // Staging or development
  return "Doser Staging <staging@doserapp.com>";
};

// Use in email sending:
await resend.emails.send({
  from: getEmailFrom(),
  to: user.email,
  subject: "Welcome to Doser",
  // ...
});
```

### Domain Verification:

**For `staging@doserapp.com`:**

- Already verified (same domain as production)
- Can use immediately

**Alternative for quick testing:**

```
From: Doser Staging <onboarding@resend.dev>
```

- Works immediately
- No verification needed
- Good for initial staging setup

### Resend Dashboard Organization:

**Tag emails by environment:**

- Use Resend's email metadata/tags
- Filter by environment in dashboard
- Track staging vs production separately

---

## 4. Sentry Error Tracking

### Option A: Separate Projects (Recommended)

**Production:**

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o4510243455172608.ingest.de.sentry.io/4510243456090192
SENTRY_PROJECT=doser-production
```

**Staging:**

```bash
NEXT_PUBLIC_SENTRY_DSN=https://yyy@o4510243455172608.ingest.de.sentry.io/YOUR_STAGING_PROJECT_ID
SENTRY_PROJECT=doser-staging
```

**Setup:**

1. Go to Sentry Dashboard
2. Create new project: `doser-staging`
3. Copy new DSN
4. Configure alerts separately for staging

**Benefits:**

- ✅ Separate error tracking
- ✅ Won't pollute production error logs
- ✅ Different alert rules
- ✅ Free (same org, multiple projects)

### Option B: Same Project with Tags

**Both environments:**

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o4510243455172608.ingest.de.sentry.io/4510243456090192
SENTRY_ENVIRONMENT=staging  # or production
```

**Configure in code:**

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || "development",
  // ...
});
```

**Benefits:**

- ✅ Simpler setup
- ✅ One project to manage

**Cons:**

- ❌ Mixed error logs
- ❌ Need to filter by environment

---

## 5. Statsig Analytics & Feature Flags

### Separate Environments (Built-in)

Statsig supports environments natively!

**Production:**

```bash
NEXT_PUBLIC_STATSIG_CLIENT_KEY=client-your_prod_key
STATSIG_SERVER_KEY=secret-your_prod_key
```

**Staging:**

```bash
NEXT_PUBLIC_STATSIG_CLIENT_KEY=client-your_staging_key
STATSIG_SERVER_KEY=secret-your_staging_key
```

**Setup:**

1. Go to Statsig Dashboard
2. Create **"Staging"** environment
3. Copy environment-specific keys
4. Configure feature flags per environment

**Benefits:**

- ✅ Test feature flags on staging first
- ✅ Separate analytics
- ✅ No impact on production metrics
- ✅ Free tier supports multiple environments

### Feature Flag Testing Strategy:

**Workflow:**

1. Create feature flag in Statsig
2. Enable in staging environment
3. Test thoroughly
4. Roll out to production (% of users)
5. Monitor metrics
6. Full rollout or rollback

---

## 6. Upstash Redis (Rate Limiting)

### Option A: Same Database

**Both environments:**

```bash
UPSTASH_REDIS_REST_URL=https://tidy-man-17253.upstash.io
UPSTASH_REDIS_REST_TOKEN=AUNlAAInc...
```

**Use key prefixes:**

```typescript
// src/lib/rate-limit.ts
const getKeyPrefix = () => {
  const isProduction =
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_APP_URL?.includes("staging");

  return isProduction ? "prod:" : "staging:";
};

export async function checkRateLimit(identifier: string) {
  const key = `${getKeyPrefix()}${identifier}`;
  // ... rate limit logic
}
```

**Benefits:**

- ✅ Simple setup
- ✅ One database to manage
- ✅ Free tier sufficient

**Cons:**

- ❌ Shared limits (if you hit free tier cap)

### Option B: Separate Database

**Production:**

```bash
UPSTASH_REDIS_REST_URL=https://prod-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=token_prod
```

**Staging:**

```bash
UPSTASH_REDIS_REST_URL=https://staging-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=token_staging
```

**Setup:**

1. Create new Upstash database
2. Name: `doser-staging`
3. Copy credentials
4. Still free tier

**Benefits:**

- ✅ Completely isolated
- ✅ Separate rate limit quotas

---

## 7. Vercel Configuration

### Git Branch Strategy:

```
main → Production (doserapp.com)
staging → Staging (staging.doserapp.com)
feature/* → Preview (auto-generated URLs)
```

### Environment Variables per Environment:

**Vercel supports 3 environments:**

1. **Production** - `main` branch
2. **Preview** - all other branches
3. **Development** - local

**Configuration:**

Go to Vercel → Project → Settings → Environment Variables

**For each variable, set:**

- ☑️ Production (for `main` branch)
- ☑️ Preview (for `staging` and feature branches)
- ☐ Development (usually use `.env.local`)

**Production values** (main branch):

```bash
NEXT_PUBLIC_APP_URL=https://doserapp.com
NEXT_PUBLIC_SUPABASE_URL=https://prod-supabase.co
DODO_PAYMENTS_ENVIRONMENT=live_mode
# ... all production keys
```

**Preview values** (staging/feature branches):

```bash
NEXT_PUBLIC_APP_URL=https://staging.doserapp.com
NEXT_PUBLIC_SUPABASE_URL=https://staging-supabase.co
DODO_PAYMENTS_ENVIRONMENT=test_mode
# ... all staging/test keys
```

### Branch-Specific Configuration:

**Option: Target specific branch for staging**

1. Vercel → Settings → Git
2. **Production Branch:** `main`
3. Staging gets preview deployment

**Or use branch-specific env vars:**

- Can set different values for `staging` branch specifically
- More granular control

---

## 8. Domain Configuration

### DNS Setup:

**Production:**

```
doserapp.com → Vercel (main branch)
www.doserapp.com → Redirect to doserapp.com
```

**Staging:**

```
staging.doserapp.com → Vercel (staging branch)
```

**DNS Records:**

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel)

Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: staging
Value: cname.vercel-dns.com
```

### Vercel Domain Configuration:

**Production project:**

- `doserapp.com` (primary)
- `www.doserapp.com` (redirect)

**Staging setup:**

1. In same Vercel project → Domains
2. Add `staging.doserapp.com`
3. Assign to `staging` branch
4. Or use preview URL: `doser-2-git-staging-xxx.vercel.app`

---

## Complete Environment Variables Reference

### Production (.env.production)

```bash
# App
NEXT_PUBLIC_APP_URL=https://doserapp.com
NEXT_PUBLIC_SITE_URL=https://doserapp.com
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cppbdcylcwpjuhyxiwud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...production...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...production...

# Dodo Payments - LIVE MODE
DODO_PAYMENTS_API_KEY=live_key_xxx
DODO_PAYMENTS_ENVIRONMENT=live_mode
DODO_PAYMENTS_WEBHOOK_KEY=whsec_live_xxx

# Resend
RESEND_API_KEY=re_xxx

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://tidy-man-17253.upstash.io
UPSTASH_REDIS_REST_TOKEN=AUNlAAInc...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx.ingest.de.sentry.io/production
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ENVIRONMENT=production
SENTRY_PROJECT=doser-production

# Statsig
NEXT_PUBLIC_STATSIG_CLIENT_KEY=client-production-xxx
STATSIG_ENVIRONMENT=production

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ENV=production
```

### Staging (.env.staging)

```bash
# App
NEXT_PUBLIC_APP_URL=https://staging.doserapp.com
NEXT_PUBLIC_SITE_URL=https://staging.doserapp.com
NODE_ENV=production  # Still use production build

# Supabase - SEPARATE PROJECT
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...staging...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...staging...

# Dodo Payments - TEST MODE
DODO_PAYMENTS_API_KEY=test_key_xxx
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_KEY=whsec_test_xxx

# Resend - SAME KEY, different sender in code
RESEND_API_KEY=re_xxx  # Same as production

# Upstash Redis - SAME with prefix or separate
UPSTASH_REDIS_REST_URL=https://tidy-man-17253.upstash.io  # Or separate
UPSTASH_REDIS_REST_TOKEN=AUNlAAInc...  # Or separate

# Sentry - SEPARATE PROJECT
NEXT_PUBLIC_SENTRY_DSN=https://yyy.ingest.de.sentry.io/staging
SENTRY_AUTH_TOKEN=sntrys_xxx  # Same token, different project
SENTRY_ENVIRONMENT=staging
SENTRY_PROJECT=doser-staging

# Statsig - STAGING ENVIRONMENT
NEXT_PUBLIC_STATSIG_CLIENT_KEY=client-staging-xxx
STATSIG_ENVIRONMENT=staging

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ENV=preview
```

---

## Testing Checklist for Staging

### Payment Flow Testing:

- [ ] Can select subscription plan
- [ ] Checkout redirects to Dodo (test mode)
- [ ] Can complete payment with test card
- [ ] Webhook received and processed
- [ ] User subscription updated in database
- [ ] User redirected to success page
- [ ] Can cancel subscription
- [ ] Cancellation webhook processed
- [ ] Can change plan
- [ ] Plan change webhook processed

**Test Cards to Try:**

- ✅ Success: 4242 4242 4242 4242
- ❌ Decline: 4000 0000 0000 0002
- 🔐 Auth: 4000 0027 6000 3220

### Email Flow Testing:

- [ ] Sign up sends verification email
- [ ] Email received (check inbox)
- [ ] Verification link works
- [ ] Password reset email works
- [ ] Welcome email sent after verification
- [ ] All emails have correct branding
- [ ] Emails appear in Resend dashboard
- [ ] Email sender is staging address

### Auth Flow Testing:

- [ ] Sign up creates account
- [ ] Email verification redirects correctly
- [ ] Login works
- [ ] Protected routes redirect to login
- [ ] Logout works
- [ ] Session persists on refresh
- [ ] Password reset flow complete

### Integration Testing:

- [ ] Sentry captures errors correctly
- [ ] Sentry tags show "staging" environment
- [ ] Statsig analytics recording
- [ ] Feature flags work
- [ ] Rate limiting works
- [ ] All API routes respond correctly

---

## Cost Summary

| Service           | Production Cost     | Staging Cost   | Notes              |
| ----------------- | ------------------- | -------------- | ------------------ |
| Vercel            | Free/Pro ($20)      | Included       | Same project       |
| Supabase          | Free                | Free           | Separate project   |
| Dodo Payments     | Transaction fees    | $0 (test mode) | No charges in test |
| Resend            | Free (100/day)      | Included       | Same account       |
| Sentry            | Free (5k errors/mo) | Included       | Same org           |
| Statsig           | Free                | Free           | Separate env       |
| Upstash           | Free (10k req/day)  | Included/Free  | Share or separate  |
| Domain            | $12/yr              | $0             | Use subdomain      |
| **Total Monthly** | ~$20-40             | **~$0**        | Staging is free!   |

---

## Implementation Timeline

### Week 1: Essential Staging

- [ ] Create `staging` branch
- [ ] Configure Vercel preview deployment
- [ ] Set up staging environment variables
- [ ] Test basic deployment

### Week 2: Service Integration

- [ ] Create staging Supabase project
- [ ] Configure Dodo test mode
- [ ] Set up email with staging sender
- [ ] Test payment flow

### Week 3: Monitoring & Polish

- [ ] Configure Sentry staging project
- [ ] Set up Statsig staging environment
- [ ] Add staging domain (optional)
- [ ] Document workflow

### Week 4: Testing & Launch

- [ ] Complete testing checklist
- [ ] Train team on staging workflow
- [ ] Create deployment runbook
- [ ] Launch staging environment

---

## Quick Start Command Reference

```bash
# Create staging branch
git checkout -b staging
git push -u origin staging

# Deploy to staging (automatic via Vercel)
git push origin staging

# Merge tested features to production
git checkout main
git merge staging
git push  # Auto-deploys to production

# Sync staging with production
git checkout staging
git merge main
git push
```

---

## Questions Before We Start?

1. **Budget:** Comfortable with all free tiers?
2. **Timeline:** How quickly do you need staging?
3. **Testing:** Who will test on staging?
4. **Payments:** Want to test with real test transactions?
5. **Domain:** Want `staging.doserapp.com` or use preview URL?

Let me know and we can start implementation!

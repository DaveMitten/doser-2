# Staging Environment Setup Plan

This plan outlines how to set up a proper staging environment for Doser to safely test features, emails, and integrations before deploying to production.

## Overview

**Goal:** Create a staging environment that mirrors production but uses separate resources for testing.

**Benefits:**
- Test email flows without rate limits affecting production
- Test new features safely
- Debug issues without user impact
- Validate deployments before production

---

## Architecture Options

### Option 1: Vercel Preview Deployments (Simplest)

**How it works:**
- Every branch gets automatic preview deployment
- Use environment variables to differentiate
- Same Supabase project, different app URLs

**Pros:**
- ✅ Already set up (Vercel does this automatically)
- ✅ No additional cost
- ✅ Fast to implement
- ✅ Automatic deployments on push

**Cons:**
- ❌ Shares Supabase rate limits with production
- ❌ Preview URLs change with each deployment
- ❌ Less isolated

**Best for:** Quick testing, feature branches

---

### Option 2: Dedicated Staging Environment (Recommended)

**How it works:**
- Separate Vercel project for staging
- Separate Supabase project for staging
- Dedicated staging domain: `staging.doserapp.com`
- Isolated resources and rate limits

**Pros:**
- ✅ Completely isolated from production
- ✅ Separate rate limits (won't affect production)
- ✅ Stable staging URL
- ✅ Full production parity
- ✅ Safe for extensive testing

**Cons:**
- ❌ Requires separate Supabase project (still free tier)
- ❌ More setup required
- ❌ Need to manage two environments

**Best for:** Production-like testing, email testing, QA

---

### Option 3: Git Branch + Environment Variables (Middle Ground)

**How it works:**
- Create `staging` branch
- Vercel automatically deploys `staging` branch to staging environment
- Use environment variables to configure different services
- Share Supabase project but use different auth settings

**Pros:**
- ✅ Simple to set up
- ✅ Automatic deployments
- ✅ Can use different URLs for webhooks
- ✅ One Supabase project (easier to manage)

**Cons:**
- ❌ Still shares some Supabase rate limits
- ❌ Less isolation than Option 2

**Best for:** Small teams, moderate testing needs

---

## Recommended Approach: Option 2 (Dedicated Staging)

Here's the detailed plan for implementing Option 2:

## Step 1: Create Staging Supabase Project

### 1.1 Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Name: `doser-staging`
4. Choose same region as production
5. Use a strong password (save in password manager)
6. Click **"Create new project"**

### 1.2 Set Up Staging Database
1. In staging project, go to **SQL Editor**
2. Copy your production database schema
3. Run the schema SQL in staging
4. Create test user accounts

**Files to reference:**
- Look for `.sql` files in your repo
- Or export schema from production Supabase

### 1.3 Configure Staging Auth Settings
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://staging.doserapp.com`
3. Add **Redirect URLs**:
   - `https://staging.doserapp.com/auth/callback`
   - `https://staging.doserapp.com/**`

### 1.4 Configure Staging Email Settings
1. Go to **Authentication** → **Email Templates**
2. Update templates to use staging URL
3. **SMTP Settings** (if using custom SMTP):
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: Your Resend API key
   - Sender: `staging@doserapp.com` (or `onboarding@resend.dev` for testing)

---

## Step 2: Configure Vercel Staging Deployment

### 2.1 Create Staging Environment in Vercel

**Option A: Use Git Branch (Recommended)**
1. Vercel automatically creates preview for all branches
2. Create a `staging` branch
3. Vercel will deploy it to a preview URL
4. Can optionally assign custom domain

**Option B: Separate Vercel Project**
1. Go to Vercel Dashboard
2. Click **"Add New"** → **"Project"**
3. Import same GitHub repo
4. Name it `doser-staging`
5. Configure to deploy from `staging` branch

### 2.2 Configure Staging Domain (Optional but Recommended)

1. In Vercel project settings → **Domains**
2. Add custom domain: `staging.doserapp.com`
3. Add DNS records in your domain provider:
   ```
   Type: CNAME
   Name: staging
   Value: cname.vercel-dns.com
   ```

**Alternative:** Use Vercel's preview URL:
```
https://doser-2-git-staging-yourproject.vercel.app
```

### 2.3 Set Staging Environment Variables

In Vercel → Project Settings → Environment Variables:

**Create separate environment for "Preview" or specific branch:**

```bash
# Supabase Staging
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_key

# App URLs
NEXT_PUBLIC_SITE_URL=https://staging.doserapp.com
NEXT_PUBLIC_APP_URL=https://staging.doserapp.com

# Resend (same key, different sender)
RESEND_API_KEY=re_your_api_key  # Can use same as production

# Dodo Payments - TEST MODE
DODO_PAYMENTS_API_KEY=your_test_key
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_KEY=your_test_webhook_key

# Upstash Redis (can share or create separate)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Sentry (optional - separate project for staging)
NEXT_PUBLIC_SENTRY_DSN=your_staging_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_token

# Statsig (optional - same or separate)
NEXT_PUBLIC_STATSIG_CLIENT_KEY=your_statsig_key
```

**Important:** Set these variables scoped to:
- Environment: **Preview** (for all preview deployments)
- Or specific to `staging` branch

---

## Step 3: Configure External Services

### 3.1 Resend Email Configuration

**Option A: Use Same Resend Account, Different Sender**
- Staging emails from: `staging@doserapp.com`
- Production emails from: `noreply@doserapp.com`
- Helps identify staging vs production emails

**Option B: Use Resend Test Domain (Simplest)**
- Staging emails from: `onboarding@resend.dev`
- No domain verification needed
- Free and immediate

### 3.2 Dodo Payments Configuration

**Use Test Mode for Staging:**
1. In Dodo Dashboard, ensure you have test mode API keys
2. Use test mode in staging environment
3. Configure test webhook URL:
   ```
   https://staging.doserapp.com/api/webhooks/dodo-payments
   ```

### 3.3 Sentry (Optional)

**Option A: Separate Sentry Project**
- Create `doser-staging` project in Sentry
- Separate error tracking for staging
- Won't pollute production error logs

**Option B: Use Same Project with Tags**
- Add environment tag to differentiate
- Simpler, but mixed error logs

---

## Step 4: Git Branch Strategy

### Recommended Branch Strategy:

```
main (production)
  ├── staging (staging environment)
      ├── feature/new-feature
      ├── feat/another-feature
      └── fix/bug-fix
```

**Workflow:**
1. Create feature branches from `staging`
2. Test in preview deployments (automatic)
3. Merge to `staging` when ready
4. Test on staging environment
5. When validated, merge `staging` → `main`
6. `main` automatically deploys to production

**Commands:**
```bash
# Create staging branch from main
git checkout main
git pull
git checkout -b staging
git push -u origin staging

# Work on features
git checkout staging
git checkout -b feature/my-feature
# ... make changes ...
git push

# Merge to staging for testing
git checkout staging
git merge feature/my-feature
git push

# After testing, merge to production
git checkout main
git merge staging
git push  # Auto-deploys to production
```

---

## Step 5: Testing Workflow

### Staging Testing Checklist:

Before merging to production, test on staging:

- [ ] Sign up flow with real email
- [ ] Email verification works
- [ ] Password reset works
- [ ] Subscription checkout flow (test mode)
- [ ] All protected routes load
- [ ] Calculator functionality
- [ ] Session tracking
- [ ] Error monitoring (check Sentry)
- [ ] Analytics (check Statsig)
- [ ] Mobile responsiveness
- [ ] Performance (check Vercel Analytics)

### Email Testing on Staging:

Benefits of staging for email testing:
- ✅ Separate Supabase rate limits
- ✅ Won't affect production users
- ✅ Can test multiple signups rapidly
- ✅ Safe to experiment with email templates

---

## Step 6: Deployment Strategy

### Manual Promotion (Safest):

1. Deploy to staging automatically on push to `staging` branch
2. Test thoroughly on staging
3. Manually merge `staging` → `main` when ready
4. `main` auto-deploys to production

### Automated with Checks:

1. Push to `staging` → Auto-deploy to staging
2. Run E2E tests on staging
3. If tests pass, auto-create PR to `main`
4. Manual review and merge
5. Auto-deploy to production

---

## Quick Start: Minimum Viable Staging

If you want to get started quickly with the essentials:

### Quick Setup (30 minutes):

1. **Create `staging` branch:**
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

2. **Vercel will auto-deploy** to a preview URL

3. **Add staging environment variables** in Vercel:
   - Copy production variables
   - Change `NEXT_PUBLIC_APP_URL` to your staging URL
   - Keep everything else the same initially

4. **Test:** Visit the staging URL and try signup

### Upgrade Later:

- Add separate Supabase project when ready
- Add custom staging domain when needed
- Configure separate services as required

---

## Cost Breakdown

| Service | Production | Staging | Total |
|---------|------------|---------|-------|
| Vercel | Free/Pro | Free | Free |
| Supabase | Free | Free | Free |
| Resend | Free | Same | Free |
| Dodo Payments | Live | Test Mode | Free |
| Domain | $10-15/yr | None | $10-15/yr |
| **Total** | ~$15/yr | $0 | ~$15/yr |

**Note:** All services have free tiers sufficient for staging!

---

## Maintenance

### Keep Staging in Sync:

**Database:**
- Periodically copy production schema changes to staging
- Don't copy user data (privacy)
- Use fake test data in staging

**Code:**
- Merge `main` → `staging` regularly to keep in sync
- Or rebase `staging` on `main`

**Environment Variables:**
- Document in `.env.example`
- Update both environments when adding new vars

---

## Security Considerations

### Staging Security Best Practices:

1. **Different credentials** for all services
2. **Test mode** for payment processing
3. **Fake data only** - no real user data
4. **Password protect** staging site (optional):
   - Use Vercel password protection
   - Or add basic auth middleware

5. **Separate API keys** where possible
6. **Tag errors** in Sentry to differentiate environments

---

## Next Steps

Ready to implement? Here's the order:

1. [ ] **Quick Start:** Create `staging` branch + use preview URL
2. [ ] **Test:** Verify email flow works on staging
3. [ ] **Optional:** Create separate Supabase project
4. [ ] **Optional:** Add custom staging domain
5. [ ] **Document:** Update team on staging workflow

---

## Questions to Decide:

Before we start, let me know your preference:

1. **Staging approach:**
   - Option 1: Quick (branch + preview URL)
   - Option 2: Full (dedicated everything)
   - Option 3: Middle (branch + custom domain)

2. **Supabase:**
   - Separate staging project? (recommended)
   - Or share production project?

3. **Domain:**
   - Want custom `staging.doserapp.com`?
   - Or use Vercel preview URL?

Let me know your preferences and we'll start implementing!

# Vercel Staging Environment Variables Setup

## Problem
You have two Supabase projects:
- **Production**: (existing project with production data)
- **Staging**: `https://xmxaadpeoujtoctfzhoe.supabase.co` (newly created)

Vercel needs different Supabase credentials for each environment.

## Solution: Update Vercel Environment Variables

### Option 1: Via Vercel Dashboard (Recommended)

Go to: https://vercel.com/davidmitten88s-projects/doser-2/settings/environment-variables

#### Update These Variables for **Preview** Environment:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Click "Edit" next to this variable
   - Update Preview environment value to: `https://xmxaadpeoujtoctfzhoe.supabase.co`
   - Keep Production as is

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Click "Edit" next to this variable
   - Update Preview environment value to: `[YOUR_STAGING_ANON_KEY]`
   - Keep Production as is

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Click "Edit" next to this variable
   - Update Preview environment value to: `[YOUR_STAGING_SERVICE_KEY]`
   - Keep Production as is

### Option 2: Via Vercel CLI

```bash
# Remove existing variables (this removes from ALL environments)
vercel env rm NEXT_PUBLIC_SUPABASE_URL
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env rm SUPABASE_SERVICE_ROLE_KEY

# Add back for Production (with your production values)
echo "YOUR_PRODUCTION_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "YOUR_PRODUCTION_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "YOUR_PRODUCTION_SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Add for Preview/Staging (with staging values)
echo "https://xmxaadpeoujtoctfzhoe.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo "[YOUR_STAGING_ANON_KEY]" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
echo "[YOUR_STAGING_SERVICE_KEY]" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```

⚠️ **Warning**: Option 2 requires you to know your production Supabase credentials. If you don't have them handy, use Option 1 (Dashboard).

## Staging Branch Deployment

Once environment variables are updated:

```bash
# Make sure you're on staging branch
git checkout staging

# Deploy to Vercel
vercel --prod
```

This will deploy the staging branch to Vercel using the Preview environment variables (which now point to your staging Supabase).

## Verification

After deployment, visit your staging URL and:
1. Try signing up with a new account
2. Check that data appears in your staging Supabase dashboard (not production)
3. Test calculator and session tracking features

## Environment Summary

| Environment | Vercel Environment | Supabase Project | Branch |
|-------------|-------------------|------------------|--------|
| Production  | Production        | (your existing)  | main   |
| Staging     | Preview           | xmxaadpeoujtoctfzhoe | staging |
| Development | Development       | (local or staging) | any   |

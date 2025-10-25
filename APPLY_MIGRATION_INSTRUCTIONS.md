# How to Apply the Webhook Fix Migration

Since you're using hosted Supabase, here are the easiest ways to apply the migration:

## Option 1: Supabase Dashboard SQL Editor (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `dodo-payments-migration.sql` and paste into the editor
6. Click **Run** or press `Cmd + Enter`

The migration will:

- Add RLS policies to allow webhooks to work
- Add helper functions for webhook processing
- Create indexes for better performance

## Option 2: Supabase CLI with Project Link

```bash
# Link your project (first time only)
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

To find your project ref:

- Go to your Supabase Dashboard
- Click on Settings → General
- Look for "Reference ID"

## Option 3: Direct psql Connection

```bash
# Get your connection string from Supabase Dashboard
# Settings → Database → Connection String (URI)

psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres" \
  -f dodo-payments-migration.sql
```

## After Migration

1. **Add Service Role Key to .env.local**:

   Get your service role key from:

   - Supabase Dashboard → Settings → API → service_role key

   Add to `.env.local`:

   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. **Restart your development server**:

   ```bash
   npm run dev
   ```

3. **Test the webhooks**:
   - Process a test payment
   - Check server logs for detailed webhook information
   - Verify subscription is created in database

## Verification

To verify the migration was applied successfully, run this query in the SQL Editor:

```sql
-- Check if new policies exist
SELECT policyname
FROM pg_policies
WHERE tablename IN ('user_subscriptions', 'payment_history')
AND policyname LIKE '%Service%';
```

You should see:

- `Service can manage subscriptions`
- `Service can insert payment history`
- `Service can update payment history`

## Need Help?

If you encounter any issues:

1. Check WEBHOOK_FIXES.md for detailed troubleshooting
2. Ensure all environment variables are set correctly
3. Check the server logs for detailed error messages

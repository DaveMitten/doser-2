#!/bin/bash

# Apply Webhook Fixes - Database Migration Script
# This script applies the RLS policy updates needed for webhooks to work correctly

echo "🔧 Applying webhook fixes to database..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "   Please install it first: https://supabase.com/docs/guides/cli"
    echo ""
    echo "   Or apply the migration manually using the SQL file:"
    echo "   dodo-payments-migration.sql"
    exit 1
fi

# Check if SUPABASE_SERVICE_ROLE_KEY is set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY environment variable is not set."
    echo "   The application will fail at runtime if this is not configured."
    echo ""
    read -p "   Do you want to continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 Applying database migration..."
echo ""

# Apply the migration
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database migration applied successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Verify SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file"
    echo "   2. Restart your Next.js development server"
    echo "   3. Test a payment to verify webhooks are working"
    echo ""
    echo "📚 See WEBHOOK_FIXES.md for more details"
else
    echo ""
    echo "❌ Failed to apply migration."
    echo "   You can apply it manually using:"
    echo "   psql -h your-db-host -U postgres -d postgres -f dodo-payments-migration.sql"
    exit 1
fi


#!/bin/bash

# Prepare Migration Helper Script
# This script helps you prepare to apply the webhook fixes

echo "🔧 Webhook Migration Helper"
echo "=============================="
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found"
    echo "   Please create it first"
    exit 1
fi

# Check for required environment variables
echo "📋 Checking environment variables..."
echo ""

MISSING_VARS=0

if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL not found"
    MISSING_VARS=1
else
    echo "✅ NEXT_PUBLIC_SUPABASE_URL found"
fi

if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found"
    MISSING_VARS=1
else
    echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY found"
fi

if ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
    echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not found (REQUIRED for webhooks!)"
    echo ""
    echo "   Add this to your .env.local:"
    echo "   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
    echo ""
    echo "   Get your service role key from:"
    echo "   Supabase Dashboard → Settings → API → service_role key"
    echo ""
    MISSING_VARS=1
else
    echo "✅ SUPABASE_SERVICE_ROLE_KEY found"
fi

echo ""
echo "=============================="
echo ""

if [ $MISSING_VARS -eq 1 ]; then
    echo "⚠️  Some environment variables are missing or not configured."
    echo ""
fi

echo "📝 Next Steps:"
echo ""
echo "1️⃣  Apply the database migration:"
echo "    - Open Supabase Dashboard → SQL Editor"
echo "    - Copy contents of dodo-payments-migration.sql"
echo "    - Paste and run in SQL Editor"
echo ""
echo "2️⃣  If SUPABASE_SERVICE_ROLE_KEY is missing:"
echo "    - Get it from Supabase Dashboard → Settings → API"
echo "    - Add to .env.local"
echo ""
echo "3️⃣  Restart your dev server:"
echo "    npm run dev"
echo ""
echo "4️⃣  Test a payment and check logs"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - APPLY_MIGRATION_INSTRUCTIONS.md"
echo "   - WEBHOOK_FIXES.md"
echo ""

# Offer to open the migration file
if command -v pbcopy &> /dev/null; then
    echo "💡 Tip: Run this to copy the migration SQL to clipboard:"
    echo "    cat dodo-payments-migration.sql | pbcopy"
    echo ""
fi


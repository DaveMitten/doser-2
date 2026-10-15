#!/usr/bin/env node

/**
 * Setup Staging Database
 * Applies the complete database schema to the staging Supabase project
 */

const fs = require('fs');
const path = require('path');

// Supabase staging credentials (from .env.local)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xmxaadpeoujtoctfzhoe.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '[YOUR_SERVICE_KEY]';

// Read the SQL file
const sqlFilePath = path.join(__dirname, '..', 'COMPLETE_SUPABASE_SETUP.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🚀 Setting up staging database...');
console.log(`📍 Project: ${SUPABASE_URL}`);
console.log(`📄 SQL File: ${sqlFilePath}`);
console.log('');

// Use pg library to connect and execute
async function setupDatabase() {
  try {
    // Try to use @supabase/supabase-js if available
    const { createClient } = require('@supabase/supabase-js');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    console.log('⚠️  Note: Supabase JS client cannot execute raw DDL SQL.');
    console.log('Please run this SQL manually in the Supabase Dashboard:');
    console.log('');
    console.log(`🔗 https://supabase.com/dashboard/project/xmxaadpeoujtoctfzhoe/sql/new`);
    console.log('');
    console.log('Copy the contents of: COMPLETE_SUPABASE_SETUP.sql');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('📋 Manual Setup Required:');
    console.log('1. Go to: https://supabase.com/dashboard/project/xmxaadpeoujtoctfzhoe/sql/new');
    console.log('2. Open file: COMPLETE_SUPABASE_SETUP.sql');
    console.log('3. Copy all contents');
    console.log('4. Paste into Supabase SQL Editor');
    console.log('5. Click "Run" or press Cmd/Ctrl + Enter');
    console.log('');
  }
}

setupDatabase();

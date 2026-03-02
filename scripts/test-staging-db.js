#!/usr/bin/env node

/**
 * Test Staging Database Connection
 * Verifies that we can connect to and query the staging Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Staging Database Connection...');
console.log(`📍 URL: ${SUPABASE_URL}`);
console.log('');

async function testConnection() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });

  try {
    // Test 1: Check tables exist
    console.log('✅ Test 1: Checking tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);

    if (tablesError) {
      console.error('❌ Tables check failed:', tablesError.message);
      return false;
    }
    console.log('✅ Tables exist and are accessible');
    console.log('');

    // Test 2: Check user_subscriptions table
    console.log('✅ Test 2: Checking user_subscriptions table...');
    const { data: subs, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(0);

    if (subsError) {
      console.error('❌ user_subscriptions check failed:', subsError.message);
      return false;
    }
    console.log('✅ user_subscriptions table exists');
    console.log('');

    // Test 3: Check sessions table
    console.log('✅ Test 3: Checking sessions table...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(0);

    if (sessionsError) {
      console.error('❌ sessions check failed:', sessionsError.message);
      return false;
    }
    console.log('✅ sessions table exists');
    console.log('');

    // Test 4: Check payment_history table
    console.log('✅ Test 4: Checking payment_history table...');
    const { data: payments, error: paymentsError } = await supabase
      .from('payment_history')
      .select('*')
      .limit(0);

    if (paymentsError) {
      console.error('❌ payment_history check failed:', paymentsError.message);
      return false;
    }
    console.log('✅ payment_history table exists');
    console.log('');

    // Test 5: Check user_preferences table
    console.log('✅ Test 5: Checking user_preferences table...');
    const { data: prefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(0);

    if (prefsError) {
      console.error('❌ user_preferences check failed:', prefsError.message);
      return false;
    }
    console.log('✅ user_preferences table exists');
    console.log('');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Your staging database is ready to use!');
    console.log('');
    console.log('Next steps:');
    console.log('1. ✅ Database schema applied');
    console.log('2. ⏳ Configure Supabase auth settings (if not done)');
    console.log('3. ⏳ Update Vercel Preview environment variables');
    console.log('4. ⏳ Deploy staging branch to Vercel');
    console.log('5. ⏳ Test signup and authentication on staging');
    console.log('');

    return true;

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

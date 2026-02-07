// Temporary script to run SQL migration
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting plan ID migration...\n');

  try {
    // Check current state
    console.log('📊 Current subscription plan IDs:');
    const { data: before, error: beforeError } = await supabase
      .from('user_subscriptions')
      .select('plan_id, id')
      .order('plan_id');

    if (beforeError) throw beforeError;

    const planCounts = {};
    before.forEach(sub => {
      planCounts[sub.plan_id] = (planCounts[sub.plan_id] || 0) + 1;
    });

    console.log(planCounts);
    console.log('');

    // Update Learn plan (old → new)
    console.log('📝 Updating Learn plan IDs...');
    const { count: learnCount, error: learnError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: 'pdt_0NVzLG1q7MTDYaO5KluZr',
        updated_at: new Date().toISOString()
      })
      .eq('plan_id', 'pdt_euP6KahnWde9Ew1jvhIJj')
      .select('id', { count: 'exact', head: true });

    if (learnError) throw learnError;
    console.log(`   ✅ Updated ${learnCount || 0} Learn subscriptions`);

    // Update Track plan (old → new)
    console.log('📝 Updating Track plan IDs...');
    const { count: trackCount, error: trackError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: 'pdt_0NVzLQtP39PxN3StTeSUD',
        updated_at: new Date().toISOString()
      })
      .eq('plan_id', 'pdt_QT8CsZEYopzV38iWlE0Sb')
      .select('id', { count: 'exact', head: true });

    if (trackError) throw trackError;
    console.log(`   ✅ Updated ${trackCount || 0} Track subscriptions`);

    // Update Optimize plan (old → new)
    console.log('📝 Updating Optimize plan IDs...');
    const { count: optimizeCount, error: optimizeError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: 'pdt_0NVzLjKPEFGIYMmqDQ4mS',
        updated_at: new Date().toISOString()
      })
      .eq('plan_id', 'pdt_cseHYcjUQrkC7iti2ysVR')
      .select('id', { count: 'exact', head: true });

    if (optimizeError) throw optimizeError;
    console.log(`   ✅ Updated ${optimizeCount || 0} Optimize subscriptions`);

    // Check final state
    console.log('\n📊 Updated subscription plan IDs:');
    const { data: after, error: afterError } = await supabase
      .from('user_subscriptions')
      .select('plan_id, id')
      .order('plan_id');

    if (afterError) throw afterError;

    const finalPlanCounts = {};
    after.forEach(sub => {
      finalPlanCounts[sub.plan_id] = (finalPlanCounts[sub.plan_id] || 0) + 1;
    });

    console.log(finalPlanCounts);

    // Verify no old IDs remain
    const oldIds = after.filter(sub => [
      'pdt_euP6KahnWde9Ew1jvhIJj',
      'pdt_QT8CsZEYopzV38iWlE0Sb',
      'pdt_cseHYcjUQrkC7iti2ysVR'
    ].includes(sub.plan_id));

    if (oldIds.length > 0) {
      console.error(`\n❌ ERROR: ${oldIds.length} subscriptions still have old plan IDs!`);
      console.error(oldIds);
      process.exit(1);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('✅ All subscriptions now use production plan IDs');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();

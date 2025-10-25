#!/usr/bin/env node

/**
 * Diagnostic tool to check subscription status
 * Run this to see if webhooks are being received and subscriptions are being created
 */

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\n🔍 Subscription Diagnostic Tool\n");
console.log(
  "This tool will help you diagnose why your subscription isn't showing up.\n"
);

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function checkSupabaseSubscription() {
  const { createClient } = require("@supabase/supabase-js");
  require("dotenv").config({ path: ".env.local" });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("\n📊 Checking Supabase database...\n");

  // Get the most recent subscription
  const { data: subscriptions, error: subError } = await supabase
    .from("user_subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (subError) {
    console.error("❌ Error querying subscriptions:", subError.message);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("⚠️  No subscriptions found in database!");
    console.log(
      "\nThis means webhooks are NOT being received from Dodo Payments."
    );
    console.log("\n📋 Action Items:");
    console.log("1. Check your Dodo Payments dashboard webhook configuration");
    console.log(
      "2. Verify webhook URL is: https://your-ngrok-url.ngrok.app/api/webhooks/dodo-payments"
    );
    console.log(
      "3. Ensure these events are enabled: subscription.created, subscription.activated, payment.succeeded"
    );
    console.log("4. Test the webhook endpoint manually");
  } else {
    console.log(`✅ Found ${subscriptions.length} subscription(s):\n`);
    subscriptions.forEach((sub, index) => {
      console.log(`Subscription ${index + 1}:`);
      console.log(`  User ID: ${sub.user_id}`);
      console.log(`  Plan ID: ${sub.plan_id}`);
      console.log(`  Status: ${sub.status}`);
      console.log(
        `  Dodo Subscription ID: ${sub.dodo_subscription_id || "N/A"}`
      );
      console.log(`  Dodo Customer ID: ${sub.dodo_customer_id || "N/A"}`);
      if (sub.trial_end) {
        console.log(`  Trial Ends: ${sub.trial_end}`);
      }
      console.log(`  Created: ${sub.created_at}`);
      console.log(`  Updated: ${sub.updated_at}\n`);
    });
  }

  // Check payment history
  const { data: payments, error: payError } = await supabase
    .from("payment_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (payError) {
    console.error("❌ Error querying payments:", payError.message);
  } else if (!payments || payments.length === 0) {
    console.log("⚠️  No payment history found in database!");
  } else {
    console.log(`\n💳 Found ${payments.length} payment(s):\n`);
    payments.forEach((payment, index) => {
      console.log(`Payment ${index + 1}:`);
      console.log(`  Payment ID: ${payment.dodo_payment_id || "N/A"}`);
      console.log(`  Amount: ${payment.amount} ${payment.currency}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  Created: ${payment.created_at}\n`);
    });
  }
}

async function checkDodoWebhooks() {
  require("dotenv").config({ path: ".env.local" });

  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode";
  const baseUrl =
    environment === "test_mode"
      ? "https://test.dodopayments.com"
      : "https://live.dodopayments.com";

  if (!apiKey) {
    console.error("❌ Missing DODO_PAYMENTS_API_KEY in .env.local");
    return;
  }

  console.log("\n🔔 Checking Dodo Payments for subscriptions...\n");

  try {
    // Note: This would require knowing the subscription ID
    // For now, we'll just check if the API key works
    const response = await fetch(`${baseUrl}/v1/subscriptions?limit=5`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `❌ Dodo API returned ${response.status}: ${response.statusText}`
      );
      return;
    }

    const data = await response.json();
    const subscriptions = data.data || [];

    if (subscriptions.length === 0) {
      console.log("⚠️  No subscriptions found in Dodo Payments!");
    } else {
      console.log(
        `✅ Found ${subscriptions.length} subscription(s) in Dodo:\n`
      );
      subscriptions.forEach((sub, index) => {
        console.log(`Subscription ${index + 1}:`);
        console.log(`  ID: ${sub.id}`);
        console.log(`  Status: ${sub.status}`);
        console.log(`  Customer: ${sub.customer_id}`);
        if (sub.trial_end) {
          console.log(`  Trial End: ${sub.trial_end}`);
        }
        console.log(`  Created: ${sub.created_at}\n`);
      });
    }
  } catch (error) {
    console.error("❌ Error checking Dodo API:", error.message);
  }
}

async function main() {
  console.log("What would you like to check?");
  console.log("1. Supabase database (subscriptions & payments)");
  console.log("2. Dodo Payments API (subscriptions)");
  console.log("3. Both");
  console.log("4. Exit\n");

  const choice = await askQuestion("Enter your choice (1-4): ");

  switch (choice.trim()) {
    case "1":
      await checkSupabaseSubscription();
      break;
    case "2":
      await checkDodoWebhooks();
      break;
    case "3":
      await checkSupabaseSubscription();
      await checkDodoWebhooks();
      break;
    case "4":
      console.log("\nGoodbye! 👋\n");
      rl.close();
      return;
    default:
      console.log("\n❌ Invalid choice. Please run again.\n");
  }

  rl.close();
}

main().catch((error) => {
  console.error("Error:", error);
  rl.close();
  process.exit(1);
});

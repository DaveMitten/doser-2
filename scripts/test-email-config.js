#!/usr/bin/env node

/**
 * Email Configuration Diagnostic Script
 *
 * This script tests the Resend email configuration without sending actual emails.
 * Run: node scripts/test-email-config.js
 */

const { Resend } = require("resend");

async function testEmailConfig() {
  console.log("🔍 Testing Email Configuration...\n");

  // Check environment variables
  console.log("1. Checking Environment Variables:");
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("   ❌ RESEND_API_KEY is not set");
    console.log("   💡 Add it to your .env.local file:");
    console.log("      RESEND_API_KEY=re_xxxxxxxxxxxx\n");
    process.exit(1);
  }

  console.log(`   ✅ RESEND_API_KEY is set (length: ${apiKey.length})`);

  if (!apiKey.startsWith("re_")) {
    console.warn(
      '   ⚠️  Warning: API key doesn\'t start with "re_" - might be invalid\n'
    );
  } else {
    console.log("   ✅ API key format looks correct\n");
  }

  // Initialize Resend
  console.log("2. Initializing Resend Client:");
  let resend;
  try {
    resend = new Resend(apiKey);
    console.log("   ✅ Resend client initialized\n");
  } catch (error) {
    console.error("   ❌ Failed to initialize Resend:", error.message);
    process.exit(1);
  }

  // Test API connection by listing domains
  console.log("3. Testing Resend API Connection:");
  try {
    const domains = await resend.domains.list();
    console.log("   ✅ Successfully connected to Resend API");
    console.log(
      `   📋 Domains in account: ${domains.data?.data?.length || 0}\n`
    );

    if (domains.data?.data && domains.data.data.length > 0) {
      console.log("4. Domain Status:");
      domains.data.data.forEach((domain) => {
        const status = domain.status === "verified" ? "✅" : "⚠️";
        console.log(`   ${status} ${domain.name}: ${domain.status}`);

        if (domain.status !== "verified") {
          console.log(
            `      ⚠️  This domain is not verified. You won't be able to send emails from it.`
          );
          console.log(
            `      💡 Verify it in the Resend dashboard: https://resend.com/domains/${domain.id}`
          );
        }
      });
      console.log();
    } else {
      console.log("4. Domain Status:");
      console.log("   ⚠️  No domains found in your account");
      console.log(
        "   💡 Add and verify a domain in Resend dashboard: https://resend.com/domains\n"
      );
    }
  } catch (error) {
    console.error("   ❌ Failed to connect to Resend API:", error.message);

    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      console.log("   💡 Your API key might be invalid or expired");
      console.log("   💡 Get a new one from: https://resend.com/api-keys\n");
    } else if (
      error.message.includes("Network") ||
      error.message.includes("ENOTFOUND")
    ) {
      console.log(
        "   💡 Network connectivity issue - check your internet connection"
      );
    } else {
      console.log("   💡 Error details:", error);
    }
    process.exit(1);
  }

  // Check if doserapp.com is configured
  console.log("5. Checking doserapp.com Configuration:");
  try {
    const domains = await resend.domains.list();
    const doserDomain = domains.data?.data?.find(
      (d) => d.name === "doserapp.com"
    );

    if (!doserDomain) {
      console.log("   ⚠️  doserapp.com is not configured in Resend");
      console.log(
        "   💡 Add it in Resend dashboard or use a different domain in the code\n"
      );
    } else if (doserDomain.status !== "verified") {
      console.log("   ⚠️  doserapp.com is configured but NOT VERIFIED");
      console.log(`   📝 Status: ${doserDomain.status}`);
      console.log("   💡 Verify it in Resend dashboard to send emails\n");
      console.log("   📋 Required DNS Records:");
      console.log("      - SPF record");
      console.log("      - DKIM record");
      console.log("      Check Resend dashboard for exact values\n");
    } else {
      console.log("   ✅ doserapp.com is verified and ready to send emails!\n");
    }
  } catch (error) {
    console.error(
      "   ❌ Could not check domain configuration:",
      error.message,
      "\n"
    );
  }

  // Summary
  console.log("━".repeat(60));
  console.log("📊 Summary:");
  console.log("━".repeat(60));

  console.log("\nFor testing without domain verification, you can use:");
  console.log('  from: "onboarding@resend.dev"');
  console.log('  to: "delivered@resend.dev"');

  console.log("\nFor production, ensure:");
  console.log("  1. ✅ RESEND_API_KEY is set");
  console.log("  2. ✅ doserapp.com domain is added to Resend");
  console.log(
    "  3. ✅ doserapp.com domain is verified (DNS records configured)"
  );
  console.log('  4. ✅ from: "support@doserapp.com" matches verified domain');
  console.log('  5. ✅ to: "support@doserapp.com" is a valid email address\n');

  console.log("📚 For more help, see: CHANGE_PLAN_EMAIL_DEBUG_GUIDE.md\n");
}

// Run the test
testEmailConfig().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});

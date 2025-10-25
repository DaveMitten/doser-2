// Run this to verify environment variables are loaded correctly
const fs = require("fs");
const path = require("path");

// Manually load .env.local
function loadEnv() {
  try {
    const envPath = path.join(__dirname, ".env.local");
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");

    lines.forEach((line) => {
      line = line.trim();
      if (line && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        const value = valueParts.join("=").trim();
        process.env[key.trim()] = value;
      }
    });
    return true;
  } catch (error) {
    console.error("❌ Could not load .env.local:", error.message);
    return false;
  }
}

console.log("=".repeat(60));
console.log("ENVIRONMENT VARIABLES CHECK");
console.log("=".repeat(60));
console.log("");

// Load environment variables from .env.local
const envLoaded = loadEnv();
if (!envLoaded) {
  console.log("⚠️  Warning: Could not load .env.local file");
  console.log("Make sure .env.local exists in the project root");
  console.log("=".repeat(60));
  process.exit(1);
}

console.log("✅ Loaded .env.local file");
console.log("");

const requiredVars = [
  "DODO_PAYMENTS_API_KEY",
  "DODO_PAYMENTS_ENVIRONMENT",
  "DODO_PAYMENTS_WEBHOOK_KEY",
  "NEXT_PUBLIC_APP_URL", // Used as fallback for return URL
];

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const exists = !!value;
  const length = value?.length || 0;
  const preview = value?.substring(0, 20) || "(not set)";

  console.log(`${varName}:`);
  console.log(`  Exists: ${exists ? "✅" : "❌"}`);
  console.log(`  Length: ${length}`);
  console.log(`  Preview: ${preview}...`);
  console.log("");
});

console.log("=".repeat(60));

if (process.env.DODO_PAYMENTS_API_KEY) {
  console.log("✅ All environment variables are loaded!");
} else {
  console.log("❌ DODO_PAYMENTS_API_KEY is missing!");
  console.log("");
  console.log("Make sure:");
  console.log("1. .env.local exists in the project root");
  console.log("2. You restarted your dev server");
  console.log("3. No typos in the variable names");
}

console.log("=".repeat(60));

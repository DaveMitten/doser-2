// Test script to verify Dodo Payments checkout
const fs = require("fs");

// Read .env.local file
const envContent = fs.readFileSync(".env.local", "utf8");
const envLines = envContent.split("\n");

// Parse environment variables
const envVars = {};
envLines.forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

console.log("Environment variables:");
console.log(
  "DODO_PAYMENTS_API_KEY:",
  envVars.DODO_PAYMENTS_API_KEY ? "Set" : "Not set"
);
console.log("DODO_PAYMENTS_ENVIRONMENT:", envVars.DODO_PAYMENTS_ENVIRONMENT);
console.log("DODO_PAYMENTS_RETURN_URL:", envVars.DODO_PAYMENTS_RETURN_URL);

// Test Dodo API connection with different endpoints
async function testDodoAPI() {
  const baseUrl =
    envVars.DODO_PAYMENTS_ENVIRONMENT === "test_mode"
      ? "https://test.dodopayments.com"
      : "https://live.dodopayments.com";

  console.log(`\nTesting API endpoint: ${baseUrl}`);

  // Test 1: Basic API health check
  try {
    const response = await fetch(`${baseUrl}/v1/health`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${envVars.DODO_PAYMENTS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Health check status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Health check response:", JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log("Health check error:", errorText);
    }
  } catch (error) {
    console.error("Health check failed:", error.message);
  }

  // Test 2: Try to create a simple product
  try {
    const response = await fetch(`${baseUrl}/v1/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${envVars.DODO_PAYMENTS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Product",
        price: 9.99,
        currency: "GBP",
        type: "one_time",
      }),
    });

    console.log("\nCreate product status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Create product response:", JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log("Create product error:", errorText);
    }
  } catch (error) {
    console.error("Create product failed:", error.message);
  }
}

testDodoAPI();

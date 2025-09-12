// Test script to verify Dodo Payments configuration
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
console.log(
  "DODO_PAYMENTS_WEBHOOK_KEY:",
  envVars.DODO_PAYMENTS_WEBHOOK_KEY ? "Set" : "Not set"
);

// Test Dodo API connection
async function testDodoAPI() {
  try {
    const response = await fetch("https://test.dodopayments.com/v1/customers", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${envVars.DODO_PAYMENTS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Dodo API Response Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Dodo API Response:", JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error("Dodo API Error:", errorText);
    }
  } catch (error) {
    console.error("Error testing Dodo API:", error);
  }
}

testDodoAPI();

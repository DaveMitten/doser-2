#!/usr/bin/env node
const { spawn, exec } = require("child_process");

console.log("🚀 Starting Doser development server with ngrok...\n");

// Check if ngrok is installed
exec("which ngrok", (error) => {
  if (error) {
    console.log("❌ ngrok not found. Please install ngrok first:");
    console.log("   - Visit https://ngrok.com/download");
    console.log(
      "   - Or install via package manager: brew install ngrok/ngrok/ngrok"
    );
    console.log("   - Or install via npm: npm install -g ngrok");
    process.exit(1);
  } else {
    console.log("✅ ngrok found");
    startServers();
  }
});

function startServers() {
  // Start Next.js dev server
  console.log("🔧 Starting Next.js development server...");
  const nextServer = spawn("npm", ["run", "dev"], {
    stdio: "pipe",
    shell: true,
    env: {
      ...process.env,
      DEV_WEBHOOK_URL: "https://doser-dev-1757693413.loca.lt", // Default tunnel URL
    },
  });

  nextServer.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(`[Next.js] ${output}`);

    // Check if Next.js is ready
    if (output.includes("Ready in") || output.includes("Local:")) {
      console.log("\n🌐 Starting ngrok tunnel...");
      startTunnel();
    }
  });

  nextServer.stderr.on("data", (data) => {
    console.error(`[Next.js Error] ${data}`);
  });

  nextServer.on("close", (code) => {
    console.log(`Next.js server exited with code ${code}`);
  });

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down servers...");
    nextServer.kill();
    if (tunnelProcess) {
      tunnelProcess.kill();
    }
    process.exit(0);
  });
}

let tunnelProcess;

function startTunnel() {
  console.log(`🌐 Creating ngrok tunnel...`);

  // Start ngrok
  tunnelProcess = spawn("ngrok", ["http", "3000", "--log=stdout"], {
    stdio: "pipe",
    shell: true,
  });

  tunnelProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(`[Tunnel] ${output}`);

    // Extract the public URL from ngrok output
    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok-free\.app/);
    if (urlMatch) {
      const publicUrl = urlMatch[0];
      console.log("\n🎉 Development server is ready!");
      console.log(`📱 Local: http://localhost:3000`);
      console.log(`🌍 Public: ${publicUrl}`);
      console.log(`🔗 Webhook URL: ${publicUrl}/api/webhooks/gocardless`);
      console.log("\n📋 Copy this webhook URL to your GoCardless dashboard:");
      console.log(`   ${publicUrl}/api/webhooks/gocardless`);
      console.log("\n📋 Update your Supabase site URL to:");
      console.log(`   ${publicUrl}`);
      console.log("\n⚠️  Note: You may need to restart the Next.js server");
      console.log("   for the webhook URL to take effect in new requests.");
      console.log("\n⏹️  Press Ctrl+C to stop both servers\n");
    }
  });

  tunnelProcess.stderr.on("data", (data) => {
    const output = data.toString();
    console.error(`[Tunnel Error] ${output}`);
  });

  tunnelProcess.on("close", (code) => {
    console.log(`Tunnel process exited with code ${code}`);
  });
}

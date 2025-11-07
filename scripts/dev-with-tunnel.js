#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Development server with ngrok tunnel
 *
 * This script does the following:
 * 1. Switches to Node version 20.18.3 using nvm
 * 2. Starts the Next.js development server
 * 3. Launches ngrok tunnel to expose local server
 * 4. Automatically extracts the ngrok URL
 * 5. Updates .env.local with the following variables:
 *    - NEXT_PUBLIC_SITE_URL
 *    - NEXT_PUBLIC_APP_URL
 *    - DEV_WEBHOOK_URL
 *
 * Usage: npm run dev:tunnel
 */
const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Doser development server with ngrok...\n");

// Kill ALL existing ngrok processes first (more aggressive)
console.log("🧹 Cleaning up any existing ngrok processes...");
exec("pkill -9 ngrok", (killError) => {
  // Ignore errors - process might not exist
  if (!killError) {
    console.log("✅ Stopped existing ngrok processes");
  }

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
      // Wait a moment for processes to fully terminate
      setTimeout(startServers, 1000);
    }
  });
});

function startServers() {
  // Reset tunnel flag when starting servers
  tunnelStarted = false;

  // Start Next.js dev server with nvm
  console.log(
    "🔧 Switching to Node 20.18.3 and starting Next.js development server..."
  );

  // Use nvm to switch Node version and run dev
  const nvmCommand =
    "source $HOME/.nvm/nvm.sh && nvm use 20.18.3 && npm run dev";
  const nextServer = spawn(nvmCommand, {
    stdio: "pipe",
    shell: "/bin/zsh",
    env: {
      ...process.env,
    },
  });

  nextServer.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(`[Next.js] ${output}`);

    // Check if Next.js is ready and tunnel hasn't been started yet
    if (
      !tunnelStarted &&
      (output.includes("Ready in") || output.includes("Local:"))
    ) {
      console.log("\n🌐 Starting ngrok tunnel...");
      tunnelStarted = true;
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
let tunnelStarted = false;

function updateEnvLocal(ngrokUrl) {
  const envPath = path.join(__dirname, "..", ".env.local");

  try {
    let envContent = "";

    // Read existing .env.local if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    // Update or add the three variables
    const variablesToUpdate = {
      NEXT_PUBLIC_SITE_URL: ngrokUrl,
      NEXT_PUBLIC_APP_URL: ngrokUrl,
      DEV_WEBHOOK_URL: ngrokUrl,
    };

    for (const [key, value] of Object.entries(variablesToUpdate)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(envContent)) {
        // Update existing variable
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        // Add new variable
        envContent += `\n${key}=${value}`;
      }
    }

    // Write back to .env.local
    fs.writeFileSync(envPath, envContent.trim() + "\n", "utf8");
    console.log("\n✅ Updated .env.local with ngrok URL:");
    console.log(`   NEXT_PUBLIC_SITE_URL=${ngrokUrl}`);
    console.log(`   NEXT_PUBLIC_APP_URL=${ngrokUrl}`);
    console.log(`   DEV_WEBHOOK_URL=${ngrokUrl}`);
  } catch (error) {
    console.error("\n❌ Error updating .env.local:", error.message);
    console.log("   Please update these variables manually:");
    console.log(`   NEXT_PUBLIC_SITE_URL=${ngrokUrl}`);
    console.log(`   NEXT_PUBLIC_APP_URL=${ngrokUrl}`);
    console.log(`   DEV_WEBHOOK_URL=${ngrokUrl}`);
  }
}

function startTunnel() {
  // Double-check that tunnel hasn't been started (extra safety)
  if (tunnelStarted && tunnelProcess) {
    console.log("⚠️  Tunnel already started, skipping...");
    return;
  }

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
    // Match both ngrok-free.app and ngrok.app patterns
    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok(?:-free)?\.app/);
    if (urlMatch) {
      const publicUrl = urlMatch[0];

      // Update .env.local with the ngrok URL
      updateEnvLocal(publicUrl);

      console.log("\n🎉 Development server is ready!");
      console.log(`📱 Local: http://localhost:3000`);
      console.log(`🌍 Public: ${publicUrl}`);
      console.log(`🔗 Webhook URL: ${publicUrl}/api/webhooks/dodo-payments`);
      console.log(
        "\n📋 Copy this webhook URL to your Dodo Payments dashboard:"
      );
      console.log(`   ${publicUrl}/api/webhooks/dodo-payments`);
      console.log("\n⚠️  Note: You may need to restart the Next.js server");
      console.log("   for the new environment variables to take effect.");
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

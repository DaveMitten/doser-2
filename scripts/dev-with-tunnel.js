#!/usr/bin/env node
import { spawn, exec } from "child_process";

console.log("🚀 Starting Doser development server with localtunnel...\n");

// Check if localtunnel is installed
exec("which lt", (error) => {
  if (error) {
    console.log("❌ localtunnel not found. Installing...");
    exec("npm install -g localtunnel", (installError) => {
      if (installError) {
        console.error(
          "❌ Failed to install localtunnel:",
          installError.message
        );
        process.exit(1);
      }
      console.log("✅ localtunnel installed successfully!");
      startServers();
    });
  } else {
    console.log("✅ localtunnel found");
    startServers();
  }
});

function startServers() {
  // Start Next.js dev server
  console.log("🔧 Starting Next.js development server...");
  const nextServer = spawn("npm", ["run", "dev"], {
    stdio: "pipe",
    shell: true,
  });

  nextServer.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(`[Next.js] ${output}`);

    // Check if Next.js is ready
    if (output.includes("Ready in") || output.includes("Local:")) {
      console.log("\n🌐 Starting localtunnel...");
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
  // Start localtunnel
  tunnelProcess = spawn("lt", ["--port", "3000", "--subdomain", "doser-dev"], {
    stdio: "pipe",
    shell: true,
  });

  tunnelProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(`[Tunnel] ${output}`);

    // Extract the public URL
    const urlMatch = output.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      const publicUrl = urlMatch[0];
      console.log("\n🎉 Development server is ready!");
      console.log(`📱 Local: http://localhost:3000`);
      console.log(`🌍 Public: ${publicUrl}`);
      console.log(`🔗 Webhook URL: ${publicUrl}/api/webhooks/mollie`);
      console.log("\n📋 Copy this webhook URL to your Mollie dashboard:");
      console.log(`   ${publicUrl}/api/webhooks/mollie`);
      console.log("\n⏹️  Press Ctrl+C to stop both servers\n");
    }
  });

  tunnelProcess.stderr.on("data", (data) => {
    const output = data.toString();
    if (output.includes("subdomain already in use")) {
      console.log(
        '⚠️  Subdomain "doser-dev" is already in use. Trying with random subdomain...'
      );
      // Kill current process and restart with random subdomain
      tunnelProcess.kill();
      setTimeout(() => {
        startRandomTunnel();
      }, 1000);
    } else {
      console.error(`[Tunnel Error] ${output}`);
    }
  });

  tunnelProcess.on("close", (code) => {
    console.log(`Tunnel process exited with code ${code}`);
  });
}

function startRandomTunnel() {
  tunnelProcess = spawn("lt", ["--port", "3000"], {
    stdio: "pipe",
    shell: true,
  });

  tunnelProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(`[Tunnel] ${output}`);

    const urlMatch = output.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      const publicUrl = urlMatch[0];
      console.log("\n🎉 Development server is ready!");
      console.log(`📱 Local: http://localhost:3000`);
      console.log(`🌍 Public: ${publicUrl}`);
      console.log(`🔗 Webhook URL: ${publicUrl}/api/webhooks/mollie`);
      console.log("\n📋 Copy this webhook URL to your Mollie dashboard:");
      console.log(`   ${publicUrl}/api/webhooks/mollie`);
      console.log("\n⏹️  Press Ctrl+C to stop both servers\n");
    }
  });

  tunnelProcess.stderr.on("data", (data) => {
    console.error(`[Tunnel Error] ${data}`);
  });
}

import * as Sentry from "@sentry/nextjs";

// Log to verify this file is being loaded
console.log("[Sentry Client] Loading configuration file");

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production
  tracesSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Capture errors in the browser
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Debug mode for troubleshooting
  debug: process.env.NODE_ENV === "development",

  // Before send hook for logging
  beforeSend(event) {
    console.log("[Sentry] Sending event:", event.event_id);
    return event;
  },
});

console.log("[Sentry] Client initialized", {
  environment: process.env.NODE_ENV,
  dsn: Sentry.getClient()?.getDsn()?.toString(),
});

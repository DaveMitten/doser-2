import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Enable tracing for API routes
  tracesSampleRate: 1.0, // 100% in dev, lower in production (e.g., 0.1)

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Enable logging
  _experiments: {
    enableLogs: true,
  },

  // Automatically send console logs to Sentry
  integrations: [
    Sentry.consoleLoggingIntegration({
      levels: ["warn", "error"], // Send console.warn and console.error to Sentry
    }),
  ],
});

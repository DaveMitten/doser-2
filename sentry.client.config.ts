import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production
  tracesSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Disable Session Replay for now - causing compatibility issues
  integrations: [],

  // Debug mode for development troubleshooting only
  debug: false,
});

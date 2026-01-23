"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export function SentryInit() {
  useEffect(() => {
    // This runs on the client and verifies Sentry is loaded
    console.log("[SentryInit] Component mounted");
    console.log("[SentryInit] Sentry client:", !!Sentry.getClient());
    console.log("[SentryInit] Sentry DSN:", Sentry.getClient()?.getDsn()?.toString());

    // Send a test message to Sentry (only in development)
    if (process.env.NODE_ENV === "development") {
      Sentry.captureMessage("[SentryInit] Test message - Sentry is working!", {
        level: "info",
        tags: {
          component: "SentryInit",
          test: true,
        },
      });
    }
  }, []);

  return null;
}

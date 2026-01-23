import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    const isDev = process.env.NODE_ENV === "development";
    const devWebSocketSources = isDev
      ? " ws://127.0.0.1:* ws://localhost:*"
      : "";

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `connect-src 'self' https://prodregistryv2.org https://*.statsig.com https://*.supabase.co https://*.vercel.app https://*.sentry.io${devWebSocketSources}`,
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "doser",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,

  // Disable removal of console logs and Sentry debug logging
  disableLogger: false,

  // Hide source maps from generated client bundles
  sourcemaps: {
    disable: true,
  },
  // Disable build-time telemetry
  telemetry: false,
});

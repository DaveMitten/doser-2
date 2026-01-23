import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./database.types";
import * as Sentry from "@sentry/nextjs";

console.log("[supabase-browser] FILE LOADED");
console.log("[supabase-browser] ENV CHECK:", {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export function createSupabaseBrowserClient() {
  console.log("[supabase-browser] createSupabaseBrowserClient() CALLED");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const error = new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!url,
      hasKey: !!key,
    });

    // Send to Sentry
    Sentry.captureException(error, {
      tags: {
        component: "supabase-browser",
        action: "createClient",
      },
      contexts: {
        environment: {
          hasUrl: !!url,
          hasKey: !!key,
        },
      },
    });

    throw error;
  }

  return createBrowserClient<Database>(url, key);
}

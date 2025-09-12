import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    gocardlessAccessToken: process.env.GOCARDLESS_ACCESS_TOKEN
      ? "***" + process.env.GOCARDLESS_ACCESS_TOKEN.slice(-4)
      : "undefined",
    gocardlessEnvironment: process.env.GOCARDLESS_ENVIRONMENT,
    gocardlessWebhookSecret: process.env.GOCARDLESS_WEBHOOK_SECRET
      ? "***" + process.env.GOCARDLESS_WEBHOOK_SECRET.slice(-4)
      : "undefined",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "***" + process.env.NEXT_PUBLIC_SUPABASE_URL.slice(-4)
      : "undefined",
  });
}

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getBaseUrl } from "@/lib/utils";

export async function GET(request: NextRequest) {
  // Rate limit by IP address
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateLimit = await checkRateLimit(`auth_callback:${ip}`);

  if (!rateLimit.success) {
    const errorUrl = new URL("/auth/error", getBaseUrl());
    errorUrl.searchParams.set("error", "rate_limited");
    return NextResponse.redirect(errorUrl);
  }

  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Handle PKCE flow (code parameter)
  if (code) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const redirectUrl = new URL(next, getBaseUrl());
      return NextResponse.redirect(redirectUrl);
    }

    console.error("PKCE exchange failed:", error);
    const errorUrl = new URL("/auth/error", getBaseUrl());
    errorUrl.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(errorUrl);
  }

  // Handle OTP flow (token_hash parameter)
  if (token_hash && type) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });

    if (!error && data.session) {
      // Session is automatically created and stored in cookies by verifyOtp
      // Redirect directly to the intended destination
      const redirectUrl = new URL(next, getBaseUrl());

      // Clean up any auth-related query parameters
      redirectUrl.searchParams.delete("token_hash");
      redirectUrl.searchParams.delete("type");
      redirectUrl.searchParams.delete("next");

      return NextResponse.redirect(redirectUrl);
    }

    console.error("OTP verification failed:", error);

    // Handle verification error
    const errorUrl = new URL("/auth/error", getBaseUrl());
    if (error?.message?.includes("expired")) {
      errorUrl.searchParams.set("error", "verification_failed");
    } else if (error?.message?.includes("invalid")) {
      errorUrl.searchParams.set("error", "invalid_token");
    } else if (
      error?.message?.includes("rate limit") ||
      error?.message?.includes("too many")
    ) {
      errorUrl.searchParams.set("error", "rate_limited");
    } else {
      errorUrl.searchParams.set("error", "verification_failed");
    }
    return NextResponse.redirect(errorUrl);
  }

  // Handle missing token or type
  const errorUrl = new URL("/auth/error", getBaseUrl());
  errorUrl.searchParams.set("error", "invalid_token");
  return NextResponse.redirect(errorUrl);
}

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getBaseUrl, extractVerificationParams } from "@/lib/utils";

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

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

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

  // Handle OTP flow (token_hash parameter) - use universal extraction for email client compatibility
  const { token_hash, type, source } = extractVerificationParams(url);

  if (token_hash && type) {
    console.log(`[Auth Callback] Using ${source} extraction method for verification`);
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
    console.error("Extraction method used:", source);
    console.error("Token hash length:", token_hash?.length);
    console.error("Type:", type);

    // Handle verification error with more specific error types
    const errorUrl = new URL("/auth/error", getBaseUrl());

    if (
      error?.message?.includes("expired") ||
      error?.message?.includes("Token has expired")
    ) {
      errorUrl.searchParams.set("error", "expired_link");
      errorUrl.searchParams.set("can_resend", "true");
    } else if (
      error?.message?.includes("already") ||
      error?.message?.includes("Email link is invalid")
    ) {
      // User might already be verified
      errorUrl.searchParams.set("error", "already_verified");
      errorUrl.searchParams.set("can_resend", "false");
    } else if (error?.message?.includes("invalid")) {
      errorUrl.searchParams.set("error", "invalid_token");
      errorUrl.searchParams.set("can_resend", "false");
    } else if (
      error?.message?.includes("rate limit") ||
      error?.message?.includes("too many")
    ) {
      errorUrl.searchParams.set("error", "rate_limited");
      errorUrl.searchParams.set("can_resend", "false");
    } else {
      errorUrl.searchParams.set("error", "verification_failed");
      errorUrl.searchParams.set("can_resend", "true");
    }

    return NextResponse.redirect(errorUrl);
  }

  // Handle missing token or type
  console.error("[Auth Callback] No valid verification parameters found");
  console.error("Extraction source:", source);
  console.error("Token hash:", token_hash);
  console.error("Type:", type);
  console.error("Full URL:", request.url);

  const errorUrl = new URL("/auth/error", getBaseUrl());
  errorUrl.searchParams.set("error", "invalid_token");
  return NextResponse.redirect(errorUrl);
}

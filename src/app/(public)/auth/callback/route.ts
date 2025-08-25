import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limit by IP address
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateLimit = await checkRateLimit(`auth_callback:${ip}`);

  if (!rateLimit.success) {
    const errorUrl = new URL("/auth/error", request.nextUrl.origin);
    errorUrl.searchParams.set("error", "rate_limited");
    return NextResponse.redirect(errorUrl);
  }

  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });

    if (!error) {
      // Redirect to success page first
      const successUrl = new URL("/auth/verified", request.nextUrl.origin);
      successUrl.searchParams.set("next", next);

      // Set a secure, httpOnly cookie to indicate successful verification
      const response = NextResponse.redirect(successUrl);
      response.cookies.set("email_verified", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 5, // 5 minutes
        path: "/",
      });

      return response;
    }

    // Handle verification error
    const errorUrl = new URL("/auth/error", request.nextUrl.origin);
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
  const errorUrl = new URL("/auth/error", request.nextUrl.origin);
  errorUrl.searchParams.set("error", "invalid_token");
  return NextResponse.redirect(errorUrl);
}

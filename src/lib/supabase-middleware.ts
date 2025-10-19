import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedPaths = ["/authorised"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Public auth paths
  const authPaths = ["/auth", "/login", "/signup"];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect unauthenticated users trying to access protected routes
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/authorised/dashboard";
    return NextResponse.redirect(url);
  }

  // Check trial status for authenticated users on protected routes
  if (user && isProtectedPath) {
    try {
      // Get user subscription to check trial status
      const { data: subscription, error } = await supabase
        .from("user_subscriptions")
        .select("status, trial_end")
        .eq("user_id", user.id)
        .single();

      // If no subscription exists, redirect to pricing
      if (error || !subscription) {
        const url = request.nextUrl.clone();
        url.pathname = "/pricing";
        url.searchParams.set("trial_expired", "true");
        return NextResponse.redirect(url);
      }

      // Check if trial has expired
      const isTrialExpired =
        subscription.status === "trialing" &&
        subscription.trial_end &&
        new Date(subscription.trial_end) <= new Date();

      // If trial is expired, redirect to pricing
      if (isTrialExpired) {
        const url = request.nextUrl.clone();
        url.pathname = "/pricing";
        url.searchParams.set("trial_expired", "true");
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error checking trial status in middleware:", error);
      // Don't block access on error, just log it
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

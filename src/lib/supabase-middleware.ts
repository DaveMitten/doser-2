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
      // Get user profile to check trial status
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("trial_start_date, trial_expired, subscription_status")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        const isTrialExpired =
          profile.trial_expired ||
          (profile.trial_start_date &&
            new Date() >
              new Date(
                new Date(profile.trial_start_date).getTime() +
                  7 * 24 * 60 * 60 * 1000
              ));

        // If trial is expired and user is trying to access protected routes, redirect to pricing
        if (isTrialExpired && profile.subscription_status === "expired") {
          const url = request.nextUrl.clone();
          url.pathname = "/pricing";
          url.searchParams.set("trial_expired", "true");
          return NextResponse.redirect(url);
        }
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

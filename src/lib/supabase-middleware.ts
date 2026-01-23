import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "./database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Check for private access query parameter
  const url = new URL(request.url);
  const accessParam = url.searchParams.get('access');
  const privateAccessKey = process.env.PRIVATE_ACCESS_KEY;

  // If access param matches, set cookie and redirect to clean URL
  if (accessParam && privateAccessKey && accessParam === privateAccessKey) {
    // Remove access param from URL
    url.searchParams.delete('access');

    supabaseResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.set('private_access', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: any }>
        ) {
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

  // Refresh session if exists - this updates the cookies automatically
  await supabase.auth.getUser();

  return supabaseResponse;
}

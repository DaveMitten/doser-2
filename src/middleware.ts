import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase-middleware'
import * as Sentry from '@sentry/nextjs'

const { logger } = Sentry

const publicRoutes = [
  '/',
  '/auth',
  '/signup',
  '/pricing',
]

const setAccessCookie = (request: NextRequest) => {
  logger.info('Valid key - setting cookie');
  const url = new URL(request.url);
  url.searchParams.delete('access');

  const response = NextResponse.redirect(url);
  response.cookies.set('private_access', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });
  return response;
}

const searchParamAccess = async (request: NextRequest) => {
  const accessParam = request.nextUrl.searchParams.get('access');
  const privateAccessKey = process.env.PRIVATE_ACCESS_KEY;
  const hasPrivateCookie = request.cookies.get('private_access')?.value === 'true';

  logger.debug('Access check', { hasParam: !!accessParam, hasCookie: hasPrivateCookie });

  // If valid access param, set cookie and redirect to clean URL
  if (accessParam && privateAccessKey && accessParam === privateAccessKey) {
    return setAccessCookie(request);
  }

  // Check if user has access (cookie or env flag)
  const hasAccess = hasPrivateCookie || process.env.PRIVATE_PAGE_FLAG === 'true';

  // Block access to public routes if no access
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  if (isPublicRoute && !hasAccess) {
    logger.warn('No access - showing 404', { pathname: request.nextUrl.pathname });
    return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
  }

  return await updateSession(request);

}

export async function middleware(request: NextRequest) {
  logger.debug('Middleware processing', { pathname: request.nextUrl.pathname });
  return await searchParamAccess(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
import { NextResponse } from 'next/server';
import { auth } from './shared/lib/auth/auth';
import { AUTH_ERRORS, ROUTES } from './shared/constants/constants';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const error = req.nextUrl.searchParams.get('error');

  // Handle OAuth conflict redirect
  if (pathname === ROUTES.SIGNIN) {
    if (error === AUTH_ERRORS.OAUTH_ACCOUNT_NOT_LINKED) {
      const url = req.nextUrl.clone();
      url.pathname = ROUTES.HOME;
      url.searchParams.set('error', AUTH_ERRORS.OAUTH_ACCOUNT_NOT_LINKED);
      return NextResponse.redirect(url);
    }
  }

  // Handle un-permitted requests to profile
  if (pathname.startsWith(ROUTES.PROFILE)) {
    if (!req.auth?.user) {
      const url = req.nextUrl.clone();
      url.pathname = ROUTES.HOME;
      url.searchParams.set('error', AUTH_ERRORS.AUTH_REQUIRED);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/api/auth/signin', '/profile/:path*'],
};

// middleware.ts
import { NextResponse } from 'next/server';
import { auth } from './shared/lib/auth';

export default auth((req) => {
  const error = req.nextUrl.searchParams.get('error');

  if (error === 'OAuthAccountNotLinked') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('error', 'OAuthAccountNotLinked');
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ['/api/auth/signin'],
};

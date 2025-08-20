import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed admin credentials
const ADMIN_ID = "353c767a-66b3-4a26-9008-5ef03d8d1595";
const ADMIN_EMAIL = "trykrishansharmaa@gmail.com";

function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  const email = request.cookies.get('admin-email')?.value;

  // Grant access only if ID OR Email matches
  return token === ADMIN_ID || email === ADMIN_EMAIL;
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAuthenticated(request)) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

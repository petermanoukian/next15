import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_BASE_URL } from '@/lib/config';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 🚧 Block bots or unwanted agents (optional)
  const userAgent = request.headers.get('user-agent') || '';
  if (userAgent.includes('Googlebot')) {
    return NextResponse.redirect(`${APP_BASE_URL}/unauthorized`);
  }

  // ✅ Only match /superadmin route
  if (path.startsWith('/superadmin')) {
    console.log('⚠️ Middleware matched superadmin route:', path);
  }

  return NextResponse.next();
}

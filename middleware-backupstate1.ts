import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// BACKUP STATE 1 - Original middleware.ts before role-based auth implementation
export async function middleware(request: NextRequest) {
    // Add auth header to all API requests
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('X-Requested-With', 'XMLHttpRequest');

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const authCookie = request.cookies.get('laravel_session');

        if (!authCookie) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
        '/dashboard/:path*',
        '/profile/:path*',
    ],
}; 
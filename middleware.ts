//global middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { superadminMiddleware } from './middleware/superadmin';
import { adminMiddleware } from './middleware/admin';
import { orduserMiddleware } from './middleware/orduser';

// Stage 2 Beta - Role-based middleware implementation
export async function middleware(request: NextRequest) {
    console.log(" Iam the central middleare"    , request.nextUrl.pathname);
    // Add auth header to all API requests (preserve existing functionality)
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('X-Requested-With', 'XMLHttpRequest');

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    try {
        // Role-based route protection
        if (request.nextUrl.pathname.startsWith('/superadmin/')) {
            console.log('superadmin middleware');
            console.log(request.nextUrl.pathname);
            return await superadminMiddleware(request);
        }

        if (request.nextUrl.pathname.startsWith('/admin/')) {
            return await adminMiddleware(request);
        }

        if (request.nextUrl.pathname.startsWith('/orduser/')) {
            return await orduserMiddleware(request);
        }

        // Keep existing dashboard protection
        if (request.nextUrl.pathname.startsWith('/dashboard/')) {
            const authCookie = request.cookies.get('laravel_session');

            if (!authCookie) {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
                return NextResponse.redirect(loginUrl);
            }
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Middleware error:', error);
        return NextResponse.redirect(new URL('/login-main-middleware', request.url));
    }
}

// Update config to include all protected routes
export const config = {
    matcher: [
        '/api/:path*',
        '/superadmin/:path*',
        '/admin/:path*',
        '/orduser/:path*',
        '/dashboard/:path*',
        '/profile/:path*',
    ],
}; 
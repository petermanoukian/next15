// global middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { superadminMiddleware } from './middleware/superadmin';
import { adminMiddleware } from './middleware/admin';
import { orduserMiddleware } from './middleware/orduser';

export async function middleware(request: NextRequest) {
    console.log("🧭 Central middleware entry:", request.nextUrl.pathname);

    // Inject header for API requests only
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('X-Requested-With', 'XMLHttpRequest');

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // Delegate to role-based handlers
    if (request.nextUrl.pathname.startsWith('/superadmin/')) {
        return await superadminMiddleware(request);
    }

    if (request.nextUrl.pathname.startsWith('/admin/')) {
        return await adminMiddleware(request);
    }

    if (request.nextUrl.pathname.startsWith('/orduser/')) {
        return await orduserMiddleware(request);
    }

    return NextResponse.next();
}

// Route matcher
export const config = {
    matcher: [
        '/api/:path*',
        '/superadmin/:path*',
        '/admin/:path*',
        '/orduser/:path*',
    ],
};

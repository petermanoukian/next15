import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function adminMiddleware(request: NextRequest) {
    try {
        const user = await auth.user();
        
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Check if user is admin or superadmin
        if (!['admin', 'superadmin'].includes(user.is_admin)) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return NextResponse.redirect(new URL('/login', request.url));
    }
} 
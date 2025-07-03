import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { APP_BASE_URL } from '@/lib/config';

export async function superadminMiddleware(request: NextRequest) {

       console.log('Line 8 APP_BASE_URL:', APP_BASE_URL);
        console.log('Line 9 Request URL:', request.url);

   
    try {
        const user = await auth.user();

        if (!user) {
            // Centralized URL-based redirect
            return NextResponse.redirect(`${APP_BASE_URL}/login`);
        }
        if (!user || !user.is_admin) {
            return NextResponse.redirect(`${APP_BASE_URL}/login`);
        }



        if (user.is_admin !== 'superadmin') {
            return NextResponse.redirect(`${APP_BASE_URL}/unauthorized`);
        }

       return NextResponse.next();
    } catch (error) {
     console.error('Superadmin middleware error:', error);
        console.log('Redirecting to login:', `${APP_BASE_URL}/login`)

        //return NextResponse.redirect(`${APP_BASE_URL}/login?thepath=${APP_BASE_URL}&path2=${request.url}`);
       
       /*
        return NextResponse.redirect(
            `${APP_BASE_URL}/login?reason=error&error=${encodeURIComponent(error?.message || 'unknown')}&thepath=${encodeURIComponent(APP_BASE_URL)}&path2=${encodeURIComponent(request.url)}`
        );
        
       
            return new NextResponse(
                JSON.stringify({ error: error.message || 'Unauthorized' }),
                {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
                }
            );
        */



    }
}


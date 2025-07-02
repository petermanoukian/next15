'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/app/components/LoginForm';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();

    useEffect(() => {
        console.log('=== LOGIN PAGE DEBUG ===');
        console.log('Current User:', user);
        console.log('Loading State:', loading);
        console.log('User Type:', typeof user);
        if (user) {
            console.log('User Properties:', Object.keys(user));
            console.log('is_admin value:', user.is_admin);
            console.log('is_admin type:', typeof user.is_admin);
        }
        
        if (!loading && user && user.is_admin) {
            console.log('Conditions met for redirect:');
            console.log('- Not loading:', !loading);
            console.log('- Has user:', !!user);
            console.log('- Has is_admin:', !!user.is_admin);
            
            // Check for intended URL first
            const intendedUrl = searchParams.get('redirect');
            console.log('Intended URL:', intendedUrl);
            
            if (intendedUrl) {
                console.log('Redirecting to intended URL:', intendedUrl);
                router.replace(intendedUrl);
                return;
            }

            // Role-based redirects
            console.log('Starting role-based redirect for role:', user.is_admin);
            
            switch (user.is_admin) {
                case 'superadmin':
                    console.log('Redirecting to /superadmin');
                    router.replace('/superadmin');
                    break;
                case 'admin':
                    console.log('Redirecting to /admin');
                    router.replace('/admin');
                    break;
                case 'orduser':
                    console.log('Redirecting to /orduser');
                    router.replace('/orduser');
                    break;
                default:
                    console.log('Redirecting to /dashboard (default)');
                    router.replace('/dashboard');
            }
        } else {
            console.log('Redirect conditions not met:');
            console.log('- Loading:', loading);
            console.log('- Has user:', !!user);
            console.log('- Has is_admin:', user ? !!user.is_admin : false);
        }
        console.log('=== END LOGIN PAGE DEBUG ===');
    }, [user, loading, router, searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
        

            <LoginForm />
        </div>
    );
} 
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
    const router = useRouter();
    const { user, loading } = useAuth();

    console.log('home');

    useEffect(() => {
        if (!loading) {
            console.log('User:', user);

             if (user) {
               if (user.is_admin === 'superadmin') {
                 router.replace('/superadmin');
               } 
               else if (user.is_admin === 'admin') {
                 router.replace('/admin');
               } 
                else if (user.is_admin === 'orduser') {
                 router.replace('/orduser');
               } 
               else {
                   router.replace('/dashboard');
                }
            } else {
               router.replace('/login-entrypage');
             }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                {user ? (
                    <>
                        <h1 className="text-2xl font-bold">Welcome</h1>
                        <p>User Role: <strong>{user.is_admin}</strong></p>
                    </>
                ) : (
                    <p></p>
                )}
            </div>
        </div>
    );
}

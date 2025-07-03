'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import type { User } from '@/lib/auth';
import api from '@/lib/axios'; 

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        console.log('🧭 Axios instance (api) imported:', api);
        console.log('🌐 Axios baseURL:', api.defaults.baseURL);
        console.log('📄 Axios default headers:', api.defaults.headers);
    }, []);

        useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/api/ping'); // Or any harmless endpoint
                console.log('✅ Test API response:', res.data);
            } catch (err) {
                console.error('❌ Test API request failed:', err);
            }
        })();
    }, []);

    useEffect(() => {
    console.log('main page is loaded');

    }, []);


    useEffect(() => {
        const fetchUser = async () => {
            if (!isInitialLoad) return;
            
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching user data...');
                const userData = await auth.user();
                console.log('Raw user data:', userData);
                // The data seems to be nested under 'user', let's extract it
                setUser(userData.user || userData);
            } catch (error: any) {
                console.error('Failed to fetch user:', error);
                setError(error.response?.data?.message || 'Failed to load user data');
                if (error.response?.status === 401) {
                    router.push('/login');
                }
            } finally {
                setLoading(false);
                setIsInitialLoad(false);
            }
        };

        fetchUser();
    }, [router, isInitialLoad]);

    // Add debug log to see what's in the user state
    console.log('Current user state:', user);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
                    <p className="text-red-600 mt-2">{error}</p>
                    <button
                        onClick={() => setIsInitialLoad(true)}
                        className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {user ? `Welcome back, ${user.name}!` : 'Welcome to Dashboard'}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user && (
                    <>
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h2 className="text-lg font-medium text-blue-900 mb-4">Profile Information</h2>
                            <div className="space-y-3 text-blue-800">
                                <p>
                                    <span className="font-medium">
                                        Name:
                                     we will log gere to see if updated
                                     Number 1   
                                        
                                        
                                        </span> {user.name}
                                </p>
                                <p>
                                    <span className="font-medium">Email:</span> {user.email}
                                </p>
                                <p>
                                    <span className="font-medium">Role:</span>{' '}
                                    <span className="capitalize">{user.is_admin}</span>
                                </p>
                                <p>
                                    <span className="font-medium">Email Verified:</span>{' '}
                                    {user.email_verified_at ? 'Yes' : 'No'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-lg">
                            <h2 className="text-lg font-medium text-purple-900 mb-4">Account Details</h2>
                            <div className="space-y-3 text-purple-800">
                                <p>
                                    <span className="font-medium">Account ID:</span> {user.id}
                                </p>
                                <p>
                                    <span className="font-medium">Created:</span>{' '}
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                                <p>
                                    <span className="font-medium">Last Updated:</span>{' '}
                                    {new Date(user.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
} 
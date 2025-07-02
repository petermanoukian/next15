'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function AdminPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();


useEffect(() => {
    const fetchSuperadminDashboard = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/superadmin/dashboard', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Access Denied fpor admin:', errorData.message); // Should log: "Access denied. Superadmin privileges required."
            } else {
                const data = await response.json();
                console.log('✅ Superadmin Access for admin:', data);
            }
        } catch (error) {
            console.error('❌ API call error:', error);
        }
    };

    fetchSuperadminDashboard();
}, []);




    useEffect(() => {
        /*
        if (!loading && (!user || user.is_admin !== 'admin')) {
            router.replace('/login');
        }
            */
    }, [user, loading, router]);

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold leading-tight text-gray-900">Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        Logout
                    </button>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="px-4 py-8 sm:px-0">
                            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold text-gray-900">Welcome to Admin Area</h2>
                                    <p className="mt-2 text-gray-600">You have admin privileges</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 
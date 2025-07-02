'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import type { User } from '@/lib/auth';

export default function UserDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/dashboard`, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const data = await response.json();
                setUser(data.user);
            } catch (error) {
                console.error('Dashboard data fetch failed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">User Dashboard</h2>
                {user && (
                    <div className="space-y-4">
                        <p className="text-gray-600">Welcome back, <span className="font-semibold text-gray-900">{user.name}</span></p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-blue-900">User Details</h3>
                                <p className="text-blue-800">Role: {user.is_admin}</p>
                                <p className="text-blue-800">Email: {user.email}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-purple-900">Access Level</h3>
                                <p className="text-purple-800">Basic access</p>
                                <p className="text-purple-800">Can view and manage own profile</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 
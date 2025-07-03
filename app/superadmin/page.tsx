'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';

import { auth } from '@/lib/auth';
import type { User } from '@/lib/auth';
import api from '@/lib/axios'; // ✅ Import your custom Axios instance
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';



export default function SuperAdminPage() {
    //const router = useRouter();
    //const { logout } = useAuth();

    //const { user, setUser, isInitialLoad, handleLogout } = useSuperActions();
    const { user, isInitialLoad} = useSuperActions();
    //const [loading, setLoading] = useState(true);
    //const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('🧭 Axios instance (api) imported:', api);
        console.log('🌐 Axios baseURL:', api.defaults.baseURL);
        console.log('📄 Axios default headers:', api.defaults.headers);
    }, []);


    
    useEffect(() => {
        const fetchDebug = async () => {
            try {
                const debug = await api.get('/api/debug-session');
                console.log('Crucila cruciala Line 35 🔍 Debug Session:', debug.data);
            } catch (err) {
                console.error('❌ Debug fetch failed:', err);
            }
        };

        fetchDebug();
    }, []);

    
   
    if (isInitialLoad) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

   if (!user || user.is_admin !== 'superadmin') return null;


    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="px-4 py-8 sm:px-0">
                            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Welcome to Super Admin Area
                                        this is version 1 for debug for chat gpt and copilot
                                        
                                    </h2>
                                    <p className="mt-2 text-gray-600">{user.is_admin}</p>
                                </div>

                                {user && (
                                    <div className="bg-blue-50 p-6 rounded-lg mt-4">
                                        <h2 className="text-lg font-medium text-blue-900 mb-4">
                                            Profile Information
                                        </h2>
                                        <div className="space-y-3 text-blue-800">
                                            <p>
                                                <span className="font-medium">Name:</span> {user.name}
                                            </p>
                                            <p>
                                                <span className="font-medium">Email:</span> {user.email}
                                            </p>
                                            <p>
                                                <span className="font-medium">Role:</span>{' '}
                                                <span className="capitalize">{user.is_admin}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}




 
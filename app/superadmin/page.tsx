'use client';

import { useEffect, useState } from 'react';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import api from '@/lib/axios';

export default function SuperAdminPage() {
    const { user, isInitialLoad } = useSuperActions();
    const [debugSession, setDebugSession] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [axiosInfo, setAxiosInfo] = useState({
        baseURL: '',
        headers: {},
    });

    useEffect(() => {
        setAxiosInfo({
            baseURL: api.defaults.baseURL ?? 'undefined',
            headers: api.defaults.headers,
        });
    }, []);

    useEffect(() => {
        const fetchDebug = async () => {
            try {
                const res = await api.get('/api/debug-session');
                setDebugSession(res.data);
            } catch (err: any) {
                setError(err?.message ?? 'Unknown error');
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
                            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Welcome to Super Admin Area  
                                        <br />
                                        This is version 2 for debug for ChatGPT and Copilot
                                    </h2>
                                    <p className="mt-2 text-gray-600">{user.is_admin}</p>
                                </div>

                                {user && (
                                    <div className="bg-blue-50 p-6 rounded-lg mt-4">
                                        <h2 className="text-lg font-medium text-blue-900 mb-4">
                                            Profile Information
                                        </h2>
                                        <div className="space-y-3 text-blue-800">
                                            <p><span className="font-medium">Name:</span> {user.name}</p>
                                            <p><span className="font-medium">Email:</span> {user.email}</p>
                                            <p><span className="font-medium">Role:</span> <span className="capitalize">{user.is_admin}</span></p>
                                        </div>
                                    </div>
                                )}

                                {/* 🧪 DEBUG SECTION */}


                                <div className="mt-6 border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        🛠 Axios Instance (api)
                                        versipon 6 </h3>

                                    <div className="bg-green-50 p-4 rounded text-sm font-mono text-gray-800">
                                        <p><strong>Axios Type:</strong> {typeof api}</p>
                                        <p><strong>Has .get:</strong> {typeof api.get === 'function' ? '✅ Yes' : '❌ No'}</p>
                                        <p><strong>Has .post:</strong> {typeof api.post === 'function' ? '✅ Yes' : '❌ No'}</p>
                                        <p><strong>Defaults baseURL:</strong> {api.defaults.baseURL}</p>

                                        <p className="mt-2"><strong>Defaults Headers:</strong></p>
                                        <pre className="overflow-x-auto">{JSON.stringify(api.defaults.headers, null, 2)}</pre>
                                    </div>
                                </div>





                                <div className="mt-6 border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">🧪 Debug Output</h3>

                                    <div className="bg-yellow-50 p-4 rounded text-sm font-mono text-gray-800">
                                        <p><strong>Axios Base URL:</strong> {axiosInfo.baseURL}</p>
                                        <p><strong>Axios Headers:</strong></p>
                                        <pre className="overflow-x-auto">{JSON.stringify(axiosInfo.headers, null, 2)}</pre>

                                        <p className="mt-4"><strong>Debug Session Response:</strong></p>
                                        {debugSession ? (
                                            <pre className="overflow-x-auto">{JSON.stringify(debugSession, null, 2)}</pre>
                                        ) : error ? (
                                            <p className="text-red-600">❌ Error fetching debug session: {error}</p>
                                        ) : (
                                            <p>⏳ Fetching debug session...</p>
                                        )}
                                    </div>
                                </div>
                                {/* END DEBUG */}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

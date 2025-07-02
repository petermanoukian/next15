//C:\My-Documents\next\app\superadmin\layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import SuperAdminNav from '@/app/components/superadmin/Nav';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isInitialLoad } = useSuperActions();

    useEffect(() => {
        if (!isInitialLoad && user) {
            if (user.is_admin !== 'superadmin') {
                router.push(user.is_admin === 'admin' ? '/admin' : '/user');
            }
        }
    }, [isInitialLoad, user, router]);

    if (isInitialLoad || !user || user.is_admin !== 'superadmin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <SuperAdminNav />
            <main className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

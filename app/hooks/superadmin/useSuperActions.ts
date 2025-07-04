'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export function useSuperActions() {
    const router = useRouter();
    const { user, logout, loading } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login');
        } catch (error) {
            console.error('❌ Logout failed:', error);
        }
    };

    return {
        user,
        isInitialLoad: loading,
        handleLogout,
    };
}

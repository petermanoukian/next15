'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { auth } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';
import type { User } from '@/lib/auth';

export function useSuperActions() {
    const router = useRouter();
    const { logout } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);


    useEffect(() => {
    console.log('🧭 Axios instance:', api);
    console.log('🌐 Axios baseURL:', api.defaults.baseURL);
    console.log('📄 Axios headers:', api.defaults.headers);
    }, []);


    useEffect(() => {
        const fetchUser = async () => {
            if (!isInitialLoad) return;

            try {
                const userData = await auth.user();
                setUser(userData.user || userData);
            } catch (error: any) {
                console.error('❌ Failed to fetch user:', error);
                if (error.response?.status === 401) {
                    router.push('/login');
                }
            } finally {
                setIsInitialLoad(false);
            }
        };

        fetchUser();
    }, [router, isInitialLoad]);

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
        setUser,
        isInitialLoad,
        handleLogout,
    };
}

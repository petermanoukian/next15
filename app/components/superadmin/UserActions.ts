//C:\My-Documents\next\app\components\superadmin\UserActions.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';
import type { User } from '@/lib/auth';

export function UserActions() {
    const router = useRouter();
    const { logout } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            //console.log('started the fetch user isInitialLoad', isInitialLoad);
            if (!isInitialLoad) return;

            try {
                //console.log('Fetching user data...');
                const userData = await auth.user();
                //console.log('Raw user data:', userData);
                setUser(userData.user || userData);
            } catch (error: any) {
                //console.error('Failed to fetch user:', error);
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
            console.error('Logout failed:', error);
        }
    };

    return {
        user,
        setUser,
        isInitialLoad,
        handleLogout,
    };
}


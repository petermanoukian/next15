'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export function useSuperActions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, loading } = useAuth();
  const isHydrated = typeof window !== 'undefined'; 

  const handleLogout = async () => {
    try {
      await logout(); // Call server-side logout
      alert('logged out');
      // 🔥 Force a full browser reload — avoids redirect spins
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };


useEffect(() => {
  if (!isHydrated || loading) return;
  if (!user) router.replace('/login');
}, [loading, user, router]);

  return {
    user,
    isInitialLoad: loading,
    handleLogout,
  };
}

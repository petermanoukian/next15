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
      const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));

      try {
        await Promise.race([
          logout(),
          timeout(3000) // hard cutoff
        ]);
        alert('✅ Logged out');
      } catch (err) {
        console.error('❌ Logout failed or timed out');
      }

      //window.location.replace('/login?started=usersuperaction');
      router.push('/login'); 
  };

  /*
  useEffect(() => {
    if (!isHydrated || loading) return;
    if (!user) router.replace('/login');
  }, [loading, user, router]);
  */

  useEffect(() => {
  if (!isHydrated || loading) return;

  if (!user && window.location.pathname !== '/login') {
    router.replace('/login');
  }
}, [loading, user, router]);

  return {
    user,
    isInitialLoad: loading,
    handleLogout,
  };



}



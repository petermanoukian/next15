'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import SuperAdminNav from '@/app/components/superadmin/Nav';
import { AuthProvider } from '@/lib/AuthContext';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: LayoutProps) {
  return (
    <AuthProvider children={<SuperAdminShell>{children}</SuperAdminShell>} />
  );
}

function SuperAdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isInitialLoad } = useSuperActions();
  const message = searchParams.get('message');

  useEffect(() => {
    if (message) {
      console.log('📨 Message passed into superadmin:', message);
    }
  }, [message]);

  useEffect(() => {
    if (!isInitialLoad && user) {
      switch (user.is_admin) {
        case 'superadmin':
          break;
        case 'admin':
          router.replace('/admin?message=RedirectedFromSuper');
          break;
        case 'orduser':
          router.replace('/user?message=RedirectedFromSuper');
          break;
        default:
          router.replace('/login');
      }
    }
  }, [isInitialLoad, user, router]);

  if (isInitialLoad || !user) {
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
          {message && (
            <div className="bg-green-100 text-green-700 p-3 mb-4 rounded shadow">
              {message}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

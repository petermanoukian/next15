'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import SuperAdminNav from '@/app/components/superadmin/Nav';
import { AuthProvider } from '@/lib/AuthContext';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <SuperAdminShell>{children}</SuperAdminShell>
    </AuthProvider>
  );
}

function SuperAdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isInitialLoad } = useSuperActions();

  useEffect(() => {
    if (!isInitialLoad && user) {
      switch (user.is_admin) {
        case 'superadmin':
          break; // ✅ Allowed access
        case 'admin':
          router.replace('/admin');
          break;
        case 'orduser':
          router.replace('/user');
          break;
        default:
          router.replace('/unauthorized');
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
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

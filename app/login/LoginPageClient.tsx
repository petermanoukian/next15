'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/app/components/LoginForm';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPageClient() {

  console.log('LoginPageClient');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && user.is_admin) {
      const intendedUrl = searchParams.get('redirect');
      if (intendedUrl) {
        router.replace(intendedUrl);
        return;
      }
      switch (user.is_admin) {
        case 'superadmin':
          router.replace('/superadmin');
          break;
        case 'admin':
          router.replace('/admin');
          break;
        case 'orduser':
          router.replace('/orduser');
          break;
        default:
          router.replace('/dashboard');
      }
    }
  }, [user, loading, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoginForm />
    </div>
  );
}

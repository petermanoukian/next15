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
  if (loading) return; // wait until loading completes

  // ✅ Safely guard against null/invalid user
  if (!user || !user?.id || !user?.is_admin) {
    console.log('🧍 No valid user. Staying on login page.', user);
    return;
  }

  console.log('✅ Valid user detected, redirecting to dashboard...', user);

  let intendedUrl = searchParams.get('redirect');
  if (intendedUrl) {
    router.replace(`${intendedUrl}?startedfrom=intendedurl`);
    return;
  }

  switch (user.is_admin) {
    case 'superadmin':
      router.replace('/superadmin?started=fromlogin');
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
}, [loading, user, router, searchParams]);



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

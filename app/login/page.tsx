export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import LoginPageClient from './LoginPageClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <LoginPageClient />
    </Suspense>
  );
}

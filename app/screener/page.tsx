'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScreenerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/#screener-section');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
        <p className="text-lg font-medium">Redirecting to eligibility screener...</p>
      </div>
    </div>
  );
}

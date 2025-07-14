'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LibraryRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified dashboard
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
} 
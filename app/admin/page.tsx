"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to tickets page as the default admin page
    router.replace('/admin/tickets');
  }, [router]);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-md text-center">
        <p className="text-[var(--foreground-muted)]">Redirecting...</p>
      </div>
    </div>
  );
}

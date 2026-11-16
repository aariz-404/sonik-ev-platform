'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { DemoBanner } from '@/components/DemoBanner';
import { ToastProvider } from '@/components/ui/Toast';
import { isAuthenticated, hasOperatorAccess } from '@/lib/auth';

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=operator');
      return;
    }
    if (!hasOperatorAccess()) {
      router.push('/login?forbidden=1');
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Verifying operator credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-brand-surface flex flex-col font-sans">
        <DemoBanner />
        <div className="flex-1 flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

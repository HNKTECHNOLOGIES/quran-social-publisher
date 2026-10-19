'use client';

import { BottomNav } from '@/components/BottomNav';
import { AuthGuard } from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden">
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}

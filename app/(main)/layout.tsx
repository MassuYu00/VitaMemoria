'use client';

import BottomNav from '@/components/ui/BottomNav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <main className="pb-safe">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

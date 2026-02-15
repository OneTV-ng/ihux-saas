import { ReactNode } from 'react';
import MobileAdminNav from '@/components/m-admin/mobile-admin-nav';
import { requireAdmin } from '@/lib/auth-server';

export const metadata = {
  title: 'Admin - Mobile',
  description: 'Mobile admin dashboard',
};

export default async function MobileAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Protect route - require admin
  await requireAdmin();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation - Fixed */}
      <MobileAdminNav />
    </div>
  );
}

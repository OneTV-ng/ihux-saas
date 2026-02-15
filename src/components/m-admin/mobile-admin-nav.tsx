'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Music,
  MoreHorizontal,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/m/admin' },
  { icon: Users, label: 'Users', href: '/m/admin/users' },
  { icon: ShieldCheck, label: 'Verify', href: '/m/admin/verification' },
  { icon: Music, label: 'Songs', href: '/m/admin/songs' },
  { icon: MoreHorizontal, label: 'More', href: '/m/admin/more' },
];

export default function MobileAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="w-full h-16 flex flex-col gap-1 rounded-none"
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

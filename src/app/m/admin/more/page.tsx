export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Settings,
  FileText,
  MessageSquare,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
} from 'lucide-react';
import Link from 'next/link';

export default function MobileAdminMore() {
  const sections = [
    {
      title: 'Administration',
      items: [
        {
          icon: Shield,
          label: 'Permissions & Roles',
          href: '/m/admin/settings/roles',
        },
        {
          icon: Settings,
          label: 'System Settings',
          href: '/m/admin/settings',
        },
        {
          icon: Bell,
          label: 'Notifications',
          href: '/m/admin/settings/notifications',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: MessageSquare,
          label: 'Support Tickets',
          href: '/m/admin/support',
        },
        {
          icon: FileText,
          label: 'Reports & Logs',
          href: '/m/admin/logs',
        },
      ],
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <h1 className="text-2xl font-bold text-primary">More</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Additional admin tools and settings
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2 px-2">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href}>
                    <Card className="cursor-pointer hover:bg-accent transition">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Account Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2 px-2">
            Account
          </h2>
          <Card>
            <CardContent className="p-3">
              <Link href="/auth/signout">
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">Feb 15, 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600">Online</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

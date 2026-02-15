import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ShieldCheck,
  Music,
  TrendingUp,
  Settings,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';

export default function MobileAdminDashboard() {
  const stats = [
    {
      label: 'Total Users',
      value: '2,543',
      change: '+12%',
      icon: Users,
      href: '/m/admin/users',
    },
    {
      label: 'Pending Verification',
      value: '18',
      change: '+3',
      icon: ShieldCheck,
      href: '/m/admin/verification',
    },
    {
      label: 'Songs Published',
      value: '892',
      change: '+45',
      icon: Music,
      href: '/m/admin/songs',
    },
    {
      label: 'Platform KPI',
      value: '94.2%',
      change: '+2.1%',
      icon: TrendingUp,
      href: '/m/admin/kpi',
    },
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'View and manage users',
      href: '/m/admin/users',
      icon: Users,
    },
    {
      title: 'Verification',
      description: 'Review verification requests',
      href: '/m/admin/verification',
      icon: ShieldCheck,
    },
    {
      title: 'Song Publishing',
      description: 'Manage song publications',
      href: '/m/admin/songs',
      icon: Music,
    },
    {
      title: 'Reports & KPI',
      description: 'View analytics and metrics',
      href: '/m/admin/kpi',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Hub</h1>
            <p className="text-sm text-muted-foreground">Mobile Dashboard</p>
          </div>
          <Link href="/m/admin/more">
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <Card className="cursor-pointer hover:shadow-md transition h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <p className="text-xs text-green-600 mt-2">{stat.change}</p>
                      </div>
                      <Icon className="w-5 h-5 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="cursor-pointer hover:bg-accent transition">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {[
                {
                  event: 'New user verification',
                  user: 'John Doe',
                  time: '2 hours ago',
                },
                {
                  event: 'Song published',
                  user: 'Jane Smith',
                  time: '5 hours ago',
                },
                {
                  event: 'User suspended',
                  user: 'System',
                  time: '1 day ago',
                },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start justify-between pb-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{activity.event}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

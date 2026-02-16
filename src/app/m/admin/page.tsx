'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
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
  AlertCircle,
  Menu,
  X,
  Home,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { mobileApi } from '@/lib/mobile-api-client';
import { useAuth } from '@/contexts/auth-context';

interface DashboardStats {
  totalUsers: number;
  pendingVerifications: number;
  songsPublished: number;
  platformHealth: number;
}

interface RecentActivity {
  event: string;
  user: string;
  time: string;
  type: 'verification' | 'song' | 'suspension';
}

export default function MobileAdminDashboard() {
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingVerifications: 0,
    songsPublished: 0,
    platformHealth: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get stats from admin API
      const usersResponse = await mobileApi.admin.getUsers(1, 1);
      const verificationResponse = await mobileApi.admin.getUsers(1, 1000);

      if (usersResponse.success && verificationResponse.success) {
        // Count pending verifications
        const verificationData = verificationResponse.data as any;
        const usersData = usersResponse.data as any;
        const pendingCount = verificationData?.filter?.(
          (u: any) => u.verificationStatus === 'pending'
        ).length || 0;

        setStats({
          totalUsers: usersData?.totalUsers || 0,
          pendingVerifications: pendingCount,
          songsPublished: 0, // TODO: get from song API
          platformHealth: 94.2,
        });

        // Mock activities for now - can be replaced with real data
        setActivities([
          {
            event: 'New user verification',
            user: 'John Doe',
            time: '2 hours ago',
            type: 'verification',
          },
          {
            event: 'Song published',
            user: 'Jane Smith',
            time: '5 hours ago',
            type: 'song',
          },
          {
            event: 'User suspended',
            user: 'System',
            time: '1 day ago',
            type: 'suspension',
          },
        ]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data'
      );
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+12%',
      icon: Users,
      href: '/m/admin/users',
    },
    {
      label: 'Pending Verification',
      value: stats.pendingVerifications,
      change: '+3',
      icon: ShieldCheck,
      href: '/m/admin/verification',
    },
    {
      label: 'Songs Published',
      value: stats.songsPublished,
      change: '+45',
      icon: Music,
      href: '/m/admin/songs',
    },
    {
      label: 'Platform KPI',
      value: `${stats.platformHealth}%`,
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

  if (error) {
    return (
      <div className="w-full p-4">
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading dashboard</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* SingFLEX Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-primary">
              <Image
                src="/images/tenant/sflogo.png"
                alt="SingFLEX Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Admin Hub</h1>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Loading...' : 'Live Dashboard'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-10" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-0 right-0 h-screen w-64 bg-background border-l shadow-lg z-30 overflow-y-auto">
          <div className="p-4 space-y-2">
            <Link href="/m/admin">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/m/admin/users">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Button>
            </Link>
            <Link href="/m/admin/verification">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verification
              </Button>
            </Link>
            <Link href="/m/admin/songs">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Music className="mr-2 h-4 w-4" />
                Songs Publishing
              </Button>
            </Link>
            <Link href="/m/admin/kpi">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                KPI & Reports
              </Button>
            </Link>
            <Link href="/m/admin/settings">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            <div className="border-t pt-2 mt-2">
              <Button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {statsConfig.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <Card className="cursor-pointer hover:shadow-md transition h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {stat.label}
                        </p>
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
              {activities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between pb-3 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.event}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user}
                    </p>
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

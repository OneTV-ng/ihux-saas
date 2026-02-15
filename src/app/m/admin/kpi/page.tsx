'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Music,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mobileApi } from '@/lib/mobile-api-client';

interface KPIMetrics {
  totalUsers: number;
  totalSongs: number;
  platformHealth: number;
  avgRating: number;
}

export default function MobileAdminKPI() {
  const [metrics, setMetrics] = useState<KPIMetrics>({
    totalUsers: 0,
    totalSongs: 0,
    platformHealth: 94.2,
    avgRating: 4.8,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users count
      const usersResponse = await mobileApi.admin.getUsers(1, 1);

      // Fetch public songs count
      const songsResponse = await mobileApi.songs.getPublicSongs(1, 1000);

      if (usersResponse.success && songsResponse.success) {
        setMetrics({
          totalUsers: usersResponse.data?.totalUsers || 0,
          totalSongs: songsResponse.data?.total || 0,
          platformHealth: 94.2,
          avgRating: 4.8,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load KPI metrics'
      );
      console.error('KPI load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    {
      title: 'Total Users',
      value: metrics.totalUsers.toLocaleString(),
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
    },
    {
      title: 'Songs Published',
      value: metrics.totalSongs.toLocaleString(),
      change: '+45',
      trend: 'up' as const,
      icon: Music,
    },
    {
      title: 'Platform Health',
      value: `${metrics.platformHealth}%`,
      change: '+2.1%',
      trend: 'up' as const,
      icon: TrendingUp,
    },
    {
      title: 'Avg User Rating',
      value: `${metrics.avgRating}/5`,
      change: '-0.2%',
      trend: 'down' as const,
      icon: TrendingDown,
    },
  ];

  if (error) {
    return (
      <div className="w-full p-4">
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading KPI metrics</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMetrics}
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
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <h1 className="text-2xl font-bold text-primary mb-2">Reports & KPI</h1>
        <p className="text-xs text-muted-foreground">
          {loading ? 'Loading...' : 'Platform analytics and metrics'}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* KPI Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-3">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon;
                  const isTrendUp = kpi.trend === 'up';

                  return (
                    <Card key={kpi.title}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <Icon className="w-4 h-4 text-primary opacity-60" />
                          <Badge
                            variant={isTrendUp ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {isTrendUp ? '↑' : '↓'} {kpi.change}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {kpi.title}
                        </p>
                        <p className="text-xl font-bold">{kpi.value}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick Insights */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Quick Insights</h2>
              <Card>
                <CardContent className="p-4 space-y-3">
                  {[
                    `📈 Platform has ${metrics.totalUsers.toLocaleString()} active users`,
                    `🎵 ${metrics.totalSongs.toLocaleString()} songs published`,
                    `💚 Platform health at ${metrics.platformHealth}%`,
                    `⭐ Average user rating: ${metrics.avgRating}/5`,
                  ].map((insight, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      {insight}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Music,
  DollarSign,
  Activity,
} from 'lucide-react';

export default function MobileAdminKPI() {
  const kpis = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Active Sessions',
      value: '487',
      change: '+8%',
      trend: 'up',
      icon: Activity,
    },
    {
      title: 'Songs Published',
      value: '892',
      change: '+45',
      trend: 'up',
      icon: Music,
    },
    {
      title: 'Total Revenue',
      value: '$24,580',
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Avg User Rating',
      value: '4.8/5',
      change: '-0.2%',
      trend: 'down',
      icon: TrendingDown,
    },
    {
      title: 'Platform Health',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
    },
  ];

  const topArtists = [
    { rank: 1, name: 'John Doe', songs: 45, streams: 125000 },
    { rank: 2, name: 'Jane Smith', songs: 38, streams: 98500 },
    { rank: 3, name: 'Mike Johnson', songs: 52, streams: 87300 },
    { rank: 4, name: 'Sarah Williams', songs: 29, streams: 76200 },
    { rank: 5, name: 'David Brown', songs: 41, streams: 65100 },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <h1 className="text-2xl font-bold text-primary mb-2">Reports & KPI</h1>
        <p className="text-xs text-muted-foreground">Platform analytics and metrics</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
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

        {/* Top Artists */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Top Artists</h2>
          <Card>
            <CardContent className="p-0">
              {topArtists.map((artist, idx) => (
                <div
                  key={artist.rank}
                  className={`p-4 flex items-start justify-between ${
                    idx !== topArtists.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        #{artist.rank}
                      </Badge>
                      <p className="font-semibold text-sm">{artist.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {artist.songs} songs • {artist.streams.toLocaleString()} streams
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Insights</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {[
                '📈 User growth is 12% higher than last month',
                '🎵 Song publishing rate increased by 45 uploads',
                '💰 Revenue up 18% from last quarter',
                '⚠️ 3 reports pending moderation review',
              ].map((insight, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">
                  {insight}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

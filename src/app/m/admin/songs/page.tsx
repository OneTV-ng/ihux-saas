import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Music,
  ChevronRight,
  Play,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

export default function MobileAdminSongs() {
  const songs = [
    {
      id: 1,
      title: 'Midnight Dreams',
      artist: 'John Doe',
      status: 'published',
      plays: 1250,
      date: '2024-02-10',
    },
    {
      id: 2,
      title: 'Summer Vibes',
      artist: 'Jane Smith',
      status: 'published',
      plays: 890,
      date: '2024-02-09',
    },
    {
      id: 3,
      title: 'Lost Echo',
      artist: 'Mike Johnson',
      status: 'pending',
      plays: 0,
      date: '2024-02-08',
    },
    {
      id: 4,
      title: 'Electric Heart',
      artist: 'Sarah Williams',
      status: 'published',
      plays: 2100,
      date: '2024-02-07',
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <h1 className="text-2xl font-bold text-primary mb-2">Song Publishing</h1>
        <p className="text-xs text-muted-foreground">
          Manage songs and publishing
        </p>
      </div>

      {/* Songs List */}
      <div className="p-4 space-y-3">
        {songs.map((song) => (
          <Card key={song.id} className="cursor-pointer hover:bg-accent transition">
            <Link href={`/m/admin/songs/${song.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <Music className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{song.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 ml-6">
                      <Badge
                        variant={
                          song.status === 'published' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {song.status}
                      </Badge>
                      {song.plays > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Play className="w-3 h-3" />
                          <span>{song.plays.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

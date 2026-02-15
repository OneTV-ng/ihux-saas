'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, ChevronRight, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { mobileApi } from '@/lib/mobile-api-client';

interface Song {
  id: string;
  title: string;
  artistId: string;
  status?: 'draft' | 'pending' | 'published';
  createdAt?: string;
  isFeatured?: boolean;
}

export default function MobileAdminSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadSongs();
  }, [page]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mobileApi.songs.getPublicSongs(page, 20);

      if (response.success) {
        setSongs(response.data?.songs || response.data || []);
      } else {
        setError(response.error || 'Failed to load songs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load songs');
      console.error('Songs load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <h1 className="text-2xl font-bold text-primary mb-2">Song Publishing</h1>
        <p className="text-xs text-muted-foreground">
          Manage songs and publishing
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4">
          <Card className="border-destructive">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSongs}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-4 flex justify-center">
          <Loader className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {/* Songs List */}
      {!loading && !error && (
        <div className="p-4 space-y-3">
          {songs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No songs found</p>
              </CardContent>
            </Card>
          ) : (
            songs.map((song) => (
              <Card
                key={song.id}
                className="cursor-pointer hover:bg-accent transition"
              >
                <Link href={`/m/admin/songs/${song.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <Music className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm">{song.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {song.artistId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 ml-6">
                          {song.status && (
                            <Badge
                              variant={
                                song.status === 'published'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {song.status}
                            </Badge>
                          )}
                          {song.isFeatured && (
                            <Badge variant="default" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}

          {/* Pagination */}
          {songs.length > 0 && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-2 text-sm text-muted-foreground">
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={songs.length < 20}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

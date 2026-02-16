'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Music,
  ChevronRight,
  AlertCircle,
  Loader,
  Send,
  CheckCircle,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { mobileApi } from '@/lib/mobile-api-client';
import { useAlert } from '@/contexts/alert-context';
import { SongDetailsModal } from '@/components/admin/song-details-modal';

interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  status?: string;
  createdAt?: string;
  isFeatured?: boolean;
  productCode?: string;
  userId?: string;
  cover?: string;
  genre?: string;
  releaseDate?: string;
  producer?: string;
  writer?: string;
  recordLabel?: string;
  language?: string;
  upc?: string;
  numberOfTracks?: number;
  duration?: number;
  plays?: number;
}

interface Track {
  id: string;
  title: string;
  duration?: number;
  isrc?: string;
  explicit?: string;
}

export default function MobileAdminSongs() {
  const { showAlert } = useAlert();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);

  useEffect(() => {
    loadSongs();
  }, [page]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mobileApi.songs.getPublicSongs(page, 20);

      if (response.success) {
        const data = response.data as any;
        setSongs(data?.songs || data || []);
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

  const handlePublishSong = async (e: React.MouseEvent, songId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setPublishingId(songId);
      const response = await mobileApi.admin.publishSong(songId);

      if (response.success) {
        showAlert('Song published successfully!', 'success');
        // Update the song in the list
        const data = response.data as any;
        setSongs((prev) =>
          prev.map((s) =>
            s.id === songId
              ? {
                  ...s,
                  status: 'processing',
                  productCode: data?.publishingRecord?.productCode,
                }
              : s
          )
        );
      } else {
        showAlert(response.error || 'Failed to publish song', 'error');
      }
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Failed to publish song', 'error');
    } finally {
      setPublishingId(null);
    }
  };

  const handleViewSongDetails = async (song: Song) => {
    try {
      setLoadingTracks(true);
      setSelectedSong(song);

      // Fetch full song details with tracks
      const response = await mobileApi.songs.getSong(song.id);

      if (response.success) {
        const data = response.data as any;
        setSelectedTracks(data?.tracks || []);
      } else {
        setSelectedTracks([]);
      }

      setModalOpen(true);
    } catch (err) {
      console.error('Error loading song details:', err);
      setModalOpen(true);
    } finally {
      setLoadingTracks(false);
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
                className={song.status === 'submitted' ? 'border-blue-300' : ''}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Cover Image */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {song.cover ? (
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <Music className="w-8 h-8 text-primary/30" />
                        </div>
                      )}

                      {/* View Details Button Overlay */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewSongDetails(song);
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                      >
                        <Eye className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/m/admin/songs/${song.id}`}>
                        <div className="cursor-pointer hover:bg-accent/50 p-2 -m-2 rounded">
                          <p className="font-semibold text-sm truncate">{song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {song.artistName || song.artistId}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {song.productCode && (
                              <Badge variant="outline" className="text-xs font-mono">
                                {song.productCode}
                              </Badge>
                            )}
                            {song.status && (
                              <Badge
                                variant={
                                  song.status === 'published'
                                    ? 'default'
                                    : song.status === 'processing'
                                      ? 'secondary'
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
                      </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Publish Button - Only show for submitted songs */}
                      {song.status === 'submitted' && !song.productCode && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 gap-1"
                          onClick={(e) => handlePublishSong(e, song.id)}
                          disabled={publishingId === song.id}
                        >
                          {publishingId === song.id ? (
                            <>
                              <Loader className="w-3 h-3 animate-spin" />
                              <span className="hidden sm:inline">Publishing...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              <span className="hidden sm:inline">Publish</span>
                            </>
                          )}
                        </Button>
                      )}

                      {/* Published Indicator */}
                      {song.productCode && (
                        <Link href={`/m/admin/publishing/${song.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-green-600"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
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

      {/* Song Details Modal */}
      {selectedSong && (
        <SongDetailsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          song={selectedSong}
          tracks={selectedTracks}
          onCopy={(text, label) => {
            navigator.clipboard.writeText(text);
            showAlert(`${label} copied to clipboard!`, 'success');
          }}
        />
      )}
    </div>
  );
}

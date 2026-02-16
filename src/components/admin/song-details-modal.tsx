'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Music,
  Calendar,
  User,
  Disc,
  ListMusic,
  X,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SongDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song?: {
    id: string;
    title: string;
    artistName: string;
    genre?: string;
    releaseDate?: string;
    cover?: string;
    producer?: string;
    writer?: string;
    recordLabel?: string;
    language?: string;
    upc?: string;
    status?: string;
    productCode?: string;
    numberOfTracks?: number;
    duration?: number;
    isFeatured?: boolean;
    plays?: number;
  };
  tracks?: Array<{
    id: string;
    title: string;
    duration?: number;
    isrc?: string;
    explicit?: string;
    lyrics?: string;
  }>;
  onCopy?: (text: string, label: string) => void;
}

export function SongDetailsModal({
  open,
  onOpenChange,
  song,
  tracks = [],
  onCopy,
}: SongDetailsModalProps) {
  if (!song) return null;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onCopy?.(text, label);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Album Cover & Header */}
        <div className="relative">
          {song.cover ? (
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
              <img
                src={song.cover}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-64 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Music className="w-24 h-24 text-primary/30" />
            </div>
          )}
        </div>

        <DialogHeader className="text-left mt-4">
          <div className="space-y-2">
            <DialogTitle className="text-2xl">{song.title}</DialogTitle>
            <DialogDescription className="text-base">
              {song.artistName}
            </DialogDescription>
            <div className="flex flex-wrap gap-2 pt-2">
              {song.status && (
                <Badge
                  variant={song.status === 'published' ? 'default' : 'secondary'}
                >
                  {song.status}
                </Badge>
              )}
              {song.isFeatured && <Badge variant="default">Featured</Badge>}
              {song.language && (
                <Badge variant="outline">{song.language}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Song Details */}
        <div className="space-y-4">
          {/* Metadata Cards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Song Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow icon={Disc} label="Genre" value={song.genre} />
              <DetailRow
                icon={Calendar}
                label="Release Date"
                value={
                  song.releaseDate
                    ? new Date(song.releaseDate).toLocaleDateString()
                    : undefined
                }
              />
              <DetailRow icon={User} label="Producer" value={song.producer} />
              <DetailRow icon={User} label="Writer" value={song.writer} />
              <DetailRow
                icon={Music}
                label="Record Label"
                value={song.recordLabel}
              />
              {song.upc && (
                <DetailRow
                  icon={Music}
                  label="UPC"
                  value={song.upc}
                  copyable
                  onCopy={() => handleCopy(song.upc || '', 'UPC')}
                />
              )}
              {song.productCode && (
                <DetailRow
                  icon={Music}
                  label="Product Code"
                  value={song.productCode}
                  copyable
                  onCopy={() => handleCopy(song.productCode || '', 'Product Code')}
                />
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Statistic
                icon={ListMusic}
                label="Tracks"
                value={song.numberOfTracks?.toString() || '0'}
              />
              <Statistic
                icon={Music}
                label="Duration"
                value={formatDuration(song.duration)}
              />
              <Statistic label="Plays" value={song.plays?.toString() || '0'} />
            </CardContent>
          </Card>

          {/* Tracks */}
          {tracks.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Tracks ({tracks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tracks.map((track, idx) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent/50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {idx + 1}. {track.title}
                        </p>
                        {track.isrc && (
                          <p className="text-xs text-muted-foreground truncate">
                            ISRC: {track.isrc}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {track.duration && (
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(track.duration)}
                          </span>
                        )}
                        {track.explicit === 'yes' && (
                          <Badge variant="outline" className="text-xs">
                            Explicit
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Detail row component for displaying song metadata
 */
function DetailRow({
  icon: Icon,
  label,
  value,
  copyable = false,
  onCopy,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  copyable?: boolean;
  onCopy?: () => void;
}) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium truncate">{value}</p>
        </div>
      </div>
      {copyable && onCopy && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={onCopy}
        >
          <Copy className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

/**
 * Statistic component for displaying stats
 */
function Statistic({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg border text-center">
      {Icon && <Icon className="w-5 h-5 text-primary mb-1" />}
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

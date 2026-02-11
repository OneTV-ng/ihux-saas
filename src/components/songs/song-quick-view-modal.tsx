import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Music } from "lucide-react";

interface SongQuickViewModalProps {
  open: boolean;
  onClose: () => void;
  song: {
    id: string;
    title: string;
    artistDisplayName: string;
    genre?: string;
    cover?: string;
    numberOfTracks?: number;
  } | null;
}

export function SongQuickViewModal({ open, onClose, song }: SongQuickViewModalProps) {
  if (!song) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{song.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {song.cover ? (
            <img src={song.cover} alt={song.title} className="w-40 h-40 object-cover rounded" />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center bg-muted rounded">
              <Music className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div className="text-center">
            <p className="font-semibold">{song.artistDisplayName}</p>
            {song.genre && <p className="text-muted-foreground text-sm">{song.genre}</p>}
            {song.numberOfTracks && song.numberOfTracks > 1 && (
              <p className="text-muted-foreground text-xs mt-1">{song.numberOfTracks} tracks</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { createContext, useContext, useState, useRef, useCallback } from "react";

// Types for a single track or an array of tracks
export type PlayerTrack = {
  mp3: string;
  cover?: string;
  title: string;
  artist: string;
  [key: string]: any;
};

export type PlayerInput = PlayerTrack | PlayerTrack[];

interface PlayerContextType {
  queue: PlayerTrack[];
  current: PlayerTrack | null;
  currentIndex: number;
  isPlaying: boolean;
  play: (trackOrTracks: PlayerInput, startIndex?: number) => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  setQueue: (tracks: PlayerTrack[]) => void;
  setCurrentIndex: (idx: number) => void;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((trackOrTracks: PlayerInput, startIndex = 0) => {
    const tracks = Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks];
    setQueue(tracks);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    audioRef.current?.pause();
  }, []);

  const next = useCallback(() => {
    setCurrentIndex(idx => {
      if (queue.length === 0) return 0;
      const nextIdx = (idx + 1) % queue.length;
      setIsPlaying(true);
      return nextIdx;
    });
  }, [queue.length]);

  const prev = useCallback(() => {
    setCurrentIndex(idx => {
      if (queue.length === 0) return 0;
      const prevIdx = (idx - 1 + queue.length) % queue.length;
      setIsPlaying(true);
      return prevIdx;
    });
  }, [queue.length]);

  const value: PlayerContextType = {
    queue,
    current: queue[currentIndex] || null,
    currentIndex,
    isPlaying,
    play,
    pause,
    next,
    prev,
    setQueue,
    setCurrentIndex,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Persistent audio element (hidden) */}
      <audio
        ref={audioRef}
        src={queue[currentIndex]?.mp3}
        autoPlay={isPlaying}
        onEnded={next}
        style={{ display: "none" }}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}

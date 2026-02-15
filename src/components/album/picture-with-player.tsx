"use client";

import React, { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface PictureWithPlayerProps {
  /**
   * Album/Song cover image URL
   */
  imageUrl: string;

  /**
   * Album/Song title
   */
  title: string;

  /**
   * Artist name
   */
  artist: string;

  /**
   * Audio URL for the mp3 file
   */
  audioUrl?: string;

  /**
   * Called when play is clicked
   */
  onPlay?: () => void;

  /**
   * Called when pause is clicked
   */
  onPause?: () => void;

  /**
   * Current playback state
   */
  isPlaying?: boolean;

  /**
   * Current playback time in seconds
   */
  currentTime?: number;

  /**
   * Total duration in seconds
   */
  duration?: number;

  /**
   * Handle previous track
   */
  onPrevious?: () => void;

  /**
   * Handle next track
   */
  onNext?: () => void;

  /**
   * Show/hide player overlay
   */
  showPlayer?: boolean;

  /**
   * Container size (small, medium, large)
   */
  size?: "small" | "medium" | "large";

  /**
   * Click handler for the image
   */
  onClick?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function PictureWithPlayer({
  imageUrl,
  title,
  artist,
  audioUrl,
  onPlay,
  onPause,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  onPrevious,
  onNext,
  showPlayer = true,
  size = "medium",
  onClick,
  className,
}: PictureWithPlayerProps) {
  const [hovered, setHovered] = useState(false);

  const sizeClasses = {
    small: "w-32 h-32",
    medium: "w-64 h-64",
    large: "w-full aspect-square",
  };

  const playerPositions = {
    small: "h-20",
    medium: "h-24",
    large: "h-32",
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden group shadow-lg",
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Clickable Content */}
      {onClick && (
        <div
          className="absolute inset-0 cursor-pointer transition-all duration-300 group-hover:bg-black/40"
          onClick={onClick}
        />
      )}

      {/* Play Icon Overlay (when hovering and not showing player) */}
      {!showPlayer && audioUrl && hovered && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              isPlaying ? onPause?.() : onPlay?.();
            }}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-white/90 hover:bg-white text-zinc-900 transition-all duration-200 shadow-lg"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current ml-0.5" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-0.5" />
            )}
          </button>
        </div>
      )}

      {/* Player Overlay */}
      {showPlayer && audioUrl && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm transition-all duration-300",
            playerPositions[size],
            "flex flex-col justify-end p-3"
          )}
        >
          {/* Song Info */}
          <div className="mb-3 min-w-0">
            <p className="text-white font-semibold text-sm truncate leading-tight">
              {title}
            </p>
            <p className="text-white/70 text-xs truncate">{artist}</p>
          </div>

          {/* Progress Bar */}
          {duration > 0 && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-white/60 text-xs whitespace-nowrap">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-white/60 text-xs whitespace-nowrap">
                {formatTime(duration)}
              </span>
            </div>
          )}

          {/* Player Controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevious?.();
                }}
                disabled={!onPrevious}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play/Pause Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isPlaying ? onPause?.() : onPlay?.();
                }}
                className="p-2 rounded-lg bg-green-500 hover:bg-green-400 text-white transition-all shadow-lg"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current ml-0.5" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext?.();
                }}
                disabled={!onNext}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {audioUrl && !isPlaying && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay?.();
                  }}
                  className="text-white/80 hover:text-white transition-all text-xs font-medium"
                >
                  Play
                </button>
              )}

              {/* Volume Control (placeholder) */}
              <button
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/60 hover:text-white transition-all"
                aria-label="Volume"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Image Placeholder */}
      {!imageUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
          <Music className="w-16 h-16 text-zinc-600" />
        </div>
      )}
    </div>
  );
}

/**
 * Mobile-optimized version
 */
export function PictureWithPlayerMobile({
  imageUrl,
  title,
  artist,
  audioUrl,
  onPlay,
  onPause,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  onPrevious,
  onNext,
}: Omit<PictureWithPlayerProps, "size" | "showPlayer">) {
  return (
    <PictureWithPlayer
      imageUrl={imageUrl}
      title={title}
      artist={artist}
      audioUrl={audioUrl}
      onPlay={onPlay}
      onPause={onPause}
      isPlaying={isPlaying}
      currentTime={currentTime}
      duration={duration}
      onPrevious={onPrevious}
      onNext={onNext}
      showPlayer={true}
      size="large"
    />
  );
}

/**
 * Compact version for sidebars and lists
 */
export function PictureWithPlayerCompact({
  imageUrl,
  title,
  artist,
  audioUrl,
  onPlay,
  onPause,
  isPlaying = false,
  onClick,
  className,
}: Omit<
  PictureWithPlayerProps,
  "size" | "showPlayer" | "currentTime" | "duration" | "onPrevious" | "onNext"
>) {
  return (
    <PictureWithPlayer
      imageUrl={imageUrl}
      title={title}
      artist={artist}
      audioUrl={audioUrl}
      onPlay={onPlay}
      onPause={onPause}
      isPlaying={isPlaying}
      showPlayer={false}
      size="small"
      onClick={onClick}
      className={className}
    />
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { PictureWithPlayer } from "./picture-with-player";

interface UploadPreviewProps {
  /**
   * Album cover image URL
   */
  coverUrl: string;

  /**
   * Song/album title
   */
  title: string;

  /**
   * Artist name
   */
  artist: string;

  /**
   * Audio file URL
   */
  audioUrl: string;

  /**
   * Optional: Size of the preview
   */
  size?: "small" | "medium" | "large";

  /**
   * Optional: Custom class name
   */
  className?: string;
}

/**
 * Upload Preview Component
 * Shows the uploaded files (cover + audio) in a preview with player
 * Used during song upload to let users preview before submission
 */
export function UploadPreview({
  coverUrl,
  title,
  artist,
  audioUrl,
  size = "medium",
  className,
}: UploadPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(audioUrl);

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", () => {});
      audio.removeEventListener("timeupdate", () => {});
      audio.removeEventListener("ended", () => {});
    };
  }, [audioUrl]);

  const handlePlay = () => {
    if (audioElement) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className={className}>
      <PictureWithPlayer
        imageUrl={coverUrl}
        title={title}
        artist={artist}
        audioUrl={audioUrl}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlay={handlePlay}
        onPause={handlePause}
        showPlayer={true}
        size={size}
      />
    </div>
  );
}

/**
 * Simple Preview Component (Just Image)
 * For displaying cover without player
 */
export function UploadPreviewImage({
  coverUrl,
  title,
  artist,
  size = "medium",
  className,
}: Omit<UploadPreviewProps, "audioUrl">) {
  return (
    <div
      className={`relative ${
        size === "small"
          ? "w-32 h-32"
          : size === "medium"
            ? "w-64 h-64"
            : "w-full aspect-square"
      } rounded-2xl overflow-hidden shadow-lg ${className}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${coverUrl})` }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        <p className="text-white font-semibold text-sm truncate">{title}</p>
        <p className="text-white/70 text-xs truncate">{artist}</p>
      </div>
    </div>
  );
}

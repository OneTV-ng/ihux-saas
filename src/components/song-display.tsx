"use client";

import { useEffect, useState, useRef } from "react";
import { Music2, Play, Pause, Volume2, Clock } from "lucide-react";

interface Track {
  id: string;
  songId: string;
  trackNumber: number;
  title: string;
  isrc?: string;
  mp3: string;
  explicit?: string;
  lyrics?: string;
  leadVocal?: string;
  featured?: string;
  producer?: string;
  writer?: string;
  duration?: number;
  createdAt: Date;
}

interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  type: string;
  genre?: string;
  language?: string;
  upc?: string;
  cover?: string;
  numberOfTracks: number;
  status: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SongDisplayProps {
  songId: string;
  playbackMode?: "direct" | "context"; // Default: 'context'
}

interface PlayerContextType {
  queue: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  addToQueue: (tracks: Track[]) => void;
  play: (track: Track) => void;
}

const SongDisplay: React.FC<SongDisplayProps> = ({ songId, playbackMode = "context" }) => {
  const [song, setSong] = useState<Song | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load song data
  useEffect(() => {
    const loadSong = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/songs/${songId}`);

        if (!response.ok) {
          throw new Error("Failed to load song");
        }

        const data = await response.json();
        setSong(data.song);
        setTracks(data.tracks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load song");
      } finally {
        setLoading(false);
      }
    };

    loadSong();
  }, [songId]);

  const handlePlayTrack = (trackIndex: number) => {
    if (playbackMode === "direct") {
      setCurrentTrackIndex(trackIndex);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch((err) => console.error("Play error:", err));
      }
    } else {
      // Context mode - send to player context
      // For now, just log
      console.log("Send to context player:", tracks[trackIndex]);
    }
  };

  const handlePlayAll = () => {
    if (playbackMode === "direct") {
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch((err) => console.error("Play error:", err));
      }
    } else {
      // Context mode
      console.log("Add all tracks to context player queue:", tracks);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleTrackEnded = () => {
    // Play next track
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <Music2 className="w-8 h-8 text-blue-500" />
        </div>
        <span className="ml-2 text-gray-600">Loading song...</span>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-semibold">Error loading song</p>
        <p className="text-red-500 text-sm mt-1">{error || "Song not found"}</p>
      </div>
    );
  }

  const currentTrack = tracks[currentTrackIndex];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Song Header */}
      <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
        <div className="flex gap-6">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            {song.cover ? (
              <img
                src={song.cover}
                alt={song.title}
                className="w-32 h-32 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-blue-400 rounded-lg flex items-center justify-center">
                <Music2 className="w-16 h-16 text-blue-200" />
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="flex-1 flex flex-col justify-end">
            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            <p className="text-blue-100 text-lg mb-3">{song.artistName}</p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded">
                {song.type.charAt(0).toUpperCase() + song.type.slice(1)}
              </div>
              {song.genre && <div className="bg-white bg-opacity-20 px-3 py-1 rounded">{song.genre}</div>}
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded">{song.numberOfTracks} tracks</div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(song.duration)}
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded capitalize">{song.status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Controls */}
      {playbackMode === "direct" && currentTrack && (
        <div className="bg-gray-50 border-b p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => (isPlaying ? handlePause() : handlePlayTrack(currentTrackIndex))}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <div className="flex-1">
              <div className="text-sm font-semibold">{currentTrack.title}</div>
              <div className="text-xs text-gray-600">
                Track {currentTrack.trackNumber} of {tracks.length}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {formatDuration(currentTrack.duration)}
            </div>
          </div>

          <audio
            ref={audioRef}
            src={currentTrack.mp3}
            onEnded={handleTrackEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* Track List */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Tracks ({tracks.length})</h2>
          <button
            onClick={handlePlayAll}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Play className="w-4 h-4" />
            {playbackMode === "direct" ? "Play All" : "Queue All"}
          </button>
        </div>

        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`p-4 rounded-lg border transition ${
                playbackMode === "direct" && index === currentTrackIndex
                  ? "bg-blue-50 border-blue-300"
                  : "hover:bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Track Number & Play Button */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-semibold w-6 text-center">
                    {track.trackNumber}
                  </span>
                  <button
                    onClick={() => handlePlayTrack(index)}
                    className="text-blue-500 hover:text-blue-600 p-1 hover:bg-gray-200 rounded transition"
                  >
                    {playbackMode === "direct" && index === currentTrackIndex && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Track Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{track.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {track.leadVocal && <div>Vocal: {track.leadVocal}</div>}
                    {track.producer && <div>Producer: {track.producer}</div>}
                    {track.explicit === "yes" && (
                      <div className="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">
                        Explicit
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(track.duration)}
                </div>

                {/* ISRC */}
                {track.isrc && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {track.isrc}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {(track.featured || track.writer) && (
                <div className="mt-2 ml-12 text-xs text-gray-500 space-x-3">
                  {track.featured && <span>Feat. {track.featured}</span>}
                  {track.writer && <span>Writer: {track.writer}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Song Details Footer */}
      <div className="bg-gray-50 border-t p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {song.language && (
            <div>
              <div className="text-xs text-gray-600 font-semibold">Language</div>
              <div className="text-sm text-gray-900">{song.language}</div>
            </div>
          )}
          {song.upc && (
            <div>
              <div className="text-xs text-gray-600 font-semibold">UPC</div>
              <div className="text-sm text-gray-900">{song.upc}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-600 font-semibold">Added</div>
            <div className="text-sm text-gray-900">
              {new Date(song.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongDisplay;

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Upload,
  Music,
  Plus,
  Trash2,
  Play,
  Pause,
  Clock,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { FileUploadService } from "@/lib/file-upload-service";
import SongDisplay from "@/components/song-display";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

interface UploadStep {
  step: "cover" | "typeSelect" | "metadata" | "tracks" | "submit" | "complete";
  label: string;
}

interface TrackUpload {
  id: string;
  title: string;
  uploadId: string;
  url?: string;
  duration?: number;
  explicit: "no" | "yes" | "covered";
  isrc?: string;
  leadVocal?: string;
  featured?: string;
  producer?: string;
  writer?: string;
  lyrics?: string;
  progress?: number;
  error?: string;
}

interface SongMetadata {
  title: string;
  type: "single" | "album" | "medley";
  artistId: string;
  artistName: string;
  genre?: string;
  language?: string;
  upc?: string;
  copyrightAcknowledged: boolean;
  releaseDate?: string;
  producer?: string;
  writer?: string;
  recordLabel?: string;
  featured?: string;
}

const SONG_TYPES = ["single", "album", "medley"] as const;
const GENRES = ["Pop", "Rock", "Hip-Hop", "R&B", "Jazz", "Classical", "Country", "Electronic", "Other"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Other"];

const STEPS: UploadStep[] = [
  { step: "cover", label: "Upload Cover" },
  { step: "typeSelect", label: "Select Type" },
  { step: "metadata", label: "Song Info" },
  { step: "tracks", label: "Add Tracks" },
  { step: "submit", label: "Submit" },
  { step: "complete", label: "Complete" },
];

interface IncrementalMusicUploadProps {
  typeParam: "single" | "album" | "medley";
}

const IncrementalMusicUpload = ({ typeParam }: IncrementalMusicUploadProps) => {
  const router = useRouter();
  const { user, defaultArtist, isLoading: authLoading } = useAuth();

  // State
  const [currentStep, setCurrentStep] = useState<"cover" | "typeSelect" | "metadata" | "tracks" | "submit" | "complete">(
    "cover"
  );
  const [copyrightAcknowledgedAtType, setCopyrightAcknowledgedAtType] = useState(false);
  const [copyrightAcknowledgedAtSubmit, setCopyrightAcknowledgedAtSubmit] = useState(false);
  const [metadata, setMetadata] = useState<SongMetadata>({
    title: "",
    type: typeParam,
    artistId: defaultArtist?.id || "",
    artistName: defaultArtist?.name || user?.email || "",
    genre: (defaultArtist as any)?.genre || "",
    language: "English",
    copyrightAcknowledged: false,
    releaseDate: new Date().toISOString().slice(0, 10),
    producer: (defaultArtist as any)?.producer || "",
    writer: (defaultArtist as any)?.writer || "",
    recordLabel: (defaultArtist as any)?.recordLabel || "",
    featured: (defaultArtist as any)?.featured || "",
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [coverUploadId, setCoverUploadId] = useState<string>("");

  const [tracks, setTracks] = useState<TrackUpload[]>([]);
  const [trackInput, setTrackInput] = useState({
    title: "",
    explicit: "no" as const,
    isrc: "",
    leadVocal: "",
    featured: "",
    producer: "",
    writer: "",
    lyrics: "",
  });
  const [uploadingTrack, setUploadingTrack] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [selectedTrackFile, setSelectedTrackFile] = useState<File | null>(null);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);

  const [songId, setSongId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadService] = useState(() => new FileUploadService());

  // Auth check
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/signin");
      return;
    }
    if (!defaultArtist) {
      router.push("/desk/artist");
      return;
    }
    // Set artist info and prefill fields from artist
    const artist = defaultArtist as any;
    setMetadata((prev) => ({
      ...prev,
      artistId: defaultArtist.id,
      artistName: defaultArtist.name || user.email,
      genre: artist.genre || prev.genre,
      producer: artist.producer || prev.producer,
      writer: artist.writer || prev.writer,
      recordLabel: artist.recordLabel || prev.recordLabel,
      featured: artist.featured || prev.featured,
    }));
  }, [user, defaultArtist, authLoading, router]);

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ====== METADATA STEP ======
  const handleMetadataSubmit = () => {
    if (!metadata.title || !metadata.type) {
      setError("Please fill in all required fields");
      return;
    }

    if (!metadata.copyrightAcknowledged) {
      setError("Please acknowledge that you own or have the rights to this music");
      return;
    }

    setError(null);
    setCurrentStep("tracks");
  };

  // ====== CREATE SONG BEFORE ADDING TRACKS ======
  const handleCreateSong = async () => {
    try {
      setError(null);
      setSongId("");

      const res = await fetch("/api/songs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: metadata.title,
          type: metadata.type,
          artistId: metadata.artistId,
          artistName: metadata.artistName,
          genre: metadata.genre || undefined,
          language: metadata.language || "English",
          upc: metadata.upc || undefined,
          cover: coverUploadId || undefined,
          copyrightAcknowledged: metadata.copyrightAcknowledged,
          releaseDate: metadata.releaseDate,
          producer: metadata.producer,
          writer: metadata.writer,
          recordLabel: metadata.recordLabel,
          featured: metadata.featured,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create song");
      }

      const data = await res.json();
      setSongId(data.songId);
      return data.songId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create song");
      throw err;
    }
  };

  // ====== COVER STEP ======
  const handleCoverUpload = async (file: File) => {
    try {
      setError(null);
      setUploadingCover(true);
      setCoverProgress(0);
      const result = await uploadService.uploadFileWithProgress(
        file,
        "cover",
        (percent) => {
          setCoverProgress(percent);
        }
      );

      setCoverUploadId(result.id);
      setCoverUrl(result.url);
      setCoverFile(file);

      // Extract filename without extension as default title
      const filename = file.name.replace(/\.[^/.]+$/, "");
      setMetadata((prev) => ({
        ...prev,
        title: filename,
      }));

      // Move to type selection
      setCurrentStep("typeSelect");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload cover");
    } finally {
      setUploadingCover(false);
      setCoverProgress(0);
    }
  };

  // ====== TRACKS STEP ======
  const handleAddTrack = async () => {
    if (!trackInput.title || !selectedTrackFile) {
      setError("Please provide track title and audio file");
      return;
    }

    setError(null);
    setUploadingTrack(true);
    setTrackProgress(0);

    try {
      // Create song if not already created
      let finalSongId = songId;
      if (!finalSongId) {
        finalSongId = await handleCreateSong();
      }

      // Upload audio file
      const uploadResult = await uploadService.uploadFileWithProgress(
        selectedTrackFile,
        "audio",
        (percent) => {
          setTrackProgress(percent);
        }
      );

      // Add track to song
      const res = await fetch(`/api/songs/${finalSongId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trackInput.title,
          audioFileUploadId: uploadResult.id,
          duration: uploadResult.metadata?.duration,
          explicit: trackInput.explicit || "no",
          isrc: trackInput.isrc || undefined,
          lyrics: trackInput.lyrics || undefined,
          leadVocal: trackInput.leadVocal || undefined,
          featured: trackInput.featured || undefined,
          producer: trackInput.producer || undefined,
          writer: trackInput.writer || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add track");
      }

      const data = await res.json();

      // Add to tracks list
      setTracks((prev) => [
        ...prev,
        {
          id: data.track.id,
          title: data.track.title,
          uploadId: uploadResult.id,
          url: uploadResult.url,
          duration: data.track.duration,
          explicit: data.track.explicit,
          isrc: data.track.isrc,
          leadVocal: data.track.leadVocal,
          featured: data.track.featured,
          producer: data.track.producer,
          writer: data.track.writer,
          lyrics: data.track.lyrics,
        },
      ]);

      // Reset form
      setTrackInput({
        title: "",
        explicit: "no",
        isrc: "",
        leadVocal: "",
        featured: "",
        producer: "",
        writer: "",
        lyrics: "",
      });
      setSelectedTrackFile(null);
      setTrackProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add track");
    } finally {
      setUploadingTrack(false);
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // ====== SUBMIT STEP ======
  const handleSubmitSong = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/songs/${songId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit song");
      }

      setCurrentStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit song");
    } finally {
      setSubmitting(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case "typeSelect":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select Release Type</CardTitle>
              <CardDescription>What type of release are you uploading?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cover preview */}
              {coverUrl && (
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <img src={coverUrl} alt="Cover preview" className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Default Title: {metadata.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{coverFile?.name}</p>
                  </div>
                </div>
              )}

              {/* Type selection buttons */}
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant={metadata.type === "single" ? "default" : "outline"}
                  onClick={() => setMetadata({ ...metadata, type: "single" })}
                  className="h-auto py-4 text-left"
                >
                  <div>
                    <p className="font-semibold">Single</p>
                    <p className="text-sm opacity-75">One track release</p>
                  </div>
                </Button>
                <Button
                  variant={metadata.type === "medley" ? "default" : "outline"}
                  onClick={() => setMetadata({ ...metadata, type: "medley" })}
                  className="h-auto py-4 text-left"
                >
                  <div>
                    <p className="font-semibold">Medley</p>
                    <p className="text-sm opacity-75">2-4 tracks merged into one release</p>
                  </div>
                </Button>
                <Button
                  variant={metadata.type === "album" ? "default" : "outline"}
                  onClick={() => setMetadata({ ...metadata, type: "album" })}
                  className="h-auto py-4 text-left"
                >
                  <div>
                    <p className="font-semibold">Album / EP</p>
                    <p className="text-sm opacity-75">5 or more tracks</p>
                  </div>
                </Button>
              </div>

              {/* Copyright acknowledgement */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-amber-900">⚠️ Copyright Notice</p>
                <p className="text-sm text-amber-900">
                  By proceeding, you confirm that you own or have the rights to distribute this music.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="copyright-type"
                    checked={copyrightAcknowledgedAtType}
                    onChange={(e) => setCopyrightAcknowledgedAtType(e.target.checked)}
                  />
                  <label htmlFor="copyright-type" className="text-sm text-amber-900">
                    I acknowledge the copyright notice
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("cover")}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  onClick={() => {
                    if (!copyrightAcknowledgedAtType) {
                      setError("Please acknowledge the copyright notice");
                      return;
                    }
                    setError(null);
                    setCurrentStep("metadata");
                  }}
                  className="flex-1"
                >
                  Continue →
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "metadata":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Song Details</CardTitle>
              <CardDescription>Tell us about your song</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show cover preview if uploaded */}
              {coverUrl && (
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <img src={coverUrl} alt="Cover preview" className="w-24 h-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cover Preview</p>
                    <p className="text-xs text-gray-600 mt-1">{coverFile?.name}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep("cover")}
                      className="mt-2"
                    >
                      Change Cover
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Song / Album Title *</label>
                <input
                  type="text"
                  placeholder="Enter song or album title"
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    value={metadata.type}
                    onChange={(e) => setMetadata({ ...metadata, type: e.target.value as any })}
                  >
                    {SONG_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Genre</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    value={metadata.genre}
                    onChange={(e) => setMetadata({ ...metadata, genre: e.target.value })}
                  >
                    <option value="">Select genre...</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Record Label</label>
                  <input
                    type="text"
                    placeholder="Record Label"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    value={metadata.recordLabel}
                    onChange={(e) => setMetadata({ ...metadata, recordLabel: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Producer</label>
                  <input
                    type="text"
                    placeholder="Producer"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    value={metadata.producer}
                    onChange={(e) => setMetadata({ ...metadata, producer: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Writer</label>
                  <input
                    type="text"
                    placeholder="Writer"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    value={metadata.writer}
                    onChange={(e) => setMetadata({ ...metadata, writer: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Featured</label>
                <input
                  type="text"
                  placeholder="Featured artists (optional)"
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  value={metadata.featured}

                  onChange={(e) => setMetadata({ ...metadata, featured: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    value={metadata.language}
                    onChange={(e) => setMetadata({ ...metadata, language: e.target.value })}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">UPC</label>
                  <input
                    type="text"
                    placeholder="Optional UPC code"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    value={metadata.upc}
                    onChange={(e) => setMetadata({ ...metadata, upc: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="copyright"
                  checked={metadata.copyrightAcknowledged}
                  onChange={(e) => setMetadata({ ...metadata, copyrightAcknowledged: e.target.checked })}
                />
                <label htmlFor="copyright" className="text-sm">
                  I acknowledge that I own or have the rights to this music *
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("typeSelect")}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button onClick={handleMetadataSubmit} className="flex-1">
                  Create Song & Add Tracks →
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "cover":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
              <CardDescription>Upload your song cover (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coverUrl ? (
                <div className="flex gap-4">
                  <img src={coverUrl} alt="Cover" className="w-32 h-32 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{coverFile?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((coverFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCoverUrl("");
                        setCoverFile(null);
                        setCoverUploadId("");
                      }}
                      className="mt-2"
                    >
                      Change Cover
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleCoverUpload(e.target.files[0])}
                      disabled={uploadingCover}
                      className="hidden"
                      id="cover-input"
                    />
                    <label htmlFor="cover-input" className={`cursor-pointer ${uploadingCover ? 'opacity-50' : ''}`}>
                      {uploadingCover ? (
                        <>
                          <Loader className="w-8 h-8 mx-auto text-blue-500 mb-2 animate-spin" />
                          <p className="text-sm font-medium">Uploading cover...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm font-medium">Click to upload cover image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </>
                      )}
                    </label>
                  </div>

                  {coverProgress > 0 && coverProgress < 100 && (
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Uploading Cover</span>
                        <span className="text-sm font-semibold text-blue-600">{coverProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${coverProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/desk")}
                  className="flex-1"
                >
                  ✕ Cancel
                </Button>
                <Button onClick={() => setCurrentStep("typeSelect")} className="flex-1">
                  Next: Select Type →
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "tracks":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Add Tracks</CardTitle>
              <CardDescription>
                Add tracks to your song (required: {metadata.type === "single" ? "1 track" : metadata.type === "medley" ? "2-4 tracks" : "5+ tracks"})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Track list */}
              {tracks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tracks ({tracks.length})</p>
                  {tracks.map((track, idx) => (
                    <div key={track.id} className="p-3 border rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {idx + 1}. {track.title}
                        </p>
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          {track.duration && (
                            <p>Duration: {formatDuration(track.duration)}</p>
                          )}
                          {track.leadVocal && <p>Vocal: {track.leadVocal}</p>}
                          {track.producer && <p>Producer: {track.producer}</p>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTrack(track.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add track form */}
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium">Add New Track</p>

                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <input
                    type="text"
                    placeholder="Track title"
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    value={trackInput.title}
                    onChange={(e) => setTrackInput({ ...trackInput, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Audio File *</label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 mt-1">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          const file = e.target.files[0];
                          setSelectedTrackFile(file);
                          // Auto-populate title from filename if not already set
                          if (!trackInput.title) {
                            const filename = file.name.replace(/\.[^/.]+$/, "");
                            setTrackInput((prev) => ({ ...prev, title: filename }));
                          }
                        }
                      }}
                      className="hidden"
                      id="track-input"
                    />
                    <label htmlFor="track-input" className="cursor-pointer">
                      <Music className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-medium">{selectedTrackFile?.name || "Click to upload audio"}</p>
                      <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC</p>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Explicit</label>
                    <select
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                      value={trackInput.explicit}
                      onChange={(e) => setTrackInput({ ...trackInput, explicit: e.target.value as any })}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                      <option value="covered">Covered</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">ISRC</label>
                    <input
                      type="text"
                      placeholder="Optional ISRC code"
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                      value={trackInput.isrc}
                      onChange={(e) => setTrackInput({ ...trackInput, isrc: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Lead Vocal (optional)"
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={trackInput.leadVocal}
                    onChange={(e) => setTrackInput({ ...trackInput, leadVocal: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Featured (optional)"
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={trackInput.featured}
                    onChange={(e) => setTrackInput({ ...trackInput, featured: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Producer (optional)"
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={trackInput.producer}
                    onChange={(e) => setTrackInput({ ...trackInput, producer: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Writer (optional)"
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={trackInput.writer}
                    onChange={(e) => setTrackInput({ ...trackInput, writer: e.target.value })}
                  />
                </div>

                <textarea
                  placeholder="Lyrics (optional)"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={3}
                  value={trackInput.lyrics}
                  onChange={(e) => setTrackInput({ ...trackInput, lyrics: e.target.value })}
                />

                {trackProgress > 0 && trackProgress < 100 && (
                  <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-sm font-medium text-blue-900">Uploading Track...</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{trackProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${trackProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleAddTrack}
                  disabled={uploadingTrack}
                  className="w-full"
                >
                  {uploadingTrack ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Track
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("cover")}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  onClick={() => setCurrentStep("submit")}
                  disabled={tracks.length === 0}
                  className="flex-1"
                >
                  Next: Review →
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "submit":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Song for Publishing</CardTitle>
              <CardDescription>Final confirmation before submission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  Your song will be reviewed by our team. You'll be notified once it's approved or if any changes are needed.
                </p>
              </div>

              {/* Copyright warning - second time */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-amber-900">⚠️ Copyright Notice</p>
                <p className="text-sm text-amber-900">
                  You confirm that you own or have the necessary rights to distribute this music.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="copyright-submit"
                    checked={copyrightAcknowledgedAtSubmit}
                    onChange={(e) => setCopyrightAcknowledgedAtSubmit(e.target.checked)}
                  />
                  <label htmlFor="copyright-submit" className="text-sm text-amber-900">
                    I confirm copyright ownership and have the right to distribute
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("submit")}
                  className="flex-1"
                  disabled={submitting}
                >
                  ← Back
                </Button>
                <Button
                  onClick={() => {
                    if (!copyrightAcknowledgedAtSubmit) {
                      setError("Please confirm copyright ownership");
                      return;
                    }
                    handleSubmitSong();
                  }}
                  disabled={submitting || !copyrightAcknowledgedAtSubmit}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Song for Review"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "complete":
        return (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-2xl font-bold">Song Submitted!</h3>
                <p className="text-gray-600">Your song has been submitted for admin review</p>

                {songId && (
                  <div className="bg-white p-4 rounded-lg text-left text-sm space-y-2">
                    <p>
                      <strong>Song ID:</strong>{" "}
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{songId}</code>
                    </p>
                    <p>
                      <strong>Tracks:</strong> {tracks.length}
                    </p>
                  </div>
                )}

                <Button onClick={() => router.push("/desk")} className="w-full">
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SidebarProvider>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            <div className="flex-1 overflow-auto">
              <div className="p-6 max-w-2xl mx-auto">
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between mb-3">
                    {STEPS.map((s, idx) => (
                      <div
                        key={s.step}
                        className={`flex flex-col items-center text-xs ${
                          STEPS.findIndex((st) => st.step === currentStep) >= idx
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                            STEPS.findIndex((st) => st.step === currentStep) >= idx
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="hidden sm:inline">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full bg-gray-200 h-1 rounded-full">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all"
                      style={{
                        width: `${((STEPS.findIndex((st) => st.step === currentStep) + 1) / STEPS.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                {renderStep()}
              </div>
            </div>
            <MobileBottomNav />
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const typeParam = (searchParams.get("type") || "single") as "single" | "album" | "medley";
  return <IncrementalMusicUpload typeParam={typeParam} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader className="w-8 h-8 animate-spin" /></div>}>
      <SearchParamsHandler />
    </Suspense>
  );
}

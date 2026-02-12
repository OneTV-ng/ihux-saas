"use client";

import React, { useState, useEffect } from "react";
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
  step: "metadata" | "cover" | "tracks" | "review" | "submit" | "complete";
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
}

const SONG_TYPES = ["single", "album", "medley"] as const;
const GENRES = ["Pop", "Rock", "Hip-Hop", "R&B", "Jazz", "Classical", "Country", "Electronic", "Other"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Other"];

const STEPS: UploadStep[] = [
  { step: "metadata", label: "Song Details" },
  { step: "cover", label: "Cover Image" },
  { step: "tracks", label: "Add Tracks" },
  { step: "review", label: "Review" },
  { step: "submit", label: "Submit" },
  { step: "complete", label: "Complete" },
];

const IncrementalMusicUpload = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, defaultArtist, isLoading: authLoading } = useAuth();

  // Get type from query parameter (from selector page)
  const typeParam = (searchParams.get("type") || "single") as "single" | "album" | "medley";

  // State
  const [currentStep, setCurrentStep] = useState<"metadata" | "cover" | "tracks" | "review" | "submit" | "complete">(
    "metadata"
  );
  const [metadata, setMetadata] = useState<SongMetadata>({
    title: "",
    type: typeParam,
    artistId: "",
    artistName: "",
    genre: "",
    language: "English",
    copyrightAcknowledged: false,
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
    // Set artist info
    setMetadata((prev) => ({
      ...prev,
      artistId: defaultArtist.id,
      artistName: defaultArtist.name || user.email,
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
  const handleMetadataSubmit = async () => {
    if (!metadata.title || !metadata.type) {
      setError("Please fill in all required fields");
      return;
    }

    setError(null);
    setSongId("");

    try {
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
          copyrightAcknowledged: metadata.copyrightAcknowledged,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create song");
      }

      const data = await res.json();
      setSongId(data.songId);
      setCurrentStep("cover");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create song");
    }
  };

  // ====== COVER STEP ======
  const handleCoverUpload = async (file: File) => {
    try {
      setError(null);
      const result = await uploadService.uploadFileWithProgress(file, "cover", (percent) => {
        console.log(`Cover upload: ${percent}%`);
      });

      setCoverUploadId(result.id);
      setCoverUrl(result.url);
      setCoverFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload cover");
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
      // Upload audio file
      const uploadResult = await uploadService.uploadFileWithProgress(selectedTrackFile, "audio", (percent) => {
        setTrackProgress(percent);
      });

      // Add track to song
      const res = await fetch(`/api/songs/${songId}/tracks`, {
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
      case "metadata":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Song Details</CardTitle>
              <CardDescription>Tell us about your song</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Song Title *</label>
                <input
                  type="text"
                  placeholder="Enter song title"
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
                  onClick={() => router.push("/desk")}
                  className="flex-1"
                >
                  ✕ Cancel
                </Button>
                <Button onClick={handleMetadataSubmit} className="flex-1">
                  Next: Add Cover Image →
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
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleCoverUpload(e.target.files[0])}
                    className="hidden"
                    id="cover-input"
                  />
                  <label htmlFor="cover-input" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload cover image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </label>
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
                  onClick={() => setCurrentStep("metadata")}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button onClick={() => setCurrentStep("tracks")} className="flex-1">
                  Next: Add Tracks →
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
                      onChange={(e) => e.target.files && setSelectedTrackFile(e.target.files[0])}
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
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Uploading...</span>
                      <span>{trackProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
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
                  onClick={() => setCurrentStep("review")}
                  disabled={tracks.length === 0}
                  className="flex-1"
                >
                  Next: Review →
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "review":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Song</CardTitle>
              <CardDescription>Make sure everything looks correct</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {songId && <SongDisplay songId={songId} playbackMode="direct" />}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("tracks")}
                  className="flex-1"
                >
                  ← Back to Tracks
                </Button>
                <Button onClick={() => setCurrentStep("submit")} className="flex-1">
                  Submit for Review →
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "submit":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Song</CardTitle>
              <CardDescription>Send to admin for review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  Your song will be reviewed by our team. You'll be notified once it's approved or if any changes are needed.
                </p>
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
                  onClick={() => setCurrentStep("review")}
                  className="flex-1"
                  disabled={submitting}
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleSubmitSong}
                  disabled={submitting}
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

export default IncrementalMusicUpload;

"use client";
import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Music, Image, Play, CheckCircle2, ShieldCheck, AlertTriangle, Plus, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { PlayerProvider, usePlayer } from "@/contexts/player-context";
import { ThemeProvider } from "@/components/theme-provider";
import { useRouter } from "next/navigation";

type UploadType = "single" | "medley" | "album" | null;

type Track = {
  id: string;
  title: string;
  isrc: string;
  mp3Url: string;
  duration?: number;
  featured?: string;
  producer?: string;
  writer?: string;
};

type StepProps = {
  number: number;
  title: string;
  active?: boolean;
  completed?: boolean;
};

function Step({ number, title, active = false, completed = false }: StepProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
        completed ? "bg-green-500 text-black shadow-lg shadow-green-500/30" :
        active ? "bg-green-500 text-black shadow-lg shadow-green-500/30" :
        "bg-zinc-800/80 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      }`}>
        {completed ? <CheckCircle2 className="h-5 w-5" /> : number}
      </div>
      <p className={`font-medium tracking-wide ${
        completed ? "text-green-600 dark:text-green-400" :
        active ? "text-zinc-900 dark:text-white" :
        "text-zinc-400 dark:text-zinc-500"
      }`}>{title}</p>
    </div>
  );
}

type TypeSelectorModalProps = {
  isOpen: boolean;
  onSelect: (type: UploadType) => void;
};

function TypeSelectorModal({ isOpen, onSelect }: TypeSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">What are you uploading?</h2>

          <button
            onClick={() => onSelect("single")}
            className="w-full p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200 text-left group"
          >
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">Single</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">One track with one audio file</p>
          </button>

          <button
            onClick={() => onSelect("medley")}
            className="w-full p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200 text-left group"
          >
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">Medley</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Multiple parts of the same song</p>
          </button>

          <button
            onClick={() => onSelect("album")}
            className="w-full p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200 text-left group"
          >
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">Album</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Multiple different tracks</p>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

function SongUploadContent() {
  const [uploadType, setUploadType] = useState<UploadType>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const router = useRouter();
  const { user, defaultArtist, isLoading: authLoading, isAuthenticated, forceRefresh } = useAuth();
  const player = usePlayer();

  // Cover & Song Info
  const [coverUrl, setCoverUrl] = useState("");
  const [coverDetails, setCoverDetails] = useState<any>(null);
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverUploading, setCoverUploading] = useState(false);
  const [rejectionFlag, setRejectionFlag] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);

  // Song Details
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState(defaultArtist?.name || "");
  const [artistId, setArtistId] = useState(defaultArtist?.id || "");
  const [userId, setUserId] = useState(user?.id || "");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("");
  const [recordLabel, setRecordLabel] = useState("");
  const [releaseDate, setReleaseDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Tracks
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Agreement
  const [agreedOwnership, setAgreedOwnership] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      forceRefresh().then(() => {
        if (!isAuthenticated) {
          const current = window.location.pathname + window.location.search;
          router.replace(`/auth/signin?redirect=${encodeURIComponent(current)}`);
        }
      });
    }
  }, [authLoading, isAuthenticated, forceRefresh, router]);

  // Load artist
  useEffect(() => {
    const loadArtist = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/artist?selected=true");
        const data = await res.json();
        if (data.success && data.data) {
          setSelectedArtist(data.data);
          setArtist(data.data.artistName || data.data.displayName);
          setArtistId(data.data.id);
        }
      } catch (error) {
        console.error("Error loading artist:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadArtist();
  }, []);

  // Extract title from cover filename
  const handleCoverUpload = (file: File) => {
    if (!file) return;

    // Extract filename without extension
    const filename = file.name.replace(/\.[^/.]+$/, "");
    setSongTitle(filename);

    setCoverUploading(true);
    setCoverProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "cover");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setCoverProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      setCoverUploading(false);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        setCoverUrl(data.url);
        setCoverDetails(data.imageDetails || null);
        setRejectionFlag(data.rejectionFlag);
        setRejectionReasons(data.rejectionReasons || []);

        // Show type selector after cover is uploaded
        if (!uploadType) setShowTypeSelector(true);
      }
    };
    xhr.onerror = () => setCoverUploading(false);
    xhr.send(formData);
  };

  const handleCoverInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverUpload(file);
  };

  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleCoverUpload(e.dataTransfer.files[0]);
  };

  const addTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      title: uploadType === "single" ? songTitle : `Track ${tracks.length + 1}`,
      isrc: "",
      mp3Url: "",
      duration: 0,
    };
    setTracks([...tracks, newTrack]);
  };

  const updateTrack = (id: string, field: keyof Track, value: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
  };

  const handleTrackAudioUpload = (trackId: string, file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "audio");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      // Could track progress per track if needed
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        updateTrack(trackId, "mp3Url", data.url);
        if (data.duration) updateTrack(trackId, "duration", data.duration);
      }
    };
    xhr.send(formData);
  };

  const requiredFieldsFilled = !!(
    coverUrl &&
    songTitle &&
    artist &&
    artistId &&
    userId &&
    uploadType &&
    tracks.length > 0 &&
    tracks.every(t => t.mp3Url && t.title)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredFieldsFilled) return;

    setSubmitted(false);
    setSubmitError("");

    const songData = {
      type: uploadType,
      title: songTitle,
      artistId,
      userId,
      artist,
      genre,
      language,
      country,
      recordLabel,
      releaseDate,
      cover: coverUrl,
      tracks: tracks.map(t => ({
        title: t.title,
        mp3: t.mp3Url,
        isrc: t.isrc,
        duration: t.duration,
        featured: t.featured,
        producer: t.producer,
        writer: t.writer,
      })),
    };

    try {
      const res = await fetch("/api/song-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(songData),
      });
      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => router.push("/desk/artist"), 2000);
      } else {
        setSubmitError(data.error || "Failed to submit");
      }
    } catch (error: any) {
      setSubmitError(error.message || "Failed to submit");
    }
  };

  const inputClass = "w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-white px-4 py-3 text-sm font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2";

  return (
    <>
      <TypeSelectorModal
        isOpen={showTypeSelector}
        onSelect={(type) => {
          setUploadType(type);
          setShowTypeSelector(false);
          if (type === "single") {
            setTracks([{ id: "1", title: songTitle, isrc: "", mp3Url: "" }]);
          }
        }}
      />

      {selectedArtist && (
        <div className="max-w-4xl mx-auto mb-6 pt-[90px] px-4">
          <Card className="border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/30 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Uploading as</p>
                    <p className="text-base font-bold text-zinc-900 dark:text-white">{selectedArtist.displayName}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold" onClick={() => router.push("/desk/artist")}>
                  Change Artist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 text-zinc-900 dark:from-zinc-950 dark:via-black dark:to-zinc-950 dark:text-white p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Upload <span className="text-green-500 dark:text-green-400">Music</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-base">Create a {uploadType === "album" ? "complete album" : uploadType === "medley" ? "medley" : uploadType === "single" ? "single" : "new music release"}</p>
          </header>

          {/* Progress Steps */}
          {uploadType && (
            <div className="flex gap-6 justify-center mb-12 flex-wrap">
              <Step number={1} title="Cover" completed={!!coverUrl} />
              <div className="hidden sm:flex items-center"><div className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" /></div>
              <Step number={2} title="Details" active={!!coverUrl && !submitted} completed={!!songTitle && uploadType !== null} />
              <div className="hidden sm:flex items-center"><div className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" /></div>
              <Step number={3} title="Tracks" active={!!songTitle} completed={tracks.length > 0 && tracks.every(t => t.mp3Url)} />
              <div className="hidden sm:flex items-center"><div className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" /></div>
              <Step number={4} title="Submit" active={tracks.length > 0} completed={submitted} />
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Step 1: Cover Upload */}
            {!coverUrl && (
              <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Upload Cover Art</h2>
                  <div
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all duration-300 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-green-50 dark:hover:bg-green-950/20 border-zinc-300 dark:border-zinc-700 hover:border-green-500 cursor-pointer"
                    onDrop={handleCoverDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <label htmlFor="cover-upload" className="text-center cursor-pointer group">
                      <Image size={64} className="text-green-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-2xl text-zinc-800 dark:text-white mb-2 block">Album Cover</span>
                      <span className="block text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-4">3000x3000 JPG/PNG, 70-600dpi</span>
                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverInput}
                        className="hidden"
                        disabled={coverUploading}
                      />
                      <div className="w-full mt-4 min-h-[28px] flex items-center justify-center">
                        {coverUploading ? (
                          <div className="w-full flex items-center gap-2">
                            <Progress value={coverProgress} className="flex-1" />
                            <span className="text-xs text-green-600 dark:text-green-400 font-semibold">{coverProgress}%</span>
                          </div>
                        ) : <span className="text-sm text-zinc-500 dark:text-zinc-400">Click or drag your cover here</span>}
                      </div>
                    </label>
                  </div>
                  {rejectionFlag && (
                    <div className="mt-6 text-sm text-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg px-4 py-3">
                      <span className="font-semibold text-red-600 dark:text-red-400 flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4" />Rejection Issues
                      </span>
                      <ul className="list-disc ml-4 text-red-600 dark:text-red-400">
                        {rejectionReasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Song Details */}
            {coverUrl && !submitted && (
              <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-2xl">
                <CardContent className="p-8 space-y-6">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Song Details</h2>

                  <div>
                    <label className={labelClass}>Release Title</label>
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      className={inputClass}
                      placeholder={uploadType === "album" ? "Album name" : "Song title"}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Artist</label>
                      <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        className={inputClass}
                        placeholder="Artist name"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Genre</label>
                      <input
                        type="text"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className={inputClass}
                        placeholder="e.g., Hip-Hop, Pop, Rock"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Language</label>
                      <input
                        type="text"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={inputClass}
                        placeholder="English"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={inputClass}
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Record Label (optional)</label>
                      <input
                        type="text"
                        value={recordLabel}
                        onChange={(e) => setRecordLabel(e.target.value)}
                        className={inputClass}
                        placeholder="Record label"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Release Date</label>
                      <input
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Tracks */}
            {uploadType && coverUrl && !submitted && (
              <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-2xl">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {uploadType === "single" ? "Track" : uploadType === "medley" ? "Medley Sections" : "Tracks"}
                    </h2>
                    {uploadType !== "single" && (
                      <Button
                        type="button"
                        onClick={addTrack}
                        className="bg-green-600 hover:bg-green-500 text-white font-semibold text-sm rounded-lg flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add {uploadType === "medley" ? "Section" : "Track"}
                      </Button>
                    )}
                  </div>

                  {tracks.length === 0 && uploadType !== "single" && (
                    <Button
                      type="button"
                      onClick={addTrack}
                      className="w-full bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 font-semibold py-3 rounded-xl"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add First {uploadType === "medley" ? "Section" : "Track"}
                    </Button>
                  )}

                  <div className="space-y-6">
                    {tracks.map((track, idx) => (
                      <div key={track.id} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 bg-zinc-50 dark:bg-zinc-800/30">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-zinc-900 dark:text-white">
                            {uploadType === "medley" ? `Section ${idx + 1}` : `Track ${idx + 1}`}
                          </h3>
                          {tracks.length > 1 && uploadType !== "single" && (
                            <button
                              type="button"
                              onClick={() => removeTrack(track.id)}
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-lg transition-all"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className={labelClass}>Title</label>
                            <input
                              type="text"
                              value={track.title}
                              onChange={(e) => updateTrack(track.id, "title", e.target.value)}
                              className={inputClass}
                              placeholder="Track title"
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Audio File</label>
                            <label className="block">
                              <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-green-500 transition-colors bg-white dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-600">
                                <Music className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                <input
                                  type="file"
                                  accept="audio/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleTrackAudioUpload(track.id, file);
                                  }}
                                  className="hidden"
                                />
                                {track.mp3Url ? (
                                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm font-semibold">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Audio uploaded
                                  </div>
                                ) : (
                                  <div className="text-sm text-zinc-500 dark:text-zinc-400">Click to upload audio</div>
                                )}
                              </div>
                            </label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>ISRC (optional)</label>
                              <input
                                type="text"
                                value={track.isrc}
                                onChange={(e) => updateTrack(track.id, "isrc", e.target.value)}
                                className={inputClass}
                                placeholder="ISRC code"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Featured (optional)</label>
                              <input
                                type="text"
                                value={track.featured || ""}
                                onChange={(e) => updateTrack(track.id, "featured", e.target.value)}
                                className={inputClass}
                                placeholder="Featured artists"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Producer (optional)</label>
                              <input
                                type="text"
                                value={track.producer || ""}
                                onChange={(e) => updateTrack(track.id, "producer", e.target.value)}
                                className={inputClass}
                                placeholder="Producer"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Writer (optional)</label>
                              <input
                                type="text"
                                value={track.writer || ""}
                                onChange={(e) => updateTrack(track.id, "writer", e.target.value)}
                                className={inputClass}
                                placeholder="Songwriter"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Copyright */}
            {coverUrl && !submitted && (
              <Card className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300 uppercase">Legal Agreements</h3>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedOwnership}
                      onChange={(e) => setAgreedOwnership(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded accent-green-500"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      I own or have rights to distribute this content
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded accent-green-500"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      I agree to the Terms of Service
                    </span>
                  </label>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {coverUrl && !submitted && (
              <div className="flex gap-4 justify-between pb-8">
                <Button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={!requiredFieldsFilled || !agreedOwnership || !agreedTerms}
                  className="px-8 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-600/20 disabled:opacity-40"
                >
                  Upload {uploadType === "album" ? "Album" : uploadType === "medley" ? "Medley" : "Single"}
                </Button>
              </div>
            )}

            {/* Success */}
            {submitted && (
              <div className="text-center py-8 px-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <p className="text-green-700 dark:text-green-400 font-bold text-lg">Successfully uploaded!</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">Redirecting...</p>
              </div>
            )}

            {/* Error */}
            {submitError && (
              <div className="text-center py-4 px-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
                <p className="text-red-600 dark:text-red-400 font-bold">{submitError}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default function SongUploadPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <PlayerProvider>
          <SidebarProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex flex-1 w-full">
                <Sidebar className="hidden md:block" />
                <main className="flex-1">
                  <SongUploadContent />
                </main>
              </div>
              <MobileBottomNav />
            </div>
          </SidebarProvider>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

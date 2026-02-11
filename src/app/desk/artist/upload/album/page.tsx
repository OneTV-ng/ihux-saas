"use client";
import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Music, Image, Play, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlbumPreview } from "@/components/album/AlbumPreview";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { PlayerProvider, usePlayer } from "@/contexts/player-context";
import { ThemeProvider } from "@/components/theme-provider";
import { useRouter } from "next/navigation";

type StepProps = {
  number: number;
  title: string;
  active?: boolean;
};

function Step({ number, title, active = false }: StepProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${active ? "bg-green-500 text-black" : "bg-zinc-800 text-zinc-400"}`}>
        {number}
      </div>
      <p className={active ? "text-white" : "text-zinc-400"}>{title}</p>
    </div>
  );
}

type UploadLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function UploadLayout({ title, description, children }: UploadLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-zinc-200 text-zinc-900 dark:from-black dark:via-zinc-900 dark:to-zinc-950 dark:text-white p-0 md:p-6 pt-[90px] transition-colors duration-300">
      <header className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-500 dark:text-green-400 drop-shadow-lg tracking-tight">{title}</h1>
        <p className="text-zinc-600 dark:text-zinc-300 mt-3 text-lg font-medium">{description}</p>
      </header>
      <main className="max-w-3xl mx-auto w-full">{children}</main>
    </div>
  );
}

interface TrackData {
  title: string;
  artist: string;
  isrc: string;
  mp3Url: string;
}

function AlbumUploadContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);

  const { user, defaultArtist } = useAuth();
  const player = usePlayer();
  const [coverUrl, setCoverUrl] = useState("");
  const [coverDetails, setCoverDetails] = useState<any>(null);
  const [albumName, setAlbumName] = useState("");
  const [artist, setArtist] = useState(defaultArtist?.name || "");
  const [artistId, setArtistId] = useState(defaultArtist?.id || "");
  const [userId, setUserId] = useState(user?.id || "");
  const [upc, setUpc] = useState("");
  const [rejectionFlag, setRejectionFlag] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverUploading, setCoverUploading] = useState(false);

  // Tracks
  const [tracks, setTracks] = useState<TrackData[]>([
    { title: "", artist: defaultArtist?.name || "", isrc: "", mp3Url: "" },
  ]);
  const [trackProgress, setTrackProgress] = useState<number[]>([0]);
  const [trackUploading, setTrackUploading] = useState<boolean[]>([false]);

  // Check selected artist
  useEffect(() => {
    const checkRequirements = async () => {
      try {
        setIsLoading(true);
        const artistResponse = await fetch("/api/artist?selected=true");
        const artistData = await artistResponse.json();
        if (artistData.success && artistData.data) {
          setSelectedArtist(artistData.data);
        }
      } catch (error) {
        console.error("Error checking requirements:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkRequirements();
  }, []);

  // Prefill from auth
  useEffect(() => {
    if (user && !userId) setUserId(user.id);
    if (selectedArtist && !artistId) setArtistId(selectedArtist.id);
    if (selectedArtist && !artist) setArtist(selectedArtist.displayName);
    else if (defaultArtist && !artistId) setArtistId(defaultArtist.id);
    else if (defaultArtist && !artist) setArtist(defaultArtist.name);
  }, [user, defaultArtist, selectedArtist]);

  // Cover upload
  const handleCoverUpload = (file: File) => {
    if (!file) return;
    setCoverUploading(true);
    setCoverProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "cover");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setCoverProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      setCoverUploading(false);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        setCoverUrl(data.url);
        setCoverDetails(data.imageDetails || null);
        setRejectionFlag(data.rejectionFlag);
        setRejectionReasons(data.rejectionReasons || []);
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
  const handleCoverDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  // Track audio upload
  const handleTrackUpload = (idx: number, file: File) => {
    if (!file) return;
    setTrackUploading(arr => { const c = [...arr]; c[idx] = true; return c; });
    setTrackProgress(arr => { const c = [...arr]; c[idx] = 0; return c; });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "audio");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setTrackProgress(arr => { const c = [...arr]; c[idx] = Math.round((event.loaded / event.total) * 100); return c; });
      }
    };
    xhr.onload = () => {
      setTrackUploading(arr => { const c = [...arr]; c[idx] = false; return c; });
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        setTracks(t => t.map((tr, i) => i === idx ? { ...tr, mp3Url: data.url } : tr));
      }
    };
    xhr.onerror = () => setTrackUploading(arr => { const c = [...arr]; c[idx] = false; return c; });
    xhr.send(formData);
  };

  const handleTrackChange = (idx: number, field: keyof TrackData, value: string) => {
    setTracks(t => t.map((tr, i) => i === idx ? { ...tr, [field]: value } : tr));
  };

  const addTrack = () => {
    setTracks(t => [...t, { title: "", artist: artist, isrc: "", mp3Url: "" }]);
    setTrackProgress(arr => [...arr, 0]);
    setTrackUploading(arr => [...arr, false]);
  };

  const removeTrack = (idx: number) => {
    if (tracks.length <= 1) return;
    setTracks(t => t.filter((_, i) => i !== idx));
    setTrackProgress(arr => arr.filter((_, i) => i !== idx));
    setTrackUploading(arr => arr.filter((_, i) => i !== idx));
  };

  const allTracksUploaded = tracks.every(t => !!t.mp3Url && !!t.title);
  const canSubmit = !!coverUrl && !!albumName && !!artistId && !!userId && allTracksUploaded && !coverUploading && !trackUploading.some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setSubmitError("");
    const albumData = {
      albumName,
      upc,
      artistId,
      userId,
      coverUrl,
      tracks: tracks.map((t, idx) => ({ ...t, artistId, track_number: idx + 1 })),
      rejectionFlag,
      rejectionReasons,
      type: "album",
    };
    const res = await fetch("/api/song-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(albumData),
    });
    const data = await res.json();
    if (data.success) {
      setSubmitted(true);
    } else {
      setSubmitError(data.error || "Failed to submit");
    }
  };

  return (
    <>
      {selectedArtist && (
        <div className="max-w-4xl mx-auto mb-8 pt-[90px] px-6">
          <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium">Uploading as:</p>
                    <p className="text-lg font-bold">{selectedArtist.displayName}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/desk/artist")}>
                  Change Artist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <UploadLayout title="Upload Album / EP" description="Upload multiple tracks and release as an album">
        <div className="flex gap-4 justify-center mb-8">
          <Step number={1} title="Cover & Tracks" active />
          <Step number={2} title="Album Details" active={!!coverUrl && tracks.length > 0} />
          <Step number={3} title="Review & Submit" active={submitted} />
        </div>
        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Cover Art Upload */}
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 border-none shadow-2xl rounded-3xl backdrop-blur-md ring-1 ring-green-400/10">
            <CardContent className="p-10">
              <div
                className="flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto"
                onDrop={handleCoverDrop}
                onDragOver={handleCoverDragOver}
              >
                <label htmlFor="cover-upload" className="w-full cursor-pointer group">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-all duration-300 bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 hover:from-green-900/30 hover:to-green-800/20 border-green-400 group-hover:border-green-500 shadow-xl hover:shadow-2xl">
                    <Image size={56} className="text-green-400 mb-3 drop-shadow-lg" />
                    <span className="font-extrabold text-xl tracking-tight text-white mb-1">Cover Art</span>
                    <span className="block text-sm text-zinc-300 font-medium mb-2">3000x3000 JPG/PNG, 70-600dpi</span>
                    <input id="cover-upload" type="file" accept="image/*" onChange={handleCoverInput} className="hidden" disabled={coverUploading} />
                    <div className="w-full mt-2 min-h-[28px] flex items-center justify-center">
                      {coverUploading ? (
                        <>
                          <Progress value={coverProgress} />
                          <span className="text-xs text-green-300 ml-2 animate-pulse">Uploading: {coverProgress}%</span>
                        </>
                      ) : coverUrl ? (
                        <span className="text-green-400 text-xs font-semibold flex items-center gap-1"><svg width='16' height='16' fill='currentColor' className='inline'><circle cx='8' cy='8' r='8'/></svg>Cover uploaded</span>
                      ) : <span className="text-xs text-zinc-400 italic">Click or drag image here</span>}
                    </div>
                  </div>
                </label>
                {coverDetails && (
                  <div className="text-xs text-zinc-200 mt-2 text-center bg-zinc-800/80 rounded-lg px-3 py-2 shadow-inner">
                    <b className="text-green-400">Image Details:</b><br />
                    <span className="font-mono">{coverDetails.width}x{coverDetails.height}px</span>, {coverDetails.dpi || 'N/A'} dpi, {coverDetails.format?.toUpperCase() || ''}
                  </div>
                )}
                {rejectionFlag && (
                  <div className="text-red-500 mt-2 text-xs text-center bg-zinc-900/80 rounded-lg px-3 py-2 shadow-inner">
                    <b>Rejection Issues:</b>
                    <ul className="list-disc ml-4">
                      {rejectionReasons.map((reason, idx) => <li key={idx}>{reason}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Album Details */}
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 border-none shadow-2xl rounded-3xl backdrop-blur-md ring-1 ring-green-400/10">
            <CardContent className="p-10 grid gap-8">
              <div>
                <label className="block font-semibold mb-1">Album Name</label>
                <input type="text" value={albumName} onChange={e => setAlbumName(e.target.value)} className="input input-bordered w-full bg-zinc-800 text-white" placeholder="Enter album name" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-1">Artist</label>
                  <input type="text" value={artist} onChange={e => setArtist(e.target.value)} className="input input-bordered w-full bg-zinc-800 text-white" placeholder="Artist name" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">UPC (optional)</label>
                  <input type="text" value={upc} onChange={e => setUpc(e.target.value)} className="input input-bordered w-full bg-zinc-800 text-white" placeholder="UPC code" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracks */}
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 border-none shadow-2xl rounded-3xl backdrop-blur-md ring-1 ring-green-400/10">
            <CardContent className="p-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-green-400">Tracks ({tracks.length})</h3>
                <button type="button" onClick={addTrack} className="px-4 py-2 rounded-full bg-green-500 text-black font-bold text-sm flex items-center gap-1 hover:bg-green-400 transition-all">
                  <Plus className="h-4 w-4" /> Add Track
                </button>
              </div>
              <div className="space-y-4">
                {tracks.map((track, idx) => (
                  <div key={idx} className="border border-zinc-700 rounded-2xl p-6 bg-zinc-800/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-bold text-sm">Track {idx + 1}</span>
                      {tracks.length > 1 && (
                        <button type="button" onClick={() => removeTrack(idx)} className="text-red-400 hover:text-red-300 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input type="text" value={track.title} onChange={e => handleTrackChange(idx, "title", e.target.value)} className="input input-bordered w-full bg-zinc-700 text-white text-sm" placeholder="Track title" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Artist</label>
                        <input type="text" value={track.artist} onChange={e => handleTrackChange(idx, "artist", e.target.value)} className="input input-bordered w-full bg-zinc-700 text-white text-sm" placeholder="Artist" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">ISRC</label>
                        <input type="text" value={track.isrc} onChange={e => handleTrackChange(idx, "isrc", e.target.value)} className="input input-bordered w-full bg-zinc-700 text-white text-sm" placeholder="Optional" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Audio File</label>
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-3 border border-dashed border-green-400/50 rounded-xl p-3 hover:bg-green-900/20 transition">
                          <Music className="h-5 w-5 text-green-400" />
                          <span className="text-sm text-zinc-300">
                            {trackUploading[idx] ? (
                              <span className="flex items-center gap-2">
                                <Progress value={trackProgress[idx] || 0} className="w-32" />
                                <span className="text-green-300 animate-pulse">{trackProgress[idx]}%</span>
                              </span>
                            ) : track.mp3Url ? (
                              <span className="text-green-400 font-semibold">Audio uploaded</span>
                            ) : (
                              "Click to upload MP3"
                            )}
                          </span>
                        </div>
                        <input type="file" accept="audio/mp3,audio/mpeg" className="hidden" disabled={trackUploading[idx]} onChange={e => { const f = e.target.files?.[0]; if (f) handleTrackUpload(idx, f); }} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="mt-10">
            <h3 className="text-2xl font-extrabold mb-4 text-green-400 tracking-tight drop-shadow-lg">Preview</h3>
            <div className="rounded-2xl bg-zinc-900/70 p-6 shadow-inner">
              <AlbumPreview coverUrl={coverUrl} albumName={albumName} upc={upc} tracks={tracks.map(t => ({ title: t.title, artist: t.artist, isrc: t.isrc }))} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-between items-center mt-10 gap-6">
            <div className="flex gap-3">
              <button type="button" className="px-7 py-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-100 font-semibold shadow-md border border-zinc-700 transition-all duration-200 focus:ring-2 focus:ring-green-400/40" onClick={() => router.back()}>
                &larr; Back
              </button>
              <button type="button" className="px-7 py-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-100 font-semibold shadow-md border border-zinc-700 transition-all duration-200 focus:ring-2 focus:ring-green-400/40" onClick={() => router.push("/desk")}>
                Home
              </button>
            </div>
            <button type="submit" className="px-10 py-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-extrabold text-lg shadow-xl border-none tracking-wide transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-green-400/40" disabled={!canSubmit}>
              Submit Album
            </button>
          </div>
          {submitted && <div className="text-green-400 mt-8 text-center font-extrabold text-xl animate-fade-in">Album uploaded successfully!</div>}
          {submitError && <div className="text-red-500 mt-8 text-center font-extrabold text-xl animate-fade-in">{submitError}</div>}
        </form>
      </UploadLayout>
    </>
  );
}

export default function AlbumUploadPage() {
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
                  <AlbumUploadContent />
                </main>
              </div>
              <MobileBottomNav />
              <PlayerBar />
            </div>
          </SidebarProvider>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function PlayerBar() {
  const { current, isPlaying, pause, play, queue, currentIndex, next, prev } = usePlayer();
  if (!current) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 border-t border-zinc-800 flex items-center px-4 py-2 shadow-2xl">
      <img src={current.cover} alt="cover" className="h-12 w-12 rounded-md object-cover mr-4" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{current.title}</div>
        <div className="text-xs text-zinc-400 truncate">{current.artist}</div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button onClick={prev} className="btn btn-ghost btn-sm">⏮️</button>
        {isPlaying ? (
          <button onClick={pause} className="btn btn-ghost btn-sm">⏸️</button>
        ) : (
          <button onClick={() => play(queue, currentIndex)} className="btn btn-ghost btn-sm">▶️</button>
        )}
        <button onClick={next} className="btn btn-ghost btn-sm">⏭️</button>
      </div>
    </div>
  );
}

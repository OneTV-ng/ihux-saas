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

interface MedleyTrack {
  title: string;
  artist: string;
  timestamp: string; // e.g. "0:00", "3:45"
}

function MedleyUploadContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);

  const { user, defaultArtist } = useAuth();
  const player = usePlayer();
  const [coverUrl, setCoverUrl] = useState("");
  const [coverDetails, setCoverDetails] = useState<any>(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3Details, setMp3Details] = useState<any>(null);
  const [medleyName, setMedleyName] = useState("");
  const [artist, setArtist] = useState(defaultArtist?.name || "");
  const [artistId, setArtistId] = useState(defaultArtist?.id || "");
  const [userId, setUserId] = useState(user?.id || "");
  const [isrc, setIsrc] = useState("");
  const [rejectionFlag, setRejectionFlag] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [audioUploading, setAudioUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Medley tracks (track names at timestamp positions within the same audio)
  const [tracks, setTracks] = useState<MedleyTrack[]>([
    { title: "", artist: defaultArtist?.name || "", timestamp: "0:00" },
  ]);

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

  // Audio upload (single file for entire medley)
  const handleMp3Upload = (file: File) => {
    if (!file) return;
    setAudioUploading(true);
    setAudioProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "audio");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setAudioProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      setAudioUploading(false);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        setMp3Url(data.url);
        setMp3Details({ size: data.size, type: data.type, filename: data.filename });
      }
    };
    xhr.onerror = () => setAudioUploading(false);
    xhr.send(formData);
  };

  const handleMp3Input = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleMp3Upload(file);
  };
  const handleMp3Drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleMp3Upload(e.dataTransfer.files[0]);
  };
  const handleMp3DragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  // Track management
  const handleTrackChange = (idx: number, field: keyof MedleyTrack, value: string) => {
    setTracks(t => t.map((tr, i) => i === idx ? { ...tr, [field]: value } : tr));
  };

  const addTrack = () => {
    setTracks(t => [...t, { title: "", artist: artist, timestamp: "" }]);
  };

  const removeTrack = (idx: number) => {
    if (tracks.length <= 1) return;
    setTracks(t => t.filter((_, i) => i !== idx));
  };

  const allTracksNamed = tracks.every(t => !!t.title && !!t.timestamp);
  const canSubmit = !!mp3Url && !!coverUrl && !!medleyName && !!artistId && !!userId && allTracksNamed && !audioUploading && !coverUploading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setSubmitError("");
    const medleyData = {
      albumName: medleyName,
      artistId,
      userId,
      coverUrl,
      mp3Url,
      isrc,
      tracks: tracks.map((t, idx) => ({ ...t, track_number: idx + 1 })),
      rejectionFlag,
      rejectionReasons,
      type: "medley",
    };
    const res = await fetch("/api/song-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medleyData),
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
      <UploadLayout title="Upload Medley" description="Upload a single audio file with multiple tracks at different timestamps">
        <div className="flex gap-4 justify-center mb-8">
          <Step number={1} title="Audio & Cover" active />
          <Step number={2} title="Track Markers" active={!!mp3Url && !!coverUrl} />
          <Step number={3} title="Review & Submit" active={submitted} />
        </div>
        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Audio & Cover Upload */}
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 border-none shadow-2xl rounded-3xl backdrop-blur-md ring-1 ring-green-400/10">
            <CardContent className="p-10 grid md:grid-cols-2 gap-10">
              <div
                className="flex flex-col items-center justify-center gap-4 w-full"
                onDrop={handleMp3Drop}
                onDragOver={handleMp3DragOver}
              >
                <label htmlFor="mp3-upload" className="w-full cursor-pointer group">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-all duration-300 bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 hover:from-green-900/30 hover:to-green-800/20 border-green-400 group-hover:border-green-500 shadow-xl hover:shadow-2xl">
                    <Music size={56} className="text-green-400 mb-3 drop-shadow-lg" />
                    <span className="font-extrabold text-xl tracking-tight text-white mb-1">Medley Audio</span>
                    <span className="block text-sm text-zinc-300 font-medium mb-2">Single MP3/WAV file (max 10MB)</span>
                    <input id="mp3-upload" type="file" accept="audio/mp3,audio/mpeg,audio/wav" onChange={handleMp3Input} className="hidden" disabled={audioUploading} />
                    <div className="w-full mt-2 min-h-[28px] flex items-center justify-center">
                      {audioUploading ? (
                        <>
                          <Progress value={audioProgress} />
                          <span className="text-xs text-green-300 ml-2 animate-pulse">Uploading: {audioProgress}%</span>
                        </>
                      ) : mp3Url ? (
                        <span className="text-green-400 text-xs font-semibold flex items-center gap-1"><svg width='16' height='16' fill='currentColor' className='inline'><circle cx='8' cy='8' r='8'/></svg>Audio uploaded</span>
                      ) : <span className="text-xs text-zinc-400 italic">Click or drag audio here</span>}
                    </div>
                  </div>
                </label>
                {mp3Details && (
                  <div className="text-xs text-zinc-200 mt-2 text-center bg-zinc-800/80 rounded-lg px-3 py-2 shadow-inner">
                    <b className="text-green-400">Audio Details:</b><br />
                    <span className="font-mono">{mp3Details.filename}</span> <span className="text-zinc-400">({(mp3Details.size / 1024 / 1024).toFixed(2)} MB, {mp3Details.type})</span>
                  </div>
                )}
              </div>
              <div
                className="flex flex-col items-center justify-center gap-4 w-full"
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

          {/* Medley Details */}
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 border-none shadow-2xl rounded-3xl backdrop-blur-md ring-1 ring-green-400/10">
            <CardContent className="p-10 grid gap-8">
              <div>
                <label className="block font-semibold mb-1">Medley Name</label>
                <input type="text" value={medleyName} onChange={e => setMedleyName(e.target.value)} className="input input-bordered w-full bg-zinc-800 text-white" placeholder="Enter medley name" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-1">Artist</label>
                  <input type="text" value={artist} onChange={e => setArtist(e.target.value)} className="input input-bordered w-full bg-zinc-800 text-white" placeholder="Artist name" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ISRC (optional)</label>
                  <input type="text" value={isrc} onChange={e => setIsrc(e.target.value)} className="input input-bordered w-full bg-zinc-800 text-white" placeholder="ISRC code" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Track Markers */}
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 border-none shadow-2xl rounded-3xl backdrop-blur-md ring-1 ring-green-400/10">
            <CardContent className="p-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-green-400">Track Markers ({tracks.length})</h3>
                <button type="button" onClick={addTrack} className="px-4 py-2 rounded-full bg-green-500 text-black font-bold text-sm flex items-center gap-1 hover:bg-green-400 transition-all">
                  <Plus className="h-4 w-4" /> Add Track
                </button>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Mark where each track starts within the medley audio file.</p>
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
                        <label className="block text-sm font-medium mb-1">Timestamp</label>
                        <input type="text" value={track.timestamp} onChange={e => handleTrackChange(idx, "timestamp", e.target.value)} className="input input-bordered w-full bg-zinc-700 text-white text-sm" placeholder="e.g. 0:00, 3:45" />
                      </div>
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
              <AlbumPreview coverUrl={coverUrl} albumName={medleyName} tracks={tracks.map(t => ({ title: `${t.title} [${t.timestamp}]`, artist: t.artist }))} />
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
            <div className="flex gap-3">
              <button
                type="button"
                className="px-7 py-3 rounded-full bg-gradient-to-r from-green-500/80 to-green-400/80 hover:from-green-400 hover:to-green-500 text-black font-bold shadow-lg border-none transition-all duration-200 focus:ring-2 focus:ring-green-400/40 flex items-center gap-2"
                disabled={!mp3Url}
                onClick={() => mp3Url && player.play({ mp3: mp3Url, cover: coverUrl, title: medleyName, artist })}
              >
                <Play className="h-5 w-5" />
                Preview Medley
              </button>
              <button type="submit" className="px-10 py-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-extrabold text-lg shadow-xl border-none tracking-wide transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-green-400/40" disabled={!canSubmit}>
                Submit Medley
              </button>
            </div>
          </div>
          {submitted && <div className="text-green-400 mt-8 text-center font-extrabold text-xl animate-fade-in">Medley uploaded successfully! <button className="ml-2 underline hover:text-green-300 transition" onClick={() => mp3Url && player.play({ mp3: mp3Url, cover: coverUrl, title: medleyName, artist })}>Play</button></div>}
          {submitError && <div className="text-red-500 mt-8 text-center font-extrabold text-xl animate-fade-in">{submitError}</div>}
        </form>
      </UploadLayout>
    </>
  );
}

export default function MedleyUploadPage() {
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
                  <MedleyUploadContent />
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

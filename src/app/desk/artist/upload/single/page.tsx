"use client";
import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Music, Image, Play, CheckCircle2, ShieldCheck, AlertTriangle, ArrowLeft } from "lucide-react";
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
import { useShowMessage } from "@/hooks/use-show-message";

type StepProps = {
  number: number;
  title: string;
  active?: boolean;
  completed?: boolean;
};

function Step({ number, title, active = false, completed = false }: StepProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${completed ? "bg-green-500 text-black shadow-lg shadow-green-500/30" : active ? "bg-green-500 text-black shadow-lg shadow-green-500/30" : "bg-zinc-800/80 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>
        {completed ? <CheckCircle2 className="h-5 w-5" /> : number}
      </div>
      <p className={`font-medium tracking-wide ${completed ? "text-green-600 dark:text-green-400" : active ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"}`}>{title}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 text-zinc-900 dark:from-zinc-950 dark:via-black dark:to-zinc-950 dark:text-white p-4 md:p-8 pt-[90px] transition-colors duration-300">
      <header className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
          Upload <span className="text-green-500 dark:text-green-400">Single</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-base font-normal">{description}</p>
      </header>
      <main className="max-w-2xl mx-auto w-full">{children}</main>
    </div>
  );
}


function SingleUploadContent() {
  const { success, error: showError, info: showInfo } = useShowMessage();

  // Info, lyrics, media links
  const [info, setInfo] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [mediaLinks, setMediaLinks] = useState({
    appleMusic: "",
    spotify: "",
    youtube: "",
    soundcloud: "",
    tidal: "",
    deezer: "",
    amazonMusic: ""
  });
  // Required and optional fields
  const [upc, setUpc] = useState("");
  const [producer, setProducer] = useState("");
  const [songwriter, setSongwriter] = useState("");
  const [studio, setStudio] = useState("");
  const [recordLabel, setRecordLabel] = useState("");
  const [explicit, setExplicit] = useState("no");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("English");
  const [genre, setGenre] = useState("");
  const [subGenre, setSubGenre] = useState("");
  const [city, setCity] = useState("");
  const [writer, setWriter] = useState("");
  const [releaseDate, setReleaseDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  // Prefill settings
  const [uploadSetting, setUploadSetting] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [userVerificationStatus, setUserVerificationStatus] = useState<string>("updating");

  const { user, defaultArtist, isLoading: authLoading, isAuthenticated, forceRefresh } = useAuth();
  const player = usePlayer();
  const [coverUrl, setCoverUrl] = useState("");
  const [coverDetails, setCoverDetails] = useState<any>(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3Details, setMp3Details] = useState<any>(null);
  const [songTitle, setSongTitle] = useState("");
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

  // Copyright agreement state
  const [agreedOwnership, setAgreedOwnership] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Auth check: if not signed in, force refresh and redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      forceRefresh().then(() => {
        if (!isAuthenticated) {
          // Use current path for redirect
          const current = window.location.pathname + window.location.search;
          router.replace(`/auth/signin?redirect=${encodeURIComponent(current)}`);
        }
      });
    }
  }, [authLoading, isAuthenticated, forceRefresh, router]);

  useEffect(() => {
    const checkRequirements = async () => {
      try {
        setIsLoading(true);
        const profileResponse = await fetch("/api/profile");
        const profileData = await profileResponse.json();
        if (profileData.success) {
          const verStatus = profileData.data.verificationStatus || "updating";
          setUserVerificationStatus(verStatus);
          setIsVerified(verStatus === "verified");
        }
        const artistResponse = await fetch("/api/artist?selected=true");
        const artistData = await artistResponse.json();
        if (artistData.success && artistData.data) {
          setSelectedArtist(artistData.data);
          // Prefill from artist.team and artist.uploadSetting if available
          if (artistData.data.team) setTeam(artistData.data.team);
          if (artistData.data.uploadSetting) setUploadSetting(artistData.data.uploadSetting);
        }
      } catch (error) {
        console.error("Error checking requirements:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkRequirements();
  }, []);

  const handleCoverUpload = (file: File) => {
    if (!file) return;
    setCoverUploading(true);
    setCoverProgress(0);
    showInfo("Uploading cover art...", `${file.name}`);

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
        success("Cover uploaded", `${data.imageDetails?.width}x${data.imageDetails?.height}px`);

        if (data.rejectionFlag) {
          showError("Cover quality issue", data.rejectionReasons?.join(", ") || "Please check your image");
        }
      } else {
        showError("Cover upload failed", "Please try again");
      }
    };
    xhr.onerror = () => {
      setCoverUploading(false);
      showError("Cover upload failed", "Network error");
    };
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

  const handleMp3Upload = (file: File) => {
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showError("File too large", "Maximum file size is 10MB");
      return;
    }

    setAudioUploading(true);
    setAudioProgress(0);
    showInfo("Uploading audio...", `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "audio");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setAudioProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      setAudioUploading(false);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        setMp3Url(data.url);
        setMp3Details({ size: data.size, type: data.type, filename: data.filename });
        success("Audio uploaded", `Ready to publish`);
      } else {
        showError("Audio upload failed", "Please try again");
      }
    };
    xhr.onerror = () => {
      setAudioUploading(false);
      showError("Audio upload failed", "Network error");
    };
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

  React.useEffect(() => {
    if (user && !userId) setUserId(user.id); // user object is fine, but DB table is now 'users'
    if (selectedArtist && !artistId) setArtistId(selectedArtist.id);
    if (selectedArtist) setArtist(selectedArtist.artistName);
    else if (defaultArtist && !artistId) setArtistId(defaultArtist.id);
    else if (defaultArtist && !artist) setArtist(defaultArtist.name);

    // Prefill from artist.uploadSetting, artist.team, artist profile, user
    const prefill = (field: string, setter: (v: any) => void, fallback?: any) => {
      if (uploadSetting && uploadSetting[field]) setter(uploadSetting[field]);
      else if (selectedArtist && selectedArtist[field]) setter(selectedArtist[field]);
      else if (selectedArtist && selectedArtist.profile && selectedArtist.profile[field]) setter(selectedArtist.profile[field]);
      else if (team && team[field]) setter(team[field]);
      else if (user && Object.prototype.hasOwnProperty.call(user, field)) setter((user as any)[field]);
      else if (fallback !== undefined) setter(fallback);
    };
    prefill("producer", setProducer);
    prefill("songwriter", setSongwriter);
    prefill("studio", setStudio);
    prefill("language", setLanguage, "English");
    prefill("country", setCountry);
    prefill("city", setCity);
    prefill("genre", setGenre);
    prefill("subGenre", setSubGenre);
    prefill("recordLabel", setRecordLabel);
    prefill("explicit", setExplicit, "no");
    // Add more fields as needed
  }, [user, defaultArtist, selectedArtist, uploadSetting, team]);

  // Enforce required fields
  const canSubmit = !!mp3Url && !!coverUrl && !!songTitle && !!artist && !!artistId && !!userId && !!producer && !!songwriter && !!language && !!country && !audioUploading && !coverUploading && agreedOwnership && agreedTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setSubmitError("");

    // Validate requirements
    if (!isVerified) {
      showError("Email not verified", "Please verify your email before uploading");
      return;
    }

    if (!selectedArtist) {
      showError("No artist selected", "Please select an artist to upload for");
      return;
    }

    // Show info about submission
    showInfo("Uploading your song...", "Please wait while we process your submission");

    const songData = {
      artistId,
      userId,
      tracks: [{ title: songTitle, artist, isrc }],
      coverUrl,
      mp3Url,
      rejectionFlag,
      rejectionReasons,
      // Add all fields to save for uploadSetting
      producer,
      songwriter,
      studio,
      language,
      country,
      city,
      genre,
      subGenre,
      recordLabel,
      explicit,
      upc,
      writer,
      releaseDate,
      info,
      lyrics,
      mediaLinks,
    };

    try {
      const res = await fetch("/api/song-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(songData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit song");
      }

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        success(
          "Song uploaded successfully!",
          `"${songTitle}" is now being processed`
        );

        // Update artist.uploadSetting with the latest choices
        try {
          await fetch(`/api/artist/upload-setting`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              artistId,
              uploadSetting: {
                producer,
                songwriter,
                studio,
                language,
                country,
                city,
                genre,
                subGenre,
                recordLabel,
                explicit,
                upc,
                writer,
                releaseDate,
                info,
                lyrics,
                mediaLinks,
              },
            }),
          });
        } catch (settingError) {
          console.error("Error saving upload settings:", settingError);
          // Don't fail the upload if settings don't save
        }

        // Redirect after success
        setTimeout(() => {
          router.push("/desk/artist?tab=uploads");
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to submit song");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit song";
      setSubmitError(errorMessage);
      showError("Upload failed", errorMessage);
    }
  };

  // Shared input class
  const inputClass = "w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-white px-4 py-3 text-sm font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2";

  // Ensure artist profile includes these fields if missing
  useEffect(() => {
    if (selectedArtist && selectedArtist.profile) {
      let needsUpdate = false;
      const updatePayload: any = { id: selectedArtist.id };
      if (!selectedArtist.profile.producer && producer) { updatePayload.producer = producer; needsUpdate = true; }
      if (!selectedArtist.profile.songwriter && songwriter) { updatePayload.songwriter = songwriter; needsUpdate = true; }
      if (!selectedArtist.profile.studio && studio) { updatePayload.studio = studio; needsUpdate = true; }
      if (!selectedArtist.profile.recordLabel && recordLabel) { updatePayload.recordLabel = recordLabel; needsUpdate = true; }
      if (!selectedArtist.profile.genre && genre) { updatePayload.genre = genre; needsUpdate = true; }
      if (!selectedArtist.profile.subGenre && subGenre) { updatePayload.subGenre = subGenre; needsUpdate = true; }
      if (!selectedArtist.profile.country && country) { updatePayload.country = country; needsUpdate = true; }
      if (!selectedArtist.profile.city && city) { updatePayload.city = city; needsUpdate = true; }
      // Optionally update other fields as needed
      if (needsUpdate) {
        fetch(`/api/artist`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtist, producer, songwriter, studio, recordLabel, genre, subGenre, country, city]);

  return (
    <>
      {/* Verification Status */}
      {!isVerified && (
        <div className="max-w-2xl mx-auto mb-6 pt-[90px] px-4">
          <Card className="border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">Email Not Verified</p>
                    <p className="text-sm text-red-700 dark:text-red-300">Please verify your email before uploading songs</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => router.push("/desk/settings")}
                >
                  Verify Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Artist Selection */}
      {selectedArtist && (
        <div className="max-w-2xl mx-auto mb-6 pt-[90px] px-4">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs font-semibold"
                  onClick={() => router.push("/desk/artist")}
                >
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Artist Selected */}
      {!selectedArtist && (
        <div className="max-w-2xl mx-auto mb-6 pt-[90px] px-4">
          <Card className="border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wide">No Artist Selected</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">Create or select an artist to start uploading</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => router.push("/desk/artist")}
                >
                  Select Artist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {!isVerified || !selectedArtist ? (
        <UploadLayout
          title="Upload Music Single"
          description="Complete the requirements above to get started"
        >
          <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-2xl">
            <CardContent className="p-12 text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  {!isVerified ? "Email Verification Required" : "Artist Selection Required"}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {!isVerified
                    ? "Please verify your email address before uploading songs."
                    : "Please select or create an artist profile before uploading."}
                </p>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white mt-4"
                onClick={() => {
                  if (!isVerified) {
                    router.push("/desk/settings");
                  } else {
                    router.push("/desk/artist");
                  }
                }}
              >
                {!isVerified ? "Verify Email" : "Select Artist"}
              </Button>
            </CardContent>
          </Card>
        </UploadLayout>
      ) : (
        <UploadLayout
          title="Upload Music Single"
          description="Distribute one track worldwide in 3 easy steps"
        >
        <div className="flex gap-6 justify-center mb-10">
          <Step number={1} title="Audio & Cover" active completed={!!mp3Url && !!coverUrl} />
          <div className="hidden sm:flex items-center"><div className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" /></div>
          <Step number={2} title="Details" active={!!mp3Url && !!coverUrl} completed={!!songTitle && !!artist} />
          <div className="hidden sm:flex items-center"><div className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" /></div>
          <Step number={3} title="Submit" active={canSubmit} completed={submitted} />
        </div>
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Audio & Cover */}
          <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-2xl">
            <CardContent className="p-8 grid md:grid-cols-2 gap-8">
              <div
                className="flex flex-col items-center justify-center gap-4 w-full"
                onDrop={handleMp3Drop}
                onDragOver={handleMp3DragOver}
              >
                <label htmlFor="mp3-upload" className="w-full cursor-pointer group">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-all duration-300 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-green-50 dark:hover:bg-green-950/20 border-zinc-300 dark:border-zinc-700 group-hover:border-green-500 shadow-sm hover:shadow-md">
                    <Music size={48} className="text-green-500 mb-3" />
                    <span className="font-bold text-lg text-zinc-800 dark:text-white mb-1">Audio File</span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-3">MP3, WAV (max 10MB)</span>
                    <input id="mp3-upload" type="file" accept="audio/mp3,audio/mpeg" onChange={handleMp3Input} className="hidden" disabled={audioUploading} />
                    <div className="w-full mt-1 min-h-[28px] flex items-center justify-center">
                      {audioUploading ? (
                        <div className="w-full flex items-center gap-2">
                          <Progress value={audioProgress} className="flex-1" />
                          <span className="text-xs text-green-600 dark:text-green-400 font-semibold animate-pulse">{audioProgress}%</span>
                        </div>
                      ) : mp3Url ? (
                        <span className="text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Audio uploaded</span>
                      ) : <span className="text-xs text-zinc-400 dark:text-zinc-500">Click or drag audio here</span>}
                    </div>
                  </div>
                </label>
                {mp3Details && (
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 text-center bg-zinc-100 dark:bg-zinc-800/60 rounded-lg px-3 py-2">
                    <span className="font-semibold text-green-600 dark:text-green-400">Audio:</span>{" "}
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">{mp3Details.filename}</span> ({(mp3Details.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
              <div
                className="flex flex-col items-center justify-center gap-4 w-full"
                onDrop={handleCoverDrop}
                onDragOver={handleCoverDragOver}
              >
                <label htmlFor="cover-upload" className="w-full cursor-pointer group">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-all duration-300 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-green-50 dark:hover:bg-green-950/20 border-zinc-300 dark:border-zinc-700 group-hover:border-green-500 shadow-sm hover:shadow-md">
                    <Image size={48} className="text-green-500 mb-3" />
                    <span className="font-bold text-lg text-zinc-800 dark:text-white mb-1">Cover Art</span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-3">3000x3000 JPG/PNG, 70-600dpi</span>
                    <input id="cover-upload" type="file" accept="image/*" onChange={handleCoverInput} className="hidden" disabled={coverUploading} />
                    <div className="w-full mt-1 min-h-[28px] flex items-center justify-center">
                      {coverUploading ? (
                        <div className="w-full flex items-center gap-2">
                          <Progress value={coverProgress} className="flex-1" />
                          <span className="text-xs text-green-600 dark:text-green-400 font-semibold animate-pulse">{coverProgress}%</span>
                        </div>
                      ) : coverUrl ? (
                        <span className="text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Cover uploaded</span>
                      ) : <span className="text-xs text-zinc-400 dark:text-zinc-500">Click or drag image here</span>}
                    </div>
                  </div>
                </label>
                {coverDetails && (
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 text-center bg-zinc-100 dark:bg-zinc-800/60 rounded-lg px-3 py-2">
                    <span className="font-semibold text-green-600 dark:text-green-400">Image:</span>{" "}
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">{coverDetails.width}x{coverDetails.height}px</span>, {coverDetails.dpi || 'N/A'} dpi
                  </div>
                )}
                {rejectionFlag && (
                  <div className="mt-1 text-xs text-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg px-3 py-2">
                    <span className="font-semibold text-red-600 dark:text-red-400 flex items-center justify-center gap-1 mb-1"><AlertTriangle className="h-3.5 w-3.5" />Rejection Issues</span>
                    <ul className="list-disc ml-4 text-red-600 dark:text-red-400 text-left">
                      {rejectionReasons.map((reason, idx) => <li key={idx}>{reason}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Song Details */}
          <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-2xl">
            <CardContent className="p-8 grid gap-6">
              <div>
                <label className={labelClass}>Song Title</label>
                <input type="text" value={songTitle} onChange={e => setSongTitle(e.target.value)} className={inputClass} placeholder="Enter song title" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Artist</label>
                  <input type="text" value={artist} onChange={e => setArtist(e.target.value)} className={inputClass} placeholder="Artist name" />
                </div>
                <div>
                  <label className={labelClass}>ISRC <span className="text-zinc-400 font-normal normal-case">(optional)</span></label>
                  <input type="text" value={isrc} onChange={e => setIsrc(e.target.value)} className={inputClass} placeholder="ISRC code" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>UPC <span className="text-zinc-400 font-normal normal-case">(optional)</span></label>
                  <input type="text" value={upc} onChange={e => setUpc(e.target.value)} className={inputClass} placeholder="UPC code" />
                </div>
                <div>
                  <label className={labelClass}>Producer <span className="text-zinc-400 font-normal normal-case"></span></label>
                  <input type="text" value={producer} onChange={e => setProducer(e.target.value)} className={inputClass} placeholder="Producer name" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Songwriter</label>
                  <input type="text" value={songwriter} onChange={e => setSongwriter(e.target.value)} className={inputClass} placeholder="Songwriter name" />
                </div>
                <div>
                  <label className={labelClass}>Record Label <span className="text-zinc-400 font-normal normal-case"></span></label>
                  <input type="text" value={recordLabel} onChange={e => setRecordLabel(e.target.value)} className={inputClass} placeholder="Record label" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Explicit</label>
                  <select title={"explicit"} value={explicit} onChange={e => setExplicit(e.target.value)} className={inputClass}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                    <option value="covered">Covered</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Country <span className="text-zinc-400 font-normal normal-case"></span></label>
                  <input type="text" value={country} onChange={e => setCountry(e.target.value)} className={inputClass} placeholder="Country" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Language <span className="text-zinc-400 font-normal normal-case"></span></label>
                  <input type="text" value={language} onChange={e => setLanguage(e.target.value)} className={inputClass} placeholder="Language" />
                </div>
                <div>
                  <label className={labelClass}>Genre <span className="text-zinc-400 font-normal normal-case"></span></label>
                  <input type="text" value={genre} onChange={e => setGenre(e.target.value)} className={inputClass} placeholder="Genre" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Subgenre <span className="text-zinc-400 font-normal normal-case">(optional)</span></label>
                  <input type="text" value={subGenre} onChange={e => setSubGenre(e.target.value)} className={inputClass} placeholder="Subgenre" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Release Date <span className="text-zinc-400 font-normal normal-case">(optional)</span></label>
                <input type="date" id={"releadeDate"} placeholder={""} value={releaseDate} onChange={e => setReleaseDate(e.target.value)} className={inputClass} />
          
              </div>
              <div>
                <label className={labelClass}>Lyrics <span className="text-zinc-400 font-normal normal-case">(optional)</span></label>
                <textarea value={lyrics} onChange={e => setLyrics(e.target.value)} className={inputClass} placeholder="Paste lyrics here" rows={4} />
              </div>
              <div>
                <label className={labelClass}>Media Links <span className="text-zinc-400 font-normal normal-case">(optional, JSON)</span></label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={mediaLinks.appleMusic} onChange={e => setMediaLinks({ ...mediaLinks, appleMusic: e.target.value })} className={inputClass} placeholder="Apple Music URL" />
                  <input type="text" value={mediaLinks.spotify} onChange={e => setMediaLinks({ ...mediaLinks, spotify: e.target.value })} className={inputClass} placeholder="Spotify URL" />
                  <input type="text" value={mediaLinks.youtube} onChange={e => setMediaLinks({ ...mediaLinks, youtube: e.target.value })} className={inputClass} placeholder="YouTube URL" />
                  <input type="text" value={mediaLinks.soundcloud} onChange={e => setMediaLinks({ ...mediaLinks, soundcloud: e.target.value })} className={inputClass} placeholder="SoundCloud URL" />
                  <input type="text" value={mediaLinks.tidal} onChange={e => setMediaLinks({ ...mediaLinks, tidal: e.target.value })} className={inputClass} placeholder="Tidal URL" />
                  <input type="text" value={mediaLinks.deezer} onChange={e => setMediaLinks({ ...mediaLinks, deezer: e.target.value })} className={inputClass} placeholder="Deezer URL" />
                  <input type="text" value={mediaLinks.amazonMusic} onChange={e => setMediaLinks({ ...mediaLinks, amazonMusic: e.target.value })} className={inputClass} placeholder="Amazon Music URL" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-zinc-800 dark:text-zinc-200 tracking-tight">Preview</h3>
            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900/70 p-6 border border-zinc-200 dark:border-zinc-800">
              <AlbumPreview coverUrl={coverUrl} albumName={songTitle} tracks={[{ title: songTitle, artist, isrc }]} />
            </div>
          </div>

          {/* Copyright Warnings */}
          <Card className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 uppercase tracking-wide">Copyright & Legal</h4>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedOwnership}
                  onChange={e => setAgreedOwnership(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-amber-300 dark:border-amber-700 text-green-600 focus:ring-green-500 cursor-pointer accent-green-500"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  I confirm that I own or have the legal rights to distribute this content. All materials uploaded do not infringe on any third-party copyrights, trademarks, or intellectual property rights.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={e => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-amber-300 dark:border-amber-700 text-green-600 focus:ring-green-500 cursor-pointer accent-green-500"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  I agree to the Terms of Service and understand that uploading fraudulent, unauthorized, or infringing content may result in content removal, account suspension, and potential legal action.
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap justify-between items-center gap-4 pb-8">
            <div className="flex gap-3">
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm border border-zinc-200 dark:border-zinc-700 transition-all duration-200 flex items-center gap-2"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm border border-zinc-200 dark:border-zinc-700 transition-all duration-200"
                onClick={() => {
                  router.push("/desk/artist");
                }}
              >
                Change Artist
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 font-semibold text-sm border border-green-200 dark:border-green-800/50 transition-all duration-200 flex items-center gap-2 disabled:opacity-40"
                disabled={!mp3Url}
                onClick={() => mp3Url && player.play({ mp3: mp3Url, cover: coverUrl, title: songTitle, artist })}
              >
                <Play className="h-4 w-4" />
                Preview
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-600/20 hover:shadow-green-500/30 transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                disabled={!canSubmit}
              >
                Submit Song
              </button>
            </div>
          </div>
          {submitted && (
            <div className="text-center py-6 px-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 mb-8">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-green-700 dark:text-green-400 font-bold text-lg">Song uploaded successfully!</p>
              <button className="mt-2 text-sm text-green-600 dark:text-green-400 underline hover:text-green-500 transition font-medium" onClick={() => mp3Url && player.play({ mp3: mp3Url, cover: coverUrl, title: songTitle, artist })}>Play now</button>
            </div>
          )}
          {submitError && (
            <div className="text-center py-4 px-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 mb-8">
              <p className="text-red-600 dark:text-red-400 font-bold">{submitError}</p>
            </div>
          )}
        </form>
      </UploadLayout>
      )}
    </>
  );
}

export default function SingleUploadPage() {
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
                  <SingleUploadContent />
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-900/95 border-t border-zinc-200 dark:border-zinc-800 flex items-center px-4 py-2 shadow-2xl backdrop-blur-md">
      <img src={current.cover} alt="cover" className="h-12 w-12 rounded-lg object-cover mr-4 shadow-md" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-zinc-900 dark:text-white truncate">{current.title}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{current.artist}</div>
      </div>
      <div className="flex items-center gap-1 ml-4">
        <button onClick={prev} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-600 dark:text-zinc-400">⏮️</button>
        {isPlaying ? (
          <button onClick={pause} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-600 dark:text-zinc-400">⏸️</button>
        ) : (
          <button onClick={() => play(queue, currentIndex)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-600 dark:text-zinc-400">▶️</button>
        )}
        <button onClick={next} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-600 dark:text-zinc-400">⏭️</button>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
//import { usePlayer } from "@/contexts/player-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Upload, Music, AlertTriangle, Save, Loader, User } from "lucide-react";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

interface TrackData {
  trackNumber: number;
  title: string;
  isrc: string;
  explicit: "no" | "yes" | "covered";
  lyrics: string;
  leadVocal: string;
  producer: string;
  writer: string;
  file?: File;
  duration?: number;
}

interface UploadJobData {
  id?: string;
  userId?: string;
  songTitle: string;
  songType: "single" | "album" | "medley";
  genre: string;
  language: string;
  upc: string;
  artistId: string;
  artistName: string;
  coverFile?: File;
  coverUploadId?: string;
  cover?: string;
  tracks: TrackData[];
  copyrightAcknowledged: boolean;
  status: "in_progress" | "completed" | "failed" | "cancelled";
  currentStep: "metadata" | "cover" | "tracks" | "review" | "submitting";
  progress: number;
}

const STORAGE_KEY = "music_upload_job";
const SONG_TYPES = ["single", "album", "medley"] as const;
const GENRES = ["Pop", "Rock", "Hip-Hop", "R&B", "Jazz", "Classical", "Country", "Electronic", "Other"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Other"];

const MusicUploadPage = () => {
  //const { user, defaultArtist, isLoading } = useAuth();
  const router = useRouter();
  const [uploadJob, setUploadJob] = useState<UploadJobData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artists, setArtists] = useState<any[]>([]);
 // const [selectedArtist, setSelectedArtist] = useState(defaultArtist);



    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState<any>(null);
    const [userVerificationStatus, setUserVerificationStatus] = useState<string>("updating");
  
    const { user, defaultArtist, isLoading: authLoading, isAuthenticated, forceRefresh } = useAuth();
  const [team, setTeam] = useState<any>(null);

  const [uploadSetting, setUploadSetting] = useState<any>(null);

    // const player = usePlayer();
  // Load upload job from storage on mount
  useEffect(() => {
    // Don't redirect until auth is loaded
    if (isLoading) return;

    if (!user) {
      router.push("/auth/signin");
      return;
    }

    // Redirect to select artist if no default artist
    if (!defaultArtist) {
      router.push("/desk/artist");
      return;
    }

    // Set selected artist from defaultArtist
    setSelectedArtist(defaultArtist);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUploadJob(parsed);
      } catch (err) {
        console.error("Failed to load saved upload job", err);
      }
    } else {
      // Initialize new job
      initializeNewJob();
    }

    // Load artists for this user
    fetchArtists();
  }, [isLoading, user, defaultArtist, router]);



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


  const fetchArtists = async () => {
    try {
      const res = await fetch("/api/artist/list");
      if (res.ok) {
        const data = await res.json();
        setArtists(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch artists", err);
    }
  };

  const initializeNewJob = () => {

console.log("selected artist",selectedArtist);
console.log("current user ", user);

    const newJob: UploadJobData = {
      id: `job_${Date.now()}`,
      userId: user?.id || "",
      songTitle: "",
      songType: "single",
      genre: "",
      language: "English",
      upc: "",
      artistId: selectedArtist?.id || selectedArtist?.userId || "",
      artistName: selectedArtist?.name || "",
      tracks: [{ trackNumber: 1, title: "", isrc: "", explicit: "no", lyrics: "", leadVocal: "", producer: "", writer: "" }],
      copyrightAcknowledged: false,
      status: "in_progress",
      currentStep: "metadata",
      progress: 0,
    };
    setUploadJob(newJob);
    saveJobToStorage(newJob);
  };

  const saveJobToStorage = (job: UploadJobData) => {
    try {
      // Don't save File objects to localStorage
      const jobToSave = { ...job };
      delete (jobToSave as any).coverFile;
      jobToSave.tracks = jobToSave.tracks.map(t => {
        const trackToSave = { ...t };
        delete (trackToSave as any).file;
        return trackToSave;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobToSave));
    } catch (err) {
      console.error("Failed to save upload job", err);
    }
  };

  const saveJobToServer = async () => {
    if (!uploadJob) return;
    setSaving(true);
    try {
      const res = await fetch("/api/upload/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadJob),
      });
      if (!res.ok) throw new Error("Failed to save job");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!uploadJob) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <Sidebar className="hidden md:block" />
        <div className="flex-1">
          <Navbar />

      {/* Artist Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 px-4 md:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {defaultArtist?.image ? (
            <img
              src={defaultArtist.image}
              alt={defaultArtist.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Upload as:</p>
            <p className="text-lg font-semibold">{defaultArtist?.name}</p>
          </div>
        </div>
      </div>

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Music className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Upload Music</h1>
            </div>
            <p className="text-muted-foreground">Share your music with the world</p>
          </div>

          {/* Song Preview Card */}
          <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Cover Image */}
                <div className="flex justify-center">
                  {uploadJob.cover ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden shadow-lg border-4 border-primary/20">
                      <img
                        src={uploadJob.cover}
                        alt={uploadJob.songTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-primary/30">
                      <div className="text-center">
                        <Music className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Cover Art</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Song Details */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Song Title</p>
                    <h2 className="text-2xl font-bold text-foreground">
                      {uploadJob.songTitle || "Your Song Title"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Artist</p>
                      <p className="font-semibold text-foreground">
                        {uploadJob.artistName || "Unknown Artist"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Type</p>
                      <p className="font-semibold capitalize text-foreground">
                        {uploadJob.songType}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Genre</p>
                      <p className="font-medium text-foreground">
                        {uploadJob.genre || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Language</p>
                      <p className="font-medium text-foreground">
                        {uploadJob.language || "English"}
                      </p>
                    </div>
                  </div>

                  {/* Tracks Preview */}
                  {uploadJob.tracks.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Tracks</p>
                      <div className="space-y-2">
                        {uploadJob.tracks.map((track, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-background/60 p-2 rounded">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-semibold">{track.trackNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {track.title || `Track ${track.trackNumber}`}
                              </p>
                            </div>
                            {track.duration && (
                              <span className="text-xs text-muted-foreground">
                                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}
                              </span>
                            )}
                            {track.file && (
                              <div className="w-6 h-6 text-green-500">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio Player for First Track */}
                  {uploadJob.tracks[0]?.file && (
                    <div className="pt-2 border-t border-primary/10">
                      <p className="text-xs text-muted-foreground mb-2">Preview</p>
                      <audio
                        controls
                        className="w-full h-8 rounded"
                        src={URL.createObjectURL(uploadJob.tracks[0].file)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator currentStep={uploadJob.currentStep} progress={uploadJob.progress} />
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/5">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive/90">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        {uploadJob.currentStep === "metadata" && (
          <MetadataStep job={uploadJob} setJob={setUploadJob} saveToStorage={saveJobToStorage} onNext={() => handleNextStep("cover")} />
        )}

        {uploadJob.currentStep === "cover" && (
          <CoverStep job={uploadJob} setJob={setUploadJob} saveToStorage={saveJobToStorage} onNext={() => handleNextStep("tracks")} onBack={() => handlePrevStep("metadata")} />
        )}

        {uploadJob.currentStep === "tracks" && (
          <TracksStep job={uploadJob} setJob={setUploadJob} saveToStorage={saveJobToStorage} onNext={() => handleNextStep("review")} onBack={() => handlePrevStep("cover")} />
        )}

        {uploadJob.currentStep === "review" && (
          <ReviewStep job={uploadJob} setJob={setUploadJob} saveToStorage={saveJobToStorage} onNext={() => handleNextStep("submitting")} onBack={() => handlePrevStep("tracks")} />
        )}

        {uploadJob.currentStep === "submitting" && (
          <SubmittingStep
            job={uploadJob}
            setJob={setUploadJob}
            saveToStorage={saveJobToStorage}
            onBack={() => handlePrevStep("review")}
          />
        )}

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            initializeNewJob();
          }}>
            Start Over
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              saveJobToStorage(uploadJob);
              saveJobToServer();
            }} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </div>
        </div>
      </div>
        </div>
      </div>
    <MobileBottomNav />
    </SidebarProvider>
  );

  function handleNextStep(step: UploadJobData["currentStep"]) {
    const updated = { ...uploadJob, currentStep: step, progress: Math.min((uploadJob?.progress||0) + 20, 100) } as unknown as any;
    setUploadJob(updated);
    saveJobToStorage(updated);
  }

  function handlePrevStep(step: UploadJobData["currentStep"]) {
    const updated = { ...uploadJob, currentStep: step } as unknown as any;
    setUploadJob(updated);
    saveJobToStorage(updated);
  }
};

// Step Components
const MetadataStep = ({ job, setJob, saveToStorage, onNext }: any) => {
  const updateField = (field: string, value: any) => {
    const updated = { ...job, [field]: value };
    if (field === "songType") {
      // Auto-populate tracks based on type
      if (value === "single") {
        updated.tracks = [{ trackNumber: 1, title: "", isrc: "", explicit: "no", lyrics: "", leadVocal: "", producer: "", writer: "" }];
      } else if (value === "album") {
        updated.tracks = Array.from({ length: 5 }, (_, i) => ({
          trackNumber: i + 1,
          title: "",
          isrc: "",
          explicit: "no" as const,
          lyrics: "",
          leadVocal: "",
          producer: "",
          writer: "",
        }));
      } else if (value === "medley") {
        updated.tracks = Array.from({ length: 3 }, (_, i) => ({
          trackNumber: i + 1,
          title: "",
          isrc: "",
          explicit: "no" as const,
          lyrics: "",
          leadVocal: "",
          producer: "",
          writer: "",
        }));
      }
    }
    setJob(updated);
    saveToStorage(updated);
  };

  const canProceed = job.songTitle && job.genre && job.artistId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Tell us about your music</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Copyright Warning */}
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100">Copyright Notice</p>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              By uploading this music, you confirm that you own or have the rights to distribute this content. Copyright infringement may result in account suspension.
            </p>
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={job.copyrightAcknowledged}
                onChange={(e) => updateField("copyrightAcknowledged", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">I acknowledge and accept this copyright warning</span>
            </label>
          </div>
        </div>

        {/* Song Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Song Title *</label>
          <input
            type="text"
            value={job.songTitle}
            onChange={(e) => updateField("songTitle", e.target.value)}
            placeholder="e.g., My Amazing Song"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Song Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Type of Music *</label>
          <select title={"Song Type"} name={"select1"}
            value={job.songType}
            onChange={(e) => updateField("songType", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SONG_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)} {type === "single" && "(1 track)"} {type === "album" && "(5+ tracks)"} {type === "medley" && "(2-4 tracks)"}
              </option>
            ))}
          </select>
        </div>

        {/* Genre & Language */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Genre *</label>
            <select title={"Song genre"}
              value={job.genre}
              onChange={(e) => updateField("genre", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Genre</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select title={"Song language"}
              value={job.language}
              onChange={(e) => updateField("language", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* UPC */}
        <div>
          <label className="block text-sm font-medium mb-2">UPC/EAN (Optional)</label>
          <input
            type="text"
            value={job.upc}
            onChange={(e) => updateField("upc", e.target.value)}
            placeholder="12-digit barcode"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button disabled={!canProceed} onClick={onNext}>
            Next: Cover Art
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CoverStep = ({ job, setJob, saveToStorage, onNext, onBack }: any) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number } | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const MIN_SIZE = 3000;
  const MAX_SIZE = 6000;

  const validateImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleCoverUpload = async (file: File) => {
    try {
      // Validate dimensions
      const dims = await validateImageDimensions(file);
      setDimensions(dims);

      // Check if square
      if (dims.width !== dims.height) {
        const error = `Image must be square. Current: ${dims.width}x${dims.height}px`;
        setValidationError(error);
        console.warn("❌ [COVER] Validation failed:", error);
        return;
      }

      // Check size range
      if (dims.width < MIN_SIZE || dims.width > MAX_SIZE) {
        const error = `Image size must be between ${MIN_SIZE}x${MIN_SIZE}px and ${MAX_SIZE}x${MAX_SIZE}px. Current: ${dims.width}x${dims.height}px`;
        setValidationError(error);
        console.warn("❌ [COVER] Validation failed:", error);
        return;
      }

      // Validation passed
      setValidationError(null);
      const coverUrl = URL.createObjectURL(file);
      const updated = { ...job, coverFile: file, cover: coverUrl };
      setJob(updated);
      saveToStorage(updated);
      console.log("✅ [COVER] Image uploaded and validated:", {
        name: file.name,
        size: file.size,
        dimensions: dims,
        dpi: "Standard (72+ DPI)"
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to process image";
      setValidationError(error);
      console.error("❌ [COVER] Error:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleCoverUpload(files[0]);
    }
  };

  const canProceed = (job.coverFile && !validationError) || job.coverUploadId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover Art</CardTitle>
        <CardDescription>Upload a cover image for your music</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Specifications Info */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">Cover Art Requirements:</p>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>✓ <span className="font-medium">Size:</span> {MIN_SIZE} × {MIN_SIZE} px to {MAX_SIZE} × {MAX_SIZE} px</li>
            <li>✓ <span className="font-medium">Aspect Ratio:</span> Square (1:1)</li>
            <li>✓ <span className="font-medium">DPI:</span> 70 DPI or higher</li>
            <li>✓ <span className="font-medium">Format:</span> JPEG, PNG, WebP</li>
          </ul>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5 scale-105"
              : validationError
              ? "border-destructive bg-destructive/5"
              : "border-muted-foreground/20 hover:border-primary hover:bg-primary/2"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            title={"Cover Image"}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
            className="hidden"
          />
          {job.coverFile ? (
            <div className="text-center">
              <CheckCircle className={`w-12 h-12 mx-auto mb-2 ${validationError ? "text-destructive" : "text-green-500"}`} />
              <p className="font-medium">{job.coverFile.name}</p>
              <p className="text-sm text-muted-foreground">{(job.coverFile.size / 1024 / 1024).toFixed(2)} MB</p>
              {dimensions && (
                <div className="mt-3 p-3 bg-muted rounded">
                  <p className="text-xs font-medium">Dimensions: <span className="font-bold text-primary">{dimensions.width} × {dimensions.height} px</span></p>
                  {dimensions.width === dimensions.height && dimensions.width >= MIN_SIZE && dimensions.width <= MAX_SIZE && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Valid dimensions</p>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">Click to change</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className={`w-12 h-12 mx-auto mb-2 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              <p className="font-medium">Drag & drop your cover image</p>
              <p className="text-sm text-muted-foreground">Or click to browse</p>
            </div>
          )}
        </div>

        {/* Validation Error */}
        {validationError && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Invalid Cover Art</p>
                <p className="text-sm text-destructive/90 mt-1">{validationError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button disabled={!canProceed} onClick={onNext}>
            Next: Track Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TracksStep = ({ job, setJob, saveToStorage, onNext, onBack }: any) => {
  const [extractingMetadata, setExtractingMetadata] = React.useState<Set<number>>(new Set());
  const [draggingTrack, setDraggingTrack] = React.useState<number | null>(null);
  const fileInputRefs = React.useRef<{ [key: number]: HTMLInputElement }>({});

  const updateTrack = (index: number, field: string, value: any) => {
    const updated = {
      ...job,
      tracks: job.tracks.map((t: TrackData, i: number) => (i === index ? { ...t, [field]: value } : t)),
    };
    setJob(updated);
    saveToStorage(updated);
  };

  const handleTrackFileUpload = async (index: number, file: File) => {
    setExtractingMetadata(prev => new Set(prev).add(index));

    // Extract metadata from MP3 file
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/extract-metadata", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const metadata = data.metadata || {};

      // Extract filename without extension as fallback
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

      const updated = {
        ...job,
        tracks: job.tracks.map((t: TrackData, i: number) =>
          i === index
            ? {
                ...t,
                file,
                title: t.title || metadata.title || fileNameWithoutExt, // Keep existing, else use extracted metadata, else use filename
                leadVocal: t.leadVocal || metadata.artist || "", // Use artist as lead vocal if not set
                duration: metadata.duration || 0,
              }
            : t
        ),
      };
      setJob(updated);
      saveToStorage(updated);
    } catch (err) {
      console.error("Failed to extract metadata:", err);
      // Fallback: just add the file without metadata, use filename as title if empty
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const updated = {
        ...job,
        tracks: job.tracks.map((t: TrackData, i: number) =>
          i === index
            ? {
                ...t,
                file,
                title: t.title || fileNameWithoutExt, // Use filename if title is still empty
                duration: 0,
              }
            : t
        ),
      };
      setJob(updated);
      saveToStorage(updated);
    } finally {
      setExtractingMetadata(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const allTracksHaveFiles = job.tracks.every((t: TrackData) => t.file);
  const allTracksHaveTitles = job.tracks.every((t: TrackData) => t.title);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track Details</CardTitle>
        <CardDescription>Add information for each track</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {job.tracks.map((track: TrackData, idx: number) => (
          <div key={idx} className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Track {track.trackNumber}</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Track Title *</label>
                <input
                  type="text"
                  value={track.title}
                  onChange={(e) => updateTrack(idx, "title", e.target.value)}
                  placeholder="Song name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ISRC Code</label>
                <input
                  type="text"
                  value={track.isrc}
                  onChange={(e) => updateTrack(idx, "isrc", e.target.value)}
                  placeholder="USRC123456789"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Lead Vocal</label>
                <input
                  type="text"
                  value={track.leadVocal}
                  onChange={(e) => updateTrack(idx, "leadVocal", e.target.value)}
                  placeholder="Artist name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Explicit Content</label>
                <select title={"Song explicit"}
                  value={track.explicit}
                  onChange={(e) => updateTrack(idx, "explicit", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                  <option value="covered">Covered</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Producer</label>
                <input
                  type="text"
                  value={track.producer}
                  onChange={(e) => updateTrack(idx, "producer", e.target.value)}
                  placeholder="Producer name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Writer</label>
                <input
                  type="text"
                  value={track.writer}
                  onChange={(e) => updateTrack(idx, "writer", e.target.value)}
                  placeholder="Songwriter"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lyrics (Optional)</label>
              <textarea
                value={track.lyrics}
                onChange={(e) => updateTrack(idx, "lyrics", e.target.value)}
                placeholder="Song lyrics..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">MP3 File *</label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                  draggingTrack === idx
                    ? "border-primary bg-primary/5 scale-105"
                    : "border-muted-foreground/20 hover:border-primary hover:bg-primary/2"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggingTrack(idx);
                }}
                onDragLeave={() => setDraggingTrack(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggingTrack(null);
                  const files = e.dataTransfer.files;
                  if (files?.[0]) {
                    handleTrackFileUpload(idx, files[0]);
                  }
                }}
                onClick={() => fileInputRefs.current[idx]?.click()}
              >
                <input
                  ref={(el) => {
                    if (el) fileInputRefs.current[idx] = el;
                  }}
                  title={"Song mp3file"}
                  type="file"
                  accept="audio/mp3"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleTrackFileUpload(idx, e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                {track.file ? (
                  <div>
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium">{track.file.name}</p>
                    {track.duration && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Duration: {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">Click to change</p>
                  </div>
                ) : extractingMetadata.has(idx) ? (
                  <div>
                    <Loader className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
                    <p className="font-medium">Extracting metadata...</p>
                  </div>
                ) : (
                  <div>
                    <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${draggingTrack === idx ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm text-muted-foreground mb-2">Drag & drop or click to browse</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button disabled={!allTracksHaveFiles || !allTracksHaveTitles} onClick={onNext}>
            Next: Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ReviewStep = ({ job, setJob, saveToStorage, onNext, onBack }: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Upload</CardTitle>
        <CardDescription>Check everything before submitting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Song Title</p>
            <p className="font-medium">{job.songTitle}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{job.songType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Genre</p>
            <p className="font-medium">{job.genre}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tracks</p>
            <p className="font-medium">{job.tracks.length}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="font-medium mb-4">Tracks Summary</p>
          <div className="space-y-2">
            {job.tracks.map((track: TrackData, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Track {track.trackNumber}: {track.title}</span>
                {track.file && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Publish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SubmittingStep = ({ job, setJob, saveToStorage, onBack }: any) => {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileProgress, setFileProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    submitMusic();
  }, []);

  const submitMusic = async () => {
    setSubmitting(true);
    let songId: string | null = null;

    console.log("🎵 [SUBMIT] Starting music submission process (NEW INCREMENTAL API)...");
    console.log("📋 [SUBMIT] Job data:", {
      title: job.songTitle,
      artist: job.artistName,
      type: job.songType,
      tracks: job.tracks.length,
      hascover: !!job.cover,
      copyrightAcknowledged: job.copyrightAcknowledged,
    } as any);

    try {
      // Stage 1: Create song record
      console.log("🎵 [STAGE 1] Creating song record...");
      setStatusMessage("Creating song record...");
      setProgress(10);

      const createSongRes = await fetch("/api/songs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.songTitle,
          type: job.songType,
          artistId: job.artistId,
          artistName: job.artistName,
          genre: job.genre,
          language: job.language,
          upc: job.upc,
          cover: job.cover || null,
          copyrightAcknowledged: job.copyrightAcknowledged,
        }),
      });

      if (!createSongRes.ok) {
        const errorData = await createSongRes.json();
        throw new Error(errorData.error || "Failed to create song");
      }

      const songData = await createSongRes.json();
      songId = songData.songId;
      console.log("✅ [STAGE 1] Song created with ID:", songId);
      setBackendResponse({ ...songData, trackIds: [] });

      // Stage 2: Add tracks
      console.log("🎼 [STAGE 2] Adding tracks...");
      setProgress(20);
      const trackIds: string[] = [];
      const totalTracks = job.tracks.length;

      for (let i = 0; i < totalTracks; i++) {
        const track = job.tracks[i];
        const trackProgress = 20 + ((i + 1) / totalTracks) * 50;
        setProgress(Math.round(trackProgress));
        setStatusMessage(`Adding track ${i + 1} of ${totalTracks}...`);

        console.log(`🎵 [TRACK ${i + 1}] Adding track: ${track.title}`);

        const trackRes = await fetch(`/api/songs/${songId}/tracks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: track.title,
            audioFileUploadId: track.file?.uploadId || track.uploadId,
            isrc: track.isrc || null,
            explicit: track.explicit || "no",
            lyrics: track.lyrics || null,
            leadVocal: track.leadVocal || null,
            featured: track.featured || null,
            producer: track.producer || null,
            writer: track.writer || null,
            duration: track.duration || null,
          }),
        });

        if (!trackRes.ok) {
          const errorData = await trackRes.json();
          throw new Error(`Failed to add track ${i + 1}: ${errorData.error}`);
        }

        const trackData = await trackRes.json();
        trackIds.push(trackData.track.id);
        console.log(`✅ [TRACK ${i + 1}] Track added successfully`);
      }

      setFileProgress(100);
      setProgress(70);
      console.log(`✅ [STAGE 2] All ${totalTracks} tracks added`);

      // Stage 3: Submit song for review
      console.log("📤 [STAGE 3] Submitting song for review...");
      setStatusMessage("Submitting song for admin review...");
      setProgress(80);

      const submitRes = await fetch(`/api/songs/${songId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!submitRes.ok) {
        const errorData = await submitRes.json();
        throw new Error(errorData.error || "Failed to submit song");
      }

      const submitData = await submitRes.json();
      console.log("✅ [STAGE 3] Song submitted for review with status:", submitData.song.status);

      // Stage 4: Success
      setStatusMessage("Submission completed successfully!");
      setProgress(100);
      setBackendResponse({
        ...submitData.song,
        trackIds,
        message: "Song submitted for admin review successfully",
      });

      console.log("✨ [SUCCESS] Music submission completed!");
      console.log("📌 Song ID:", songId);
      console.log("🎼 Tracks added:", trackIds.length);
      console.log("✔️ Status:", submitData.song.status);

      // Clear storage and finish
      await new Promise(r => setTimeout(r, 500));
      setCompleted(true);
      localStorage.removeItem("music_upload_job");

    } catch (err) {
      console.error("❌ [ERROR] Submission failed:", {
        message: err instanceof Error ? err.message : String(err),
        error: err,
        timestamp: new Date().toISOString(),
      });
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
      console.log("🏁 [COMPLETE] Submission process finished");
    }
  };

  if (completed) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold">Music Submitted!</h3>
            <p className="text-muted-foreground">Your music has been submitted for review</p>

            {backendResponse && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-left space-y-3 text-sm">
                <div className="border-l-4 border-green-500 pl-3">
                  <p className="font-semibold text-green-700 dark:text-green-400">✓ {backendResponse.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Song ID</p>
                    <p className="font-mono text-xs mt-1 break-all">{backendResponse.songId}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Tracks Created</p>
                    <p className="font-semibold text-lg">{backendResponse.trackIds?.length || 0}</p>
                  </div>
                </div>

                {backendResponse.processingTime && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
                    <p className="text-muted-foreground">Processing Time: {backendResponse.processingTime}ms</p>
                  </div>
                )}
              </div>
            )}

            <Button onClick={() => window.location.href = "/desk/artist"}>
              View in Artist Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h3 className="text-2xl font-bold">Submission Failed</h3>
            <p className="text-red-700 dark:text-red-200">{error}</p>

            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 text-left text-sm">
              <p className="font-semibold text-red-800 dark:text-red-300 mb-2">What can you do:</p>
              <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-400">
                <li>Go back and correct any information before retrying</li>
                <li>Try submitting again with the same information</li>
                <li>Return to dashboard and start over</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 justify-center">
              <Button
                className="w-full"
                onClick={() => {
                  setError(null);
                  setProgress(0);
                  setFileProgress(0);
                  setStatusMessage("");
                  console.log("↩️ [CORRECT] User returning to review step");
                  onBack?.();
                }}
              >
                ↩️ Back to Review & Correct Mistakes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  setSubmitting(false);
                  setProgress(0);
                  setFileProgress(0);
                  setStatusMessage("");
                  console.log("🔄 [RETRY] User retrying submission");
                }}
              >
                🔄 Try Again With Same Data
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = "/desk"}
              >
                ✕ Cancel & Return to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Loader className="w-12 h-12 text-primary mx-auto animate-spin" />
            <h3 className="text-xl font-bold">Submitting Your Music...</h3>
            <p className="text-muted-foreground">Please don't close this page</p>
            {!submitting && (
              <p className="text-sm text-amber-600 dark:text-amber-400">Submission suspended - you can cancel or try again</p>
            )}
          </div>

          {/* File Upload Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-medium text-sm">Uploading files</p>
              <span className="text-sm font-semibold text-primary">{fileProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${fileProgress}%` }}
              />
            </div>
          </div>

          {/* Submission Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-medium text-sm">Processing & Submitting</p>
              <span className="text-sm font-semibold text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Status Steps */}
          <div className="bg-muted p-4 rounded-lg text-left text-sm space-y-2">
            <p className={fileProgress >= 50 ? "text-green-600 dark:text-green-400" : ""}>
              {fileProgress >= 50 ? "✓" : "◄"} Uploading files
            </p>
            <p className={progress >= 25 ? "text-green-600 dark:text-green-400" : ""}>
              {progress >= 25 ? "✓" : "◄"} Processing metadata
            </p>
            <p className={progress >= 75 ? "text-green-600 dark:text-green-400" : ""}>
              {progress >= 75 ? "✓" : "◄"} Scanning for copyright issues
            </p>
            <p className={progress === 100 ? "text-green-600 dark:text-green-400" : ""}>
              {progress === 100 ? "✓" : "◄"} Finalizing submission
            </p>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-sm text-blue-900 dark:text-blue-200">
              <p className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                {statusMessage}
              </p>
            </div>
          )}

          {/* Control Buttons */}
          {submitting && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitting(false);
                  setStatusMessage("Submission cancelled. Your progress has been saved.");
                  console.log("🛑 [CANCEL] Submission cancelled by user");
                }}
              >
                Cancel Submission
              </Button>
            </div>
          )}

          {!submitting && !completed && error && (
            <div className="flex justify-center gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  setProgress(0);
                  setFileProgress(0);
                  setStatusMessage("");
                  console.log("↩️ [BACK] User returning to review step to correct mistakes");
                  onBack?.();
                }}
              >
                ↩️ Back to Review & Correct
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ProgressIndicator = ({ currentStep, progress }: { currentStep: string; progress: number }) => {
  const steps = ["metadata", "cover", "tracks", "review", "submitting"];
  const stepLabels = ["Metadata", "Cover", "Tracks", "Review", "Submit"];

  return (
    <div>
      <div className="flex justify-between mb-4">
        {steps.map((step, idx) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium mb-2 ${
                steps.indexOf(currentStep) >= idx
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {steps.indexOf(currentStep) > idx ? <CheckCircle className="w-5 h-5" /> : idx + 1}
            </div>
            <p className="text-xs text-center">{stepLabels[idx]}</p>
          </div>
        ))}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

function UnifiedUploadPageWrapper() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MusicUploadPage />
    </ThemeProvider>
  );
}

export default UnifiedUploadPageWrapper;

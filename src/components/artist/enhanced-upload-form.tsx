"use client";

import React, { useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadPreview } from "@/components/album/upload-preview";
import { useUploadState, getFileNameWithoutExtension, prefillMetadata } from "@/hooks/use-upload-state";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedUploadFormProps {
  /**
   * Selected artist data for prefilling
   */
  selectedArtist?: any;

  /**
   * Current user data for prefilling
   */
  userData?: any;

  /**
   * User profile data for prefilling
   */
  userProfileData?: any;

  /**
   * Callback when cover file is selected
   */
  onCoverUpload?: (file: File) => void;

  /**
   * Callback when audio file is selected
   */
  onAudioUpload?: (file: File) => void;

  /**
   * Show restore previous session option
   */
  showRestoreOption?: boolean;

  /**
   * Children render prop
   */
  children?: (state: any, updateState: any) => React.ReactNode;
}

/**
 * Enhanced Upload Form with persistent state management
 */
export function EnhancedUploadForm({
  selectedArtist,
  userData,
  userProfileData,
  onCoverUpload,
  onAudioUpload,
  showRestoreOption = true,
  children,
}: EnhancedUploadFormProps) {
  const { state, updateState, clearState, resetFiles, hasSavedState, isLoaded } =
    useUploadState();

  // Prefill metadata on mount
  useEffect(() => {
    if (!isLoaded) return;

    // Only prefill if no saved state exists
    if (!hasSavedState()) {
      const prefilled = prefillMetadata(selectedArtist, userData, userProfileData);
      updateState(prefilled);
    }
  }, [isLoaded, selectedArtist, userData, userProfileData, updateState, hasSavedState]);

  // Handle cover file selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Update state with file name
    updateState({
      coverFileName: file.name,
      // Auto-fill song title from cover file name if not already set
      songTitle: state.songTitle || getFileNameWithoutExtension(file.name),
    });

    onCoverUpload?.(file);
  };

  // Handle audio file selection
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Update state with file name
    updateState({
      mp3FileName: file.name,
      // Auto-fill track title from mp3 file name if not already set
      trackTitle: state.trackTitle || getFileNameWithoutExtension(file.name),
    });

    onAudioUpload?.(file);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading upload state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Restore Previous Session Banner */}
      {showRestoreOption && hasSavedState() && (
        <Alert className="border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <span>
                We found your previous upload session from{" "}
                {new Date(state.lastSaved).toLocaleDateString()}.
                <br />
                <span className="text-sm">
                  Your progress has been restored. You can continue from where you left off.
                </span>
              </span>
              <Button
                size="sm"
                variant="outline"
                className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => {
                  if (confirm("Are you sure? This will clear your saved progress.")) {
                    clearState();
                  }
                }}
              >
                Start Fresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview with Player */}
      {state.coverUrl && state.mp3Url && (
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="max-w-md mx-auto">
              <UploadPreview
                coverUrl={state.coverUrl}
                title={state.songTitle || "Untitled"}
                artist={state.artist}
                audioUrl={state.mp3Url}
                size="medium"
              />
              <div className="mt-4 text-center text-sm">
                <p className="text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold">Song:</span> {state.songTitle || "Not set"}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold">Track:</span> {state.trackTitle || "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cover Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Cover Art
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="block w-full text-sm text-zinc-600 dark:text-zinc-400
              file:mr-4 file:py-2 file:px-4 file:rounded-lg
              file:border-0 file:text-sm file:font-semibold
              file:bg-green-500 file:text-white
              hover:file:bg-green-600"
          />
          {state.coverFileName && (
            <p className="text-xs text-zinc-500">
              📁 {state.coverFileName}
              {state.coverProgress > 0 && state.coverProgress < 100 && (
                <span className="ml-2 text-green-600">({state.coverProgress}%)</span>
              )}
              {state.coverProgress === 100 && <span className="ml-2 text-green-600">✓</span>}
            </p>
          )}
        </div>

        {/* Audio Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Audio File
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioChange}
            className="block w-full text-sm text-zinc-600 dark:text-zinc-400
              file:mr-4 file:py-2 file:px-4 file:rounded-lg
              file:border-0 file:text-sm file:font-semibold
              file:bg-green-500 file:text-white
              hover:file:bg-green-600"
          />
          {state.mp3FileName && (
            <p className="text-xs text-zinc-500">
              🎵 {state.mp3FileName}
              {state.audioProgress > 0 && state.audioProgress < 100 && (
                <span className="ml-2 text-green-600">({state.audioProgress}%)</span>
              )}
              {state.audioProgress === 100 && <span className="ml-2 text-green-600">✓</span>}
            </p>
          )}
        </div>
      </div>

      {/* Form Fields */}
      {children?.(state, updateState)}

      {/* Session Info */}
      <div className="text-xs text-zinc-500 dark:text-zinc-500 text-right">
        Last saved: {new Date(state.lastSaved).toLocaleTimeString()}
      </div>
    </div>
  );
}

/**
 * Persistent Upload State Summary Component
 * Shows user what data is saved
 */
export function UploadStateSummary({ state }: { state: any }) {
  return (
    <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-4">
        <h4 className="font-semibold mb-3 text-sm text-zinc-900 dark:text-white">
          Upload Progress
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-zinc-600 dark:text-zinc-400">Cover:</span>
            {state.coverUrl ? (
              <span className="ml-1 text-green-600 dark:text-green-400">✓</span>
            ) : (
              <span className="ml-1 text-zinc-400">○</span>
            )}
          </div>
          <div>
            <span className="text-zinc-600 dark:text-zinc-400">Audio:</span>
            {state.mp3Url ? (
              <span className="ml-1 text-green-600 dark:text-green-400">✓</span>
            ) : (
              <span className="ml-1 text-zinc-400">○</span>
            )}
          </div>
          <div>
            <span className="text-zinc-600 dark:text-zinc-400">Title:</span>
            {state.songTitle ? (
              <span className="ml-1 text-green-600 dark:text-green-400">✓</span>
            ) : (
              <span className="ml-1 text-zinc-400">○</span>
            )}
          </div>
          <div>
            <span className="text-zinc-600 dark:text-zinc-400">Track:</span>
            {state.trackTitle ? (
              <span className="ml-1 text-green-600 dark:text-green-400">✓</span>
            ) : (
              <span className="ml-1 text-zinc-400">○</span>
            )}
          </div>
          <div>
            <span className="text-zinc-600 dark:text-zinc-400">Artist:</span>
            {state.artist ? (
              <span className="ml-1 text-green-600 dark:text-green-400">✓</span>
            ) : (
              <span className="ml-1 text-zinc-400">○</span>
            )}
          </div>
          <div>
            <span className="text-zinc-600 dark:text-zinc-400">Producer:</span>
            {state.producer ? (
              <span className="ml-1 text-green-600 dark:text-green-400">✓</span>
            ) : (
              <span className="ml-1 text-zinc-400">○</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

export interface UploadState {
  // Files
  coverUrl: string;
  coverFileName: string;
  mp3Url: string;
  mp3FileName: string;
  audioProgress: number;
  coverProgress: number;

  // Song Info
  songTitle: string;
  artist: string;
  trackTitle: string;
  isrc: string;
  upc: string;

  // Metadata
  producer: string;
  songwriter: string;
  writer: string;
  studio: string;
  recordLabel: string;
  genre: string;
  subGenre: string;
  language: string;
  country: string;
  city: string;
  explicit: string;
  releaseDate: string;

  // Additional Info
  info: string;
  lyrics: string;
  mediaLinks: {
    appleMusic: string;
    spotify: string;
    youtube: string;
    soundcloud: string;
    tidal: string;
    deezer: string;
    amazonMusic: string;
  };

  // Status
  submitted: boolean;
  audioUploading: boolean;
  coverUploading: boolean;
  rejectionFlag: boolean;
  rejectionReasons: string[];

  // Agreements
  agreedOwnership: boolean;
  agreedTerms: boolean;

  // Timestamps
  lastSaved: number;
}

const STORAGE_KEY = "singft_upload_state";
const STORAGE_TIMESTAMP_KEY = "singft_upload_timestamp";
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

const DEFAULT_STATE: UploadState = {
  coverUrl: "",
  coverFileName: "",
  mp3Url: "",
  mp3FileName: "",
  audioProgress: 0,
  coverProgress: 0,

  songTitle: "",
  artist: "",
  trackTitle: "",
  isrc: "",
  upc: "",

  producer: "",
  songwriter: "",
  writer: "",
  studio: "",
  recordLabel: "",
  genre: "",
  subGenre: "",
  language: "English",
  country: "",
  city: "",
  explicit: "no",
  releaseDate: new Date().toISOString().split("T")[0],

  info: "",
  lyrics: "",
  mediaLinks: {
    appleMusic: "",
    spotify: "",
    youtube: "",
    soundcloud: "",
    tidal: "",
    deezer: "",
    amazonMusic: "",
  },

  submitted: false,
  audioUploading: false,
  coverUploading: false,
  rejectionFlag: false,
  rejectionReasons: [],

  agreedOwnership: false,
  agreedTerms: false,

  lastSaved: Date.now(),
};

/**
 * Custom hook for managing persistent upload state
 * Automatically saves state to localStorage and loads on mount
 */
export function useUploadState() {
  const [state, setState] = useState<UploadState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const loadState = () => {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        const savedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);

        if (savedState && savedTimestamp) {
          const timestamp = parseInt(savedTimestamp, 10);
          const now = Date.now();

          // Check if session expired (24 hours)
          if (now - timestamp > SESSION_TIMEOUT) {
            // Clear expired state
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
            setIsLoaded(true);
            return;
          }

          const parsedState = JSON.parse(savedState);
          setState((prev) => ({ ...prev, ...parsedState }));
        }
      } catch (error) {
        console.error("Error loading upload state:", error);
      }
      setIsLoaded(true);
    };

    loadState();
  }, []);

  // Auto-save state to localStorage
  useEffect(() => {
    if (!isLoaded) return;

    const saveState = () => {
      try {
        const stateToSave = {
          ...state,
          lastSaved: Date.now(),
          // Don't save file uploads (they're temporary)
          audioProgress: 0,
          coverProgress: 0,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
      } catch (error) {
        console.error("Error saving upload state:", error);
      }
    };

    // Debounce saves to every 2 seconds
    const timeout = setTimeout(saveState, 2000);
    return () => clearTimeout(timeout);
  }, [state, isLoaded]);

  // Update state helper
  const updateState = useCallback((updates: Partial<UploadState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Clear state
  const clearState = useCallback(() => {
    setState(DEFAULT_STATE);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  }, []);

  // Reset files but keep metadata
  const resetFiles = useCallback(() => {
    setState((prev) => ({
      ...prev,
      coverUrl: "",
      coverFileName: "",
      mp3Url: "",
      mp3FileName: "",
      audioProgress: 0,
      coverProgress: 0,
      submitted: false,
    }));
  }, []);

  // Check if there's saved state
  const hasSavedState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);

      if (!savedState || !savedTimestamp) return false;

      const timestamp = parseInt(savedTimestamp, 10);
      const now = Date.now();

      return now - timestamp <= SESSION_TIMEOUT;
    } catch {
      return false;
    }
  }, []);

  return {
    state,
    updateState,
    clearState,
    resetFiles,
    hasSavedState,
    isLoaded,
  };
}

/**
 * Extract file name without extension
 */
export function getFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, "");
}

/**
 * Prefill metadata from artist and user data
 */
export function prefillMetadata(
  artistData?: any,
  userData?: any,
  userProfileData?: any
): Partial<UploadState> {
  const prefilled: Partial<UploadState> = {};

  // Artist data has priority
  if (artistData?.profile) {
    if (artistData.profile.genre) prefilled.genre = artistData.profile.genre;
    if (artistData.profile.subGenre)
      prefilled.subGenre = artistData.profile.subGenre;
    if (artistData.profile.country)
      prefilled.country = artistData.profile.country;
    if (artistData.profile.city) prefilled.city = artistData.profile.city;
  }

  // Then artist itself
  if (artistData) {
    if (artistData.genre) prefilled.genre = artistData.genre;
    if (artistData.country) prefilled.country = artistData.country;
    if (artistData.city) prefilled.city = artistData.city;
    if (artistData.recordLabel)
      prefilled.recordLabel = artistData.recordLabel;
  }

  // Then user data
  if (userData) {
    if (userData.country) prefilled.country = prefilled.country || userData.country;
    if (userData.city) prefilled.city = prefilled.city || userData.city;
  }

  // Then user profile
  if (userProfileData) {
    if (userProfileData.country)
      prefilled.country = prefilled.country || userProfileData.country;
    if (userProfileData.city)
      prefilled.city = prefilled.city || userProfileData.city;
  }

  return prefilled;
}

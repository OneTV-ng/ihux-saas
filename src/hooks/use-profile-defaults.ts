/**
 * Hook to fetch profile defaults for song/track submission
 * Auto-fills form with cascading defaults: Artist Profile → Artist → User Profile → User
 */

import { useEffect, useState } from 'react';

export interface ProfileDefaults {
  genre?: string;
  subGenre?: string;
  producer?: string;
  songwriter?: string;
  writer?: string;
  studio?: string;
  recordLabel?: string;
  language?: string;
  country?: string;
  city?: string;
  artistName?: string;
  displayName?: string;
  name?: string;
  email?: string;
  type?: string;
  explicit?: string;
  songTitle?: string;
  trackTitle?: string;
}

interface UseProfileDefaultsOptions {
  userId?: string;
  artistId?: string;
  coverFileName?: string;
  mp3FileName?: string;
  enabled?: boolean;
}

export function useProfileDefaults(options: UseProfileDefaultsOptions) {
  const {
    userId,
    artistId,
    coverFileName,
    mp3FileName,
    enabled = true,
  } = options;

  const [defaults, setDefaults] = useState<ProfileDefaults>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !userId) return;

    const fetchDefaults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append('userId', userId);
        if (artistId) params.append('artistId', artistId);
        if (coverFileName) params.append('coverFileName', coverFileName);
        if (mp3FileName) params.append('mp3FileName', mp3FileName);

        const response = await fetch(`/api/profile/defaults?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch profile defaults');
        }

        const data = await response.json();
        setDefaults(data.defaults || {});
      } catch (err) {
        console.error('Error fetching profile defaults:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDefaults({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaults();
  }, [userId, artistId, coverFileName, mp3FileName, enabled]);

  return {
    defaults,
    isLoading,
    error,

    // Convenience getters with fallbacks
    genre: defaults.genre,
    producer: defaults.producer,
    songwriter: defaults.songwriter,
    writer: defaults.writer,
    recordLabel: defaults.recordLabel,
    country: defaults.country,
    language: defaults.language || 'English',
    songTitle: defaults.songTitle,
    trackTitle: defaults.trackTitle,
  };
}

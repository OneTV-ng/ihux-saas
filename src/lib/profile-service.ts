/**
 * Profile Service - Get default values for song/track submission
 * Cascades through: Artist Profile → Artist → User Profile → User
 */

import { db } from '@/db';
import { artists, artistProfiles, users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface ProfileDefaults {
  // Song defaults
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

  // Artist info
  artistName?: string;
  displayName?: string;

  // User info
  name?: string;
  email?: string;
}

/**
 * Get profile defaults for a song/track submission
 * Cascades: Artist Profile → Artist → User Profile → User
 */
export async function getProfileDefaults(
  userId: string,
  artistId?: string
): Promise<ProfileDefaults> {
  const defaults: ProfileDefaults = {};

  try {
    // 1. Fetch Artist Profile (highest priority)
    if (artistId) {
      const artistProfile = await db.query.artistProfiles.findFirst({
        where: eq(artistProfiles.artistId, artistId),
      });

      if (artistProfile) {
        if (artistProfile.genre) defaults.genre = artistProfile.genre;
        if (artistProfile.subGenre) defaults.subGenre = artistProfile.subGenre;
        if (artistProfile.producer) defaults.producer = artistProfile.producer;
        if (artistProfile.songwriter) defaults.songwriter = artistProfile.songwriter;
        if (artistProfile.studio) defaults.studio = artistProfile.studio;
        if (artistProfile.recordLabel) defaults.recordLabel = artistProfile.recordLabel;
        if (artistProfile.country) defaults.country = artistProfile.country;
        if (artistProfile.city) defaults.city = artistProfile.city;
      }

      // 2. Fetch Artist info (fill gaps)
      const artist = await db.query.artists.findFirst({
        where: eq(artists.id, artistId),
      });

      if (artist) {
        if (!defaults.genre && artist.genre) defaults.genre = artist.genre;
        if (!defaults.producer && artist.recordLabel) defaults.recordLabel = artist.recordLabel;
        if (!defaults.country && artist.country) defaults.country = artist.country;
        if (!defaults.city && artist.city) defaults.city = artist.city;
        defaults.artistName = artist.artistName;
        defaults.displayName = artist.displayName;
      }
    }

    // 3. Fetch User Profile (fallback)
    const userProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    if (userProfile) {
      if (!defaults.language) defaults.language = 'English'; // Default
      // Use metadata if available
      if (userProfile.metadata) {
        const meta = typeof userProfile.metadata === 'string'
          ? JSON.parse(userProfile.metadata)
          : userProfile.metadata;
        if (meta.genre && !defaults.genre) defaults.genre = meta.genre;
        if (meta.country && !defaults.country) defaults.country = meta.country;
      }
    }

    // 4. Fetch User info (final fallback)
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (user) {
      defaults.name = user.name || undefined;
      defaults.email = user.email;
      if (!defaults.country && user.socialMedia) {
        const socials = typeof user.socialMedia === 'string'
          ? JSON.parse(user.socialMedia)
          : user.socialMedia;
        if (socials.country) defaults.country = socials.country;
      }
    }

    // 5. Set language default if not set
    if (!defaults.language) defaults.language = 'English';

  } catch (error) {
    console.error('Error fetching profile defaults:', error);
  }

  return defaults;
}

/**
 * Extract filename without extension
 * Usage: "My Song.mp3" → "My Song"
 */
export function getFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '');
}

/**
 * Get song title from cover image filename
 * Cascade: Use provided value → extract from filename
 */
export function getSongTitleFromCover(
  currentTitle: string | undefined,
  coverFileName: string | undefined
): string {
  if (currentTitle) return currentTitle;
  if (coverFileName) return getFileNameWithoutExtension(coverFileName);
  return '';
}

/**
 * Get track title from mp3 filename
 * Cascade: Use provided value → extract from filename
 */
export function getTrackTitleFromMp3(
  currentTitle: string | undefined,
  mp3FileName: string | undefined
): string {
  if (currentTitle) return currentTitle;
  if (mp3FileName) return getFileNameWithoutExtension(mp3FileName);
  return '';
}

/**
 * Get album title from cover filename
 * Usage: For display purposes
 */
export function getAlbumTitleFromCover(
  coverFileName: string | undefined
): string {
  if (!coverFileName) return '';
  return getFileNameWithoutExtension(coverFileName);
}

/**
 * Create song defaults object for API submission
 */
export async function createSongDefaults(
  userId: string,
  artistId: string,
  coverFileName?: string,
  mp3FileName?: string
): Promise<Partial<Record<string, any>>> {
  const profileDefaults = await getProfileDefaults(userId, artistId);

  return {
    ...profileDefaults,
    type: 'single',
    explicit: 'no',
    songTitle: getSongTitleFromCover(undefined, coverFileName),
    trackTitle: getTrackTitleFromMp3(undefined, mp3FileName),
  };
}

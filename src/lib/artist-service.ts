/**
 * Artist Service - Two-Table Architecture
 * - artists: Private business information
 * - artist_profiles: Public profile data
 */

import { randomUUID } from "crypto";
import { db } from "@/db";
import { artists, artistProfiles, userProfiles } from "@/db/schema";
import { eq, desc, like, or, sql } from "drizzle-orm";

// Artist interface - Private business information
export interface Artist {
  id: string;
  userId: string;
  artistName: string;
  displayName: string;
  slug: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  birthday: Date | null;
  gender: string | null;
  genre: string | null;
  recordLabel: string | null;
  contact: {
    mobile?: string;
    whatsapp?: string;
    address?: string;
  } | null;
  legalId: string | null;
  contract: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Artist Profile interface - Public information
export interface ArtistProfile {
  id: string;
  artistId: string;
  picture: string | null;
  thumbnails: {
    small?: string;
    medium?: string;
    large?: string;
  } | null;
  gallery: Array<{
    url: string;
    title?: string;
    description?: string;
    order?: number;
  }> | null;
  mediaPlatform: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    soundcloud?: string;
    tidal?: string;
    deezer?: string;
    amazonMusic?: string;
  } | null;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    website?: string;
  } | null;
  fanNews: Array<{
    id: string;
    title: string;
    content: string;
    image?: string;
    publishedAt: string;
  }> | null;
  press: Array<{
    id: string;
    title: string;
    publication?: string;
    url?: string;
    image?: string;
    publishedAt: string;
  }> | null;
  isPublic: boolean;
  isVerified: boolean;
  totalSongs: number;
  totalPlays: number;
  totalFollowers: number;
  createdAt: Date;
  updatedAt: Date;
}

// Combined artist data for frontend
export interface CombinedArtist extends Artist {
  profile: ArtistProfile;
}

/**
 * Get maximum number of artists a user can create based on their role
 */
export function getMaxArtistsForRole(role: string): number {
  switch (role) {
    case "guest":
    case "new":
      return 0;
    case "member":
      return 1;
    case "artist":
      return 3;
    case "band":
    case "studio":
    case "choir":
    case "group":
      return 5;
    case "community":
    case "label":
      return 10;
    case "editor":
    case "manager":
      return 20;
    case "admin":
    case "sadmin":
      return Infinity;
    default:
      return 1;
  }
}

/**
 * Get all artists for a user with their profiles
 */
export async function getUserArtists(userId: string): Promise<CombinedArtist[]> {
  const userArtists = await db
    .select()
    .from(artists)
    .where(eq(artists.userId, userId))
    .orderBy(desc(artists.createdAt));

  const combinedArtists: CombinedArtist[] = [];

  for (const artist of userArtists) {
    const [profile] = await db
      .select()
      .from(artistProfiles)
      .where(eq(artistProfiles.artistId, artist.id))
      .limit(1);

    if (profile) {
      combinedArtists.push({
        ...(artist as Artist),
        profile: profile as ArtistProfile,
      });
    }
  }

  return combinedArtists;
}

/**
 * Get a single artist by ID with profile
 */
export async function getArtistById(id: string): Promise<CombinedArtist | null> {
  const [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.id, id))
    .limit(1);

  if (!artist) return null;

  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.artistId, artist.id))
    .limit(1);

  if (!profile) return null;

  return {
    ...(artist as Artist),
    profile: profile as ArtistProfile,
  };
}

/**
 * Get artist by slug
 */
export async function getArtistBySlug(slug: string): Promise<CombinedArtist | null> {
  // Normalize the incoming slug
  const normalizedSlug = slug.trim().toLowerCase();
  const slugWithSpacesToDashes = normalizedSlug.replace(/\s+/g, "-");
  const slugWithUnderscoresToDashes = normalizedSlug.replace(/_/g, "-");
  const slugWithAllToDashes = normalizedSlug.replace(/[\s_]+/g, "-");
  const slugWithoutSeparators = normalizedSlug.replace(/[-_\s]/g, "");

  // Try multiple slug matching strategies
  // 1. Direct exact match
  let [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.slug, slug))
    .limit(1);

  // 2. Try case-insensitive match
  if (!artist) {
    [artist] = await db
      .select()
      .from(artists)
      .where(sql`LOWER(${artists.slug}) = ${normalizedSlug}`)
      .limit(1);
  }

  // 3. Try with spaces converted to dashes
  if (!artist && slugWithSpacesToDashes !== normalizedSlug) {
    [artist] = await db
      .select()
      .from(artists)
      .where(sql`LOWER(${artists.slug}) = ${slugWithSpacesToDashes}`)
      .limit(1);
  }

  // 4. Try with underscores converted to dashes
  if (!artist && slugWithUnderscoresToDashes !== normalizedSlug) {
    [artist] = await db
      .select()
      .from(artists)
      .where(sql`LOWER(${artists.slug}) = ${slugWithUnderscoresToDashes}`)
      .limit(1);
  }

  // 5. Try with all separators converted to dashes
  if (!artist && slugWithAllToDashes !== normalizedSlug) {
    [artist] = await db
      .select()
      .from(artists)
      .where(sql`LOWER(${artists.slug}) = ${slugWithAllToDashes}`)
      .limit(1);
  }

  // 6. Try without any separators (dashes, underscores, spaces)
  if (!artist) {
    [artist] = await db
      .select()
      .from(artists)
      .where(sql`LOWER(REPLACE(REPLACE(REPLACE(${artists.slug}, '-', ''), '_', ''), ' ', '')) = ${slugWithoutSeparators}`)
      .limit(1);
  }

  // 7. Try LIKE search for partial match (last resort)
  if (!artist) {
    [artist] = await db
      .select()
      .from(artists)
      .where(sql`LOWER(${artists.slug}) LIKE ${`%${normalizedSlug}%`}`)
      .limit(1);
  }

  if (!artist) return null;

  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.artistId, artist.id))
    .limit(1);

  if (!profile) return null;

  return {
    ...(artist as Artist),
    profile: profile as ArtistProfile,
  };
}

/**
 * Check if user can create more artists
 */
export async function canUserCreateArtist(userId: string, userRole: string): Promise<{
  canCreate: boolean;
  currentCount: number;
  maxCount: number;
  reason?: string;
}> {
  const maxArtists = getMaxArtistsForRole(userRole);
  const currentArtists = await getUserArtists(userId);
  const currentCount = currentArtists.length;

  if (maxArtists === 0) {
    return {
      canCreate: false,
      currentCount,
      maxCount: maxArtists,
      reason: "Your account role does not allow creating artists. Please upgrade your account.",
    };
  }

  if (currentCount >= maxArtists) {
    return {
      canCreate: false,
      currentCount,
      maxCount: maxArtists,
      reason: `You have reached the maximum number of artists (${maxArtists}) for your account role.`,
    };
  }

  return {
    canCreate: true,
    currentCount,
    maxCount: maxArtists,
  };
}

/**
 * Create a new artist with profile
 */
export async function createArtist(
  userId: string,
  data: {
    artistName: string;
    displayName: string;
    bio?: string;
    gender?: string;
    city?: string;
    country?: string;
    genre?: string;
    recordLabel?: string;
    birthday?: Date;
    contact?: Artist["contact"];
    picture?: string;
    socialMedia?: ArtistProfile["socialMedia"];
    mediaPlatform?: ArtistProfile["mediaPlatform"];
  }
): Promise<CombinedArtist> {
  // Generate URL slug
  const slug = data.artistName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Check if slug is already taken
  const existing = await getArtistBySlug(slug);
  if (existing) {
    throw new Error("Artist name is already taken. Please choose a different name.");
  }

  // Create artist record
  const artistId = randomUUID();
  await db
    .insert(artists)
    .values({
      id: artistId,
      userId,
      artistName: data.artistName,
      displayName: data.displayName,
      slug,
      bio: data.bio || null,
      city: data.city || null,
      country: data.country || null,
      birthday: data.birthday || null,
      gender: data.gender || null,
      genre: data.genre || null,
      recordLabel: data.recordLabel || null,
      contact: data.contact || null,
      legalId: null,
      contract: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const [artist] = await db.select().from(artists).where(eq(artists.id, artistId));

  // Create artist profile
  const profileId = randomUUID();
  await db
    .insert(artistProfiles)
    .values({
      id: profileId,
      artistId: artist.id,
      picture: data.picture || null,
      thumbnails: null,
      gallery: null,
      mediaPlatform: data.mediaPlatform || null,
      socialMedia: data.socialMedia || null,
      fanNews: null,
      press: null,
      isPublic: true,
      isVerified: false,
      totalSongs: 0,
      totalPlays: 0,
      totalFollowers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const [profile] = await db.select().from(artistProfiles).where(eq(artistProfiles.id, profileId));

  return {
    ...(artist as Artist),
    profile: profile as ArtistProfile,
  };
}

/**
 * Update artist business information
 */
export async function updateArtist(
  artistId: string,
  userId: string,
  data: Partial<Omit<Artist, "id" | "userId" | "slug" | "createdAt">>
): Promise<Artist | null> {
  // Verify ownership
  const artist = await getArtistById(artistId);
  if (!artist || artist.userId !== userId) {
    throw new Error("Artist not found or you don't have permission to update it.");
  }

  await db
    .update(artists)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(artists.id, artistId));

  const [updated] = await db.select().from(artists).where(eq(artists.id, artistId));
  return (updated as Artist) || null;
}

/**
 * Update artist profile (public information)
 */
export async function updateArtistProfile(
  artistId: string,
  userId: string,
  data: Partial<Omit<ArtistProfile, "id" | "artistId" | "createdAt">>
): Promise<ArtistProfile | null> {
  // Verify ownership
  const artist = await getArtistById(artistId);
  if (!artist || artist.userId !== userId) {
    throw new Error("Artist not found or you don't have permission to update it.");
  }

  await db
    .update(artistProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(artistProfiles.artistId, artistId));

  const [updated] = await db.select().from(artistProfiles).where(eq(artistProfiles.artistId, artistId));
  return (updated as ArtistProfile) || null;
}

/**
 * Delete an artist (cascades to profile)
 */
export async function deleteArtist(artistId: string, userId: string): Promise<boolean> {
  const artist = await getArtistById(artistId);
  if (!artist || artist.userId !== userId) {
    throw new Error("Artist not found or you don't have permission to delete it.");
  }

  await db.delete(artists).where(eq(artists.id, artistId));
  return true;
}

/**
 * Get user's currently selected artist
 */
export async function getUserSelectedArtist(userId: string): Promise<CombinedArtist | null> {
  const [profile] = await db
    .select()
    .from(usersProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!profile || !profile.selectedArtistId) {
    return null;
  }

  return getArtistById(profile.selectedArtistId);
}

/**
 * Set user's selected artist
 */
export async function setUserSelectedArtist(
  userId: string,
  artistId: string
): Promise<void> {
  // Verify artist belongs to user
  const artist = await getArtistById(artistId);
  if (!artist || artist.userId !== userId) {
    throw new Error("Artist not found or you don't have permission to select it.");
  }

  // Check if user profile exists
  const [existing] = await db
    .select()
    .from(usersProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(usersProfiles)
      .set({
        selectedArtistId: artistId,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({
      id: randomUUID(),
      userId,
      selectedArtistId: artistId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Clear user's selected artist
 */
export async function clearUserSelectedArtist(userId: string): Promise<void> {
  await db
    .update(usersProfiles)
    .set({
      selectedArtistId: null,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId));
}

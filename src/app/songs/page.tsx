export const dynamic = "force-dynamic";

import { db } from "@/db";
import { songs, Song, artists, artistProfiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SearchableSongsGrid } from "@/components/songs/searchable-songs-grid";

// Get all approved public songs with artist info
async function getAllSongs() {
  const approvedSongs = await db
    .select({
      id: songs.id,
      title: songs.title,
      type: songs.type,
      genre: songs.genre,
      cover: songs.cover,
      numberOfTracks: songs.numberOfTracks,
      isFeatured: songs.isFeatured,
      createdAt: songs.createdAt,
      artistId: songs.artistId,
      artistName: songs.artistName,
    })
    .from(songs)
    .where(eq(songs.status, "approved"))
    .orderBy(desc(songs.isFeatured), desc(songs.createdAt));

  // Get artist info for each song
  const songsWithArtists = await Promise.all(
    approvedSongs.map(async (song: Song) => {
      const [artist] = await db
        .select({
          slug: artists.slug,
          displayName: artists.displayName,
        })
        .from(artists)
        .innerJoin(artistProfiles, eq(artists.id, artistProfiles.artistId))
        .where(and(
          eq(artists.userId, song.artistId),
          eq(artistProfiles.isPublic, true)
        ))
        .limit(1);

      return {
        ...song,
        artistSlug: artist?.slug || null,
        artistDisplayName: artist?.displayName || song.artistName,
      };
    })
  );

  // Filter out songs without public artist profiles
  return songsWithArtists.filter((song): song is typeof songsWithArtists[number] & { artistSlug: string } => song.artistSlug !== null);
}

export default async function SongsPage() {
  const allSongs = await getAllSongs();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">All Songs</h1>
          <p className="text-muted-foreground">
            Discover music from all artists on our platform
          </p>
        </div>

        {/* Searchable Songs Grid */}
        <SearchableSongsGrid songs={allSongs} />
      </div>

      <MobileBottomNav />
    </div>
  );
}

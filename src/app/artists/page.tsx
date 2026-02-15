import { db } from "@/db";
import { artists, artistProfiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SearchableArtistsGrid } from "@/components/artists/searchable-artists-grid";

// Get all public artists
async function getAllArtists() {
  const publicArtists = await db
    .select({
      id: artists.id,
      displayName: artists.displayName,
      slug: artists.slug,
      bio: artists.bio,
      city: artists.city,
      country: artists.country,
      genre: artists.genre,
      recordLabel: artists.recordLabel,
      picture: artistProfiles.picture,
      isFeatured: artistProfiles.isFeatured,
      isVerified: artistProfiles.isVerified,
      totalSongs: artistProfiles.totalSongs,
      totalPlays: artistProfiles.totalPlays,
      totalFollowers: artistProfiles.totalFollowers,
      createdAt: artists.createdAt,
    })
    .from(artists)
    .innerJoin(artistProfiles, eq(artists.id, artistProfiles.artistId))
    .where(and(
      eq(artists.isActive, true),
      eq(artistProfiles.isPublic, true)
    ))
    .orderBy(desc(artistProfiles.isFeatured), desc(artists.createdAt));

  return publicArtists;
}

export default async function ArtistsPage() {
  const allArtists = await getAllArtists();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">All Artists</h1>
          <p className="text-muted-foreground">
            Discover talented artists on our platform
          </p>
        </div>

        {/* Searchable Artists Grid */}
        <SearchableArtistsGrid artists={allArtists} />
      </div>

      <MobileBottomNav />
    </div>
  );
}

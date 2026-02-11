import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs,Song, artists, artistProfiles } from "@/db/music-schema";
import { eq, and, or, sql, desc } from "drizzle-orm";

// GET - Search for songs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const searchTerm = query.trim().toLowerCase();

    // Search approved songs by title, artist name, genre, type
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
      .where(
        and(
          eq(songs.status, "approved"),
          or(
            sql`LOWER(${songs.title}) LIKE ${`%${searchTerm}%`}`,
            sql`LOWER(${songs.artistName}) LIKE ${`%${searchTerm}%`}`,
            sql`LOWER(${songs.genre}) LIKE ${`%${searchTerm}%`}`,
            sql`LOWER(${songs.type}) LIKE ${`%${searchTerm}%`}`
          )
        )
      )
      .orderBy(desc(songs.isFeatured), desc(songs.createdAt))
      .limit(20);

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
          .where(
            and(
              eq(artists.userId, song.artistId),
              eq(artistProfiles.isPublic, true)
            )
          )
          .limit(1);

        return {
          ...song,
          artistSlug: artist?.slug || null,
          artistDisplayName: artist?.displayName || song.artistName,
        };
      })
    );

    // Filter out songs without public artist profiles
    const results = songsWithArtists.filter((song) => song.artistSlug !== null);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error: any) {
    console.error("Error searching songs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search songs" },
      { status: 500 }
    );
  }
}

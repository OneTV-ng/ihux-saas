import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { artists, artistProfiles } from "@/db/music-schema";
import { eq, and, like, or, sql } from "drizzle-orm";

// GET - Search for artists
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

    // Search artists by display name, slug, genre, city, country
    const results = await db
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
      .where(
        and(
          eq(artists.isActive, true),
          eq(artistProfiles.isPublic, true),
          or(
            sql`LOWER(${artists.displayName}) LIKE ${`%${searchTerm}%`}`,
            sql`LOWER(${artists.slug}) LIKE ${`%${searchTerm}%`}`,
            sql`LOWER(${artists.genre}) LIKE ${`%${searchTerm}%`}`,
            sql`LOWER(${artists.city}) LIKE ${`%${searchTerm}%`}`,
            sql`LOWER(${artists.country}) LIKE ${`%${searchTerm}%`}`,
            sql`LOWER(${artists.recordLabel}) LIKE ${`%${searchTerm}%`}`
          )
        )
      )
      .limit(20);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error: any) {
    console.error("Error searching artists:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search artists" },
      { status: 500 }
    );
  }
}

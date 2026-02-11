import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs, artists, artistProfiles } from "@/db/music-schema";
import { eq, and, or, sql, desc } from "drizzle-orm";
import { getServerUser } from "@/lib/auth-server";

// GET - All songs for current user (across all their artists)
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // Get all artist IDs for this user
    type ArtistRow = { id: string };
    const userArtists: ArtistRow[] = await db
      .select({ id: artists.id })
      .from(artists)
      .where(eq(artists.userId, user.id));
    const artistIds = userArtists.map((a: { id: string }) => a.id);
    if (!artistIds.length) {
      return NextResponse.json({ songs: [], total: 0 });
    }

    // Query songs for these artists
    let query = db
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
        status: songs.status,
      })
      .from(songs)
      .where(
        and(
          eq(songs.status, "approved"),
          sql`${songs.artistId} IN (${artistIds.map((id: string) => `'${id}'`).join(",")})`,
          search
            ? or(
                sql`LOWER(${songs.title}) LIKE ${`%${search.toLowerCase()}%`}`,
                sql`LOWER(${songs.artistName}) LIKE ${`%${search.toLowerCase()}%`}`,
                sql`LOWER(${songs.genre}) LIKE ${`%${search.toLowerCase()}%`}`,
                sql`LOWER(${songs.type}) LIKE ${`%${search.toLowerCase()}%`}`
              )
            : sql`1=1`
        )
      )
      .orderBy(desc(songs.isFeatured), desc(songs.createdAt));

    // Get total count
    const allSongs = await query;
    const total = allSongs.length;
    const paginated = allSongs.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({ songs: paginated, total });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load songs" },
      { status: 500 }
    );
  }
}

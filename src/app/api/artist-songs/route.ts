import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs,Song  } from "@/db/music-schema";
import { eq, and, or, sql, desc } from "drizzle-orm";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get("artistId") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // Query songs for this artist
    const whereClause = [];
    whereClause.push(eq(songs.status, "approved"));
    if (artistId) whereClause.push(eq(songs.artistId, artistId));
    if (search) {
      whereClause.push(
        or(
          sql`LOWER(${songs.title}) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${songs.genre}) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${songs.type}) LIKE ${`%${search.toLowerCase()}%`}`
        )
      );
    }
    const allSongsRaw = await db
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
      .where(and(...whereClause))
      .orderBy(desc(songs.isFeatured), desc(songs.createdAt));
    const allSongs = allSongsRaw.map((song: Song) => ({ ...song, slug: slugify(song.title) }));
    const total = allSongs.length;
    const paginated = allSongs.slice((page - 1) * pageSize, page * pageSize);
    return NextResponse.json({ songs: paginated, total });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load songs" }, { status: 500 });
  }
}

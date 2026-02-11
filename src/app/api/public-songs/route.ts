import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs } from "@/db/music-schema";
import { eq, and, or, sql, desc } from "drizzle-orm";

// GET - Public songs for listening (basic info only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const whereClause: any[] = [eq(songs.status, "approved")];

    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      whereClause.push(
        or(
          sql`LOWER(${songs.title}) LIKE ${searchTerm}`,
          sql`LOWER(${songs.artistName}) LIKE ${searchTerm}`,
          sql`LOWER(${songs.genre}) LIKE ${searchTerm}`
        )
      );
    }
    const offset = (page - 1) * pageSize;

    const [paginated, totalResult] = await Promise.all([
      db
        .select({
          id: songs.id,
          title: songs.title,
          artistName: songs.artistName,
          genre: songs.genre,
          cover: songs.cover,
          createdAt: songs.createdAt,
          type: songs.type,
        })
        .from(songs)
        .where(and(...whereClause))
        .orderBy(desc(songs.isFeatured), desc(songs.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(songs)
        .where(and(...whereClause)),
    ]);

    const total = totalResult[0]?.count || 0;
    return NextResponse.json({ songs: paginated, total });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load songs" },
      { status: 500 }
    );
  }
}

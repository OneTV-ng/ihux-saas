import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema/song.schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/songs/featured
 *
 * Get featured songs (public endpoint)
 * Returns songs marked as featured by admins, sorted by creation date
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 *
 * Returns:
 * {
 *   success: true,
 *   data: {
 *     songs: [...],
 *     pagination: { page, limit, total, totalPages }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    // Get total count of featured songs
    const countResult = await db
      .select({ count: db.sql`count(*)` })
      .from(songs)
      .where(eq(songs.isFeatured, true));

    const total = parseInt(countResult[0]?.count?.toString() || '0', 10);
    const totalPages = Math.ceil(total / limit);

    // Get paginated featured songs
    const offset = (page - 1) * limit;
    const featuredSongs = await db
      .select()
      .from(songs)
      .where(eq(songs.isFeatured, true))
      .orderBy(desc(songs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(
      {
        success: true,
        data: {
          songs: featuredSongs,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching featured songs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch featured songs',
      },
      { status: 500 }
    );
  }
}

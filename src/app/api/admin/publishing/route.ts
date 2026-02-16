import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publishingRecords, type PublishingRecord } from '@/db/schema/publishing.schema';
import { songs } from '@/db/schema/song.schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';

/**
 * GET /api/admin/publishing
 *
 * List all publishing records with pagination and filtering
 * Used by the publishing management dashboard
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - status: Filter by status (processing, approved, published)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin permission
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const status = searchParams.get('status');

    // Build query
    let query = db.select().from(publishingRecords);

    // Apply status filter if provided
    if (status) {
      query = query.where(eq(publishingRecords.status, status)) as any;
    }

    // Count total records
    const countResult = await db
      .select()
      .from(publishingRecords)
      .where(status ? eq(publishingRecords.status, status) : undefined);

    const total = countResult.length;

    // Get paginated records ordered by creation date (newest first)
    const records = await (query as any)
      .orderBy(desc(publishingRecords.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // Enrich with song data
    const enrichedRecords = await Promise.all(
      records.map(async (record: PublishingRecord) => {
        const songData = await db
          .select()
          .from(songs)
          .where(eq(songs.id, record.songId))
          .limit(1);

        return {
          ...record,
          song: songData.length > 0 ? songData[0] : null,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          records: enrichedRecords,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching publishing records:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch publishing records',
      },
      { status: 500 }
    );
  }
}

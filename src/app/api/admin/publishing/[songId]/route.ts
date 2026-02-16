import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema/song.schema';
import { tracks } from '@/db/schema/song.schema';
import { publishingRecords } from '@/db/schema/publishing.schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';

/**
 * GET /api/admin/publishing/[songId]
 *
 * Get full publishing details including song metadata, tracks, and publishing record
 * Used by the publishing management page for viewing and editing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    // Verify admin permission
    await requireAdmin();

    const { songId } = await params;

    if (!songId) {
      return NextResponse.json(
        { success: false, error: 'Song ID is required' },
        { status: 400 }
      );
    }

    // Get song
    const songData = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    if (!songData.length) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      );
    }

    // Get all tracks for this song
    const songTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.songId, songId));

    // Get latest publishing record (most recent publishing)
    const publishingRecord = await db
      .select()
      .from(publishingRecords)
      .where(eq(publishingRecords.songId, songId))
      .orderBy(desc(publishingRecords.createdAt))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        data: {
          song: songData[0],
          tracks: songTracks,
          publishingRecord: publishingRecord.length > 0 ? publishingRecord[0] : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching publishing details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch publishing details',
      },
      { status: 500 }
    );
  }
}

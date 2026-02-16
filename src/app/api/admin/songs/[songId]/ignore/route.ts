import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema/song.schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';

/**
 * POST /api/admin/songs/[songId]/ignore
 *
 * Mark a song as ignored by admin (not processing it)
 * Used when admin chooses to skip processing a submission
 *
 * Body:
 * {
 *   reason?: string  // Optional reason for ignoring
 * }
 *
 * Flow:
 * 1. Verify admin permission
 * 2. Fetch existing song
 * 3. Update song: status="ignored", flaggedBy, flaggedAt
 * 4. Return updated song
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    // Verify admin permission
    const session = await requireAdmin();
    const adminUserId = session?.user?.id;

    if (!adminUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { songId } = await params;

    if (!songId) {
      return NextResponse.json(
        { success: false, error: 'Song ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    // Get the existing song
    const existingSong = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    if (!existingSong.length) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      );
    }

    const now = new Date();

    // Build update object
    const updateData: Record<string, any> = {
      status: 'ignored',
      flaggedBy: adminUserId,
      flaggedAt: now,
      updatedAt: now,
    };

    // Add reason if provided
    if (reason && reason.trim()) {
      updateData.flagReason = reason;
    }

    // Update song: mark as ignored
    await db
      .update(songs)
      .set(updateData)
      .where(eq(songs.id, songId));

    // Fetch and return updated song
    const updatedSongs = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    const updatedSong = updatedSongs[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Song ignored successfully',
        data: updatedSong,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error ignoring song:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to ignore song',
      },
      { status: 500 }
    );
  }
}

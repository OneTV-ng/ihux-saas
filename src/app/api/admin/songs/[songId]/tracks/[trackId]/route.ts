import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tracks } from '@/db/schema/song.schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';

/**
 * PATCH /api/admin/songs/[songId]/tracks/[trackId]
 *
 * Update individual track metadata fields (admin only)
 *
 * Allowed fields:
 * - title, isrc, lyrics, leadVocal, featured
 * - producer, writer, duration, explicit, mp3
 *
 * Flow:
 * 1. Verify admin permission
 * 2. Fetch existing track
 * 3. Verify track belongs to the correct song
 * 4. Build update object from allowed fields only (allowlist approach)
 * 5. Validate that at least one field is being updated
 * 6. Update track in database
 * 7. Return updated track
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string; trackId: string }> }
) {
  try {
    // Verify admin permission
    const session = await requireAdmin();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { songId, trackId } = await params;

    if (!songId || !trackId) {
      return NextResponse.json(
        { success: false, error: 'Song ID and Track ID are required' },
        { status: 400 }
      );
    }

    // Get the existing track
    const existingTrack = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, trackId))
      .limit(1);

    if (!existingTrack.length) {
      return NextResponse.json(
        { success: false, error: 'Track not found' },
        { status: 404 }
      );
    }

    // Verify track belongs to the correct song
    if (existingTrack[0].songId !== songId) {
      return NextResponse.json(
        { success: false, error: 'Track does not belong to this song' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Allowlist of fields that can be updated
    const allowedFields = [
      'title',
      'isrc',
      'lyrics',
      'leadVocal',
      'featured',
      'producer',
      'writer',
      'duration',
      'explicit',
      'mp3',
    ] as const;

    // Build update object from allowed fields only
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid fields to update. Allowed fields: ' + allowedFields.join(', '),
        },
        { status: 400 }
      );
    }

    // Update timestamp
    updateData.updatedAt = new Date();

    // Perform the update
    await db
      .update(tracks)
      .set(updateData)
      .where(eq(tracks.id, trackId));

    // Fetch and return updated track
    const updatedTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, trackId))
      .limit(1);

    const updatedTrack = updatedTracks[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Track updated successfully',
        data: updatedTrack,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating track:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update track',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema/song.schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';

/**
 * PATCH /api/admin/songs/[songId]
 *
 * Update individual song metadata fields (admin only)
 *
 * Allowed fields:
 * - title, artistName, genre, producer, writer
 * - recordLabel, upc, releaseDate, language
 * - cover, duration, numberOfTracks
 *
 * Flow:
 * 1. Verify admin permission
 * 2. Fetch existing song
 * 3. Build update object from allowed fields only (allowlist approach)
 * 4. Validate that at least one field is being updated
 * 5. Update song in database
 * 6. Return updated song
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
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

    const { songId } = await params;

    if (!songId) {
      return NextResponse.json(
        { success: false, error: 'Song ID is required' },
        { status: 400 }
      );
    }

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

    // Parse request body
    const body = await request.json();

    // Allowlist of fields that can be updated
    const allowedFields = [
      'title',
      'artistName',
      'genre',
      'producer',
      'writer',
      'recordLabel',
      'upc',
      'releaseDate',
      'language',
      'cover',
      'duration',
      'numberOfTracks',
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
        message: 'Song updated successfully',
        data: updatedSong,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating song:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update song',
      },
      { status: 500 }
    );
  }
}

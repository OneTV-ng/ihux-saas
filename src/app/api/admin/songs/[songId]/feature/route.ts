import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema/song.schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';

/**
 * POST /api/admin/songs/[songId]/feature
 *
 * Manually mark/unmark a song as featured (admin only)
 *
 * Body:
 * {
 *   featured: boolean,     // true to feature, false to unfeature
 *   reason?: string        // Optional reason (e.g., "Featured on homepage")
 * }
 *
 * Flow:
 * 1. Verify admin permission
 * 2. Fetch existing song
 * 3. Update song: isFeatured, featuredReason
 * 4. Return updated song
 */
export async function POST(
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

    // Parse request body
    const body = await request.json();
    const { featured, reason } = body;

    if (typeof featured !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'featured must be a boolean' },
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

    const now = new Date();

    // Build update object
    const updateData: Record<string, any> = {
      isFeatured: featured,
      updatedAt: now,
    };

    // Store reason if provided
    if (reason && reason.trim()) {
      updateData.featured = reason;
    }

    // Update song
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
        message: featured ? 'Song featured successfully' : 'Song unfeatured successfully',
        data: updatedSong,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error featuring song:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to feature song',
      },
      { status: 500 }
    );
  }
}

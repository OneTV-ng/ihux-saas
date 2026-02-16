import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema/song.schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';
import { notifySongFlagged } from '@/lib/notification-service';
import { sendEmail } from '@/lib/email';
import { songFlaggedEmailTemplate } from '@/lib/email-templates/song-flagged';

/**
 * POST /api/admin/songs/[songId]/flag
 *
 * Flag a song with categorized issues (admin only)
 *
 * Body:
 * {
 *   categories: string[],  // ['copyright', 'names', 'cover', 'song_issues']
 *   reason: string,        // Detailed explanation of issues
 *   sendNotification?: boolean  // Default: true
 * }
 *
 * Flow:
 * 1. Verify admin permission
 * 2. Fetch existing song
 * 3. Update song: status="flagged", flagged=true, flagReason, flaggedBy, flaggedAt
 * 4. Create notification for artist
 * 5. Send email with issue details
 * 6. Return updated song
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
    const { categories = [], reason = '', sendNotification = true } = body;

    // Validate categories
    const validCategories = ['copyright', 'names', 'cover', 'song_issues'];
    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'categories must be a non-empty array',
        },
        { status: 400 }
      );
    }

    const invalidCategories = categories.filter((cat) => !validCategories.includes(cat));
    if (invalidCategories.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid categories: ${invalidCategories.join(', ')}. Valid: ${validCategories.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'reason is required and cannot be empty' },
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

    const songData = existingSong[0];
    const now = new Date();

    // Update song: mark as flagged
    await db
      .update(songs)
      .set({
        status: 'flagged',
        flagType: 'admin_flag',
        flagReason: reason,
        flaggedBy: adminUserId,
        flaggedAt: now,
        updatedAt: now,
      })
      .where(eq(songs.id, songId));

    // Create in-app notification (best effort, don't block on failure)
    if (sendNotification) {
      try {
        await notifySongFlagged(
          songData.userId,
          songData.title,
          reason,
          songId
        );
      } catch (notifError) {
        console.error('Failed to create flag notification:', notifError);
      }

      // Send email notification (best effort, don't block on failure)
      try {
        const emailTemplate = songFlaggedEmailTemplate({
          userName: songData.userId, // TODO: fetch actual user name
          songTitle: songData.title,
          categories: categories,
          reason: reason,
          songId: songId,
          detailsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/desk/artist/songs/${songId}`,
        });

        // Temporarily commented out until we have actual user email
        // await sendEmail({
        //   to: userEmail,
        //   subject: emailTemplate.subject,
        //   html: emailTemplate.html,
        //   text: emailTemplate.text,
        // });
      } catch (emailError) {
        console.error('Failed to send flag email:', emailError);
      }
    }

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
        message: 'Song flagged successfully',
        data: updatedSong,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error flagging song:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to flag song',
      },
      { status: 500 }
    );
  }
}

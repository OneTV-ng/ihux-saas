import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema/song.schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';
import { notifySongRejected } from '@/lib/notification-service';
import { sendEmail } from '@/lib/email';
import { songRejectedEmailTemplate } from '@/lib/email-templates/song-rejected';

/**
 * POST /api/admin/songs/[songId]/reject
 *
 * Reject a song submission (admin only)
 * The song cannot be published and artist needs to resubmit
 *
 * Body:
 * {
 *   reason: string,        // Reason for rejection
 *   sendNotification?: boolean  // Default: true
 * }
 *
 * Flow:
 * 1. Verify admin permission
 * 2. Fetch existing song
 * 3. Update song: status="rejected", rejectionReason, rejectedBy, rejectedAt
 * 4. Create notification for artist
 * 5. Send email with rejection details
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
    const { reason = '', sendNotification = true } = body;

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

    // Update song: mark as rejected
    await db
      .update(songs)
      .set({
        status: 'rejected',
        flagReason: reason,
        flaggedBy: adminUserId,
        flaggedAt: now,
        updatedAt: now,
      })
      .where(eq(songs.id, songId));

    // Create in-app notification (best effort, don't block on failure)
    if (sendNotification) {
      try {
        await notifySongRejected(
          songData.userId,
          songData.title,
          reason,
          songId
        );
      } catch (notifError) {
        console.error('Failed to create rejection notification:', notifError);
      }

      // Send email notification (best effort, don't block on failure)
      try {
        const emailTemplate = songRejectedEmailTemplate({
          userName: songData.userId, // TODO: fetch actual user name
          songTitle: songData.title,
          reason: reason,
          songId: songId,
          guidesUrl: `${process.env.NEXT_PUBLIC_APP_URL}/help/submission-guidelines`,
          supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support/contact`,
        });

        // Temporarily commented out until we have actual user email
        // await sendEmail({
        //   to: userEmail,
        //   subject: emailTemplate.subject,
        //   html: emailTemplate.html,
        //   text: emailTemplate.text,
        // });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
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
        message: 'Song rejected successfully',
        data: updatedSong,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error rejecting song:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject song',
      },
      { status: 500 }
    );
  }
}

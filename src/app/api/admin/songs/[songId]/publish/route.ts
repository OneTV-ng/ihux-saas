import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema/song.schema';
import { publishingRecords } from '@/db/schema/publishing.schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';
import { generateProductCode } from '@/lib/product-code-generator';
import { notifySongProcessingStarted } from '@/lib/notification-service';
import { sendEmail } from '@/lib/email';
import { songProcessingEmailTemplate } from '@/lib/email-templates/song-processing';
import { randomUUID } from 'crypto';

/**
 * POST /api/admin/songs/[songId]/publish
 *
 * Admin publishes a submitted song to the processing queue
 *
 * Flow:
 * 1. Verify admin permission
 * 2. Verify song status is "submitted"
 * 3. Generate product code (SF-SC-2026-2002)
 * 4. Create publishing record
 * 5. Update song: status="processing", productCode, publishedBy, processingStartedAt
 * 6. Send email notification to artist
 * 7. Create in-app notification
 * 8. Return updated song
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

    // Get the song
    const song = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    if (!song.length) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      );
    }

    const songData = song[0];

    // Verify song status is "submitted"
    if (songData.status !== 'submitted') {
      return NextResponse.json(
        {
          success: false,
          error: `Song must be in 'submitted' status. Current status: ${songData.status}`,
        },
        { status: 400 }
      );
    }

    // Generate product code (thread-safe with DB transaction)
    const productCode = await generateProductCode();

    const now = new Date();

    // Create publishing record
    const publishingRecordId = randomUUID();
    await db.insert(publishingRecords).values({
      id: publishingRecordId,
      songId: songId,
      productCode: productCode,
      publishedBy: adminUserId,
      status: 'processing',
      notes: `Published by ${adminUserId} at ${now.toISOString()}`,
    });

    // Update song: change status to "processing" and set product code
    await db
      .update(songs)
      .set({
        status: 'processing',
        productCode: productCode,
        publishedBy: adminUserId,
        publishedAt: now,
        processingStartedAt: now,
        updatedAt: now,
      })
      .where(eq(songs.id, songId));

    // Send email notification to artist (best effort, don't block on failure)
    try {
      const emailTemplate = songProcessingEmailTemplate({
        userName: songData.userId, // TODO: fetch actual user name
        userEmail: '', // TODO: fetch actual user email
        songTitle: songData.title,
        artistName: songData.artistName,
        productCode: productCode,
        processingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/desk/artist/songs/${songId}`,
      });

      // Temporarily commented out until we have actual user email
      // await sendEmail({
      //   to: userEmail,
      //   subject: emailTemplate.subject,
      //   html: emailTemplate.html,
      //   text: emailTemplate.text,
      // });
    } catch (emailError) {
      // Log but don't block the response
      console.error('Failed to send processing email:', emailError);
    }

    // Create in-app notification (best effort, don't block on failure)
    try {
      await notifySongProcessingStarted(
        songData.userId,
        songData.title,
        productCode,
        songId
      );
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    // Return updated song
    const updatedSong = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        message: 'Song published successfully',
        data: {
          song: updatedSong[0],
          publishingRecord: {
            id: publishingRecordId,
            songId: songId,
            productCode: productCode,
            publishedBy: adminUserId,
            status: 'processing',
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error publishing song:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish song',
      },
      { status: 500 }
    );
  }
}

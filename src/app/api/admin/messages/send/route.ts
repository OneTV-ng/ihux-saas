import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminMessages, messageRecipients } from '@/db/schema/admin-message.schema';
import { users } from '@/db/schema/user.schema';
import { songs } from '@/db/schema/song.schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';
import { randomUUID } from 'crypto';
import { createNotification } from '@/lib/notification-service';

/**
 * POST /api/admin/messages/send
 *
 * Send custom admin message to individual or bulk recipients (admin only)
 *
 * Body:
 * {
 *   recipientType: 'individual' | 'role' | 'status' | 'bulk',
 *   recipientFilter: {
 *     role?: string,           // For recipientType='role' (e.g., 'artist')
 *     status?: string,         // For recipientType='status' (e.g., 'submitted')
 *     userIds?: string[]       // For recipientType='individual' or 'bulk'
 *   },
 *   subject: string,
 *   message: string,
 *   sendEmails?: boolean       // Default: false (not implemented yet)
 * }
 *
 * Flow:
 * 1. Verify admin permission
 * 2. Validate input
 * 3. Resolve recipients based on filter
 * 4. Create admin_message record
 * 5. Create message_recipient records for each recipient
 * 6. Create in-app notifications
 * 7. Optionally send emails (placeholder)
 * 8. Return count of recipients
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin permission
    const session = await requireAdmin();
    const adminUserId = session?.user?.id;
    const adminName = session?.user?.name || 'SingFLEX Admin';

    if (!adminUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      recipientType = 'individual',
      recipientFilter = {},
      subject = '',
      message = '',
      sendEmails = false,
    } = body;

    // Validate input
    const validTypes = ['individual', 'role', 'status', 'bulk'];
    if (!validTypes.includes(recipientType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid recipientType. Valid: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!subject || subject.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'subject is required' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'message is required' },
        { status: 400 }
      );
    }

    // Resolve recipients based on filter type
    let userIds: string[] = [];

    switch (recipientType) {
      case 'individual':
      case 'bulk':
        // Direct user ID list
        if (Array.isArray(recipientFilter.userIds)) {
          userIds = recipientFilter.userIds;
        }
        break;

      case 'role':
        // Get all users with specified role
        if (recipientFilter.role) {
          const roleUsers = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.role, recipientFilter.role));
          userIds = roleUsers.map((u: { id: string }) => u.id);
        }
        break;

      case 'status':
        // Get users who own songs with specified status
        if (recipientFilter.status) {
          const statusSongs = await db
            .select({ userId: songs.userId })
            .from(songs)
            .where(eq(songs.status, recipientFilter.status));
          // Remove duplicates
          userIds = [...new Set(statusSongs.map((s: { userId: string }) => s.userId))] as string[];
        }
        break;
    }

    // Validate that we have recipients
    if (userIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No recipients found matching the specified criteria',
        },
        { status: 400 }
      );
    }

    // Limit to 10,000 recipients max for performance
    if (userIds.length > 10000) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many recipients (${userIds.length}). Max: 10,000`,
        },
        { status: 400 }
      );
    }

    const messageId = randomUUID();
    const now = new Date();

    // Create admin_message record
    await db.insert(adminMessages).values({
      id: messageId,
      senderId: adminUserId,
      recipientType: recipientType,
      recipientFilter: recipientFilter,
      subject: subject,
      message: message,
      sentAt: now,
      createdAt: now,
    });

    // Create message_recipient records for each user
    const recipientRecords = userIds.map((userId) => ({
      id: randomUUID(),
      messageId: messageId,
      userId: userId,
      read: false,
      createdAt: now,
    }));

    // Insert in batches of 500 to avoid query size limits
    const batchSize = 500;
    for (let i = 0; i < recipientRecords.length; i += batchSize) {
      const batch = recipientRecords.slice(i, i + batchSize);
      await db.insert(messageRecipients).values(batch);
    }

    // Create in-app notifications (best effort, don't block on failure)
    try {
      for (let i = 0; i < userIds.length; i += 100) {
        const batch = userIds.slice(i, i + 100);
        const notificationPromises = batch.map((userId) =>
          createNotification({
            userId: userId,
            type: 'admin_message',
            title: subject,
            message: message,
            metadata: {
              messageId: messageId,
              senderName: adminName,
            },
          }).catch((err) => {
            console.error(`Failed to create notification for user ${userId}:`, err);
          })
        );
        await Promise.all(notificationPromises);
      }
    } catch (notifError) {
      console.error('Failed to create bulk notifications:', notifError);
    }

    // TODO: Send emails if sendEmails is true
    // This would require fetching user emails and sending via the email service

    return NextResponse.json(
      {
        success: true,
        message: `Message sent to ${userIds.length} recipient(s)`,
        data: {
          messageId: messageId,
          recipientCount: userIds.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending admin message:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      },
      { status: 500 }
    );
  }
}

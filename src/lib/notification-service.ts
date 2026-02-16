import { db } from '@/db';
import { notifications } from '@/db/schema/notification.schema';
import { randomUUID } from 'crypto';

/**
 * Data structure for creating a notification
 */
export interface CreateNotificationData {
  userId: string;
  type: string; // e.g., 'song_processing', 'song_approved', 'song_published'
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Create an in-app notification for a user
 * These appear in the notifications panel in the app
 *
 * @param data - Notification details
 * @returns The created notification ID
 * @throws Error if database insert fails
 */
export async function createNotification(data: CreateNotificationData): Promise<string> {
  const notificationId = randomUUID();

  try {
    await db.insert(notifications).values({
      id: notificationId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      status: 'unread',
      read: false,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 *
 * @param notificationId - The ID of the notification to mark as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { eq } = await import('drizzle-orm');

    await db
      .update(notifications)
      .set({
        status: 'read',
        read: true,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 *
 * @param userId - The user ID
 * @returns The count of unread notifications
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const { eq } = await import('drizzle-orm');

    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .where(eq(notifications.read, false));

    return result.length;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    return 0;
  }
}

/**
 * Common notification types and templates
 */
export const NOTIFICATION_TYPES = {
  SONG_PROCESSING_STARTED: 'song_processing_started',
  SONG_APPROVED: 'song_approved',
  SONG_PUBLISHED: 'song_published',
  SONG_FLAGGED: 'song_flagged',
  SONG_REJECTED: 'song_rejected',
} as const;

/**
 * Helper function to create a song processing notification
 *
 * @param userId - Artist user ID
 * @param songTitle - Name of the song
 * @param productCode - Generated product code (SF-SC-2026-2002)
 * @param songId - Song ID for reference
 */
export async function notifySongProcessingStarted(
  userId: string,
  songTitle: string,
  productCode: string,
  songId: string
): Promise<string> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.SONG_PROCESSING_STARTED,
    title: `🎵 ${songTitle} is Now Processing`,
    message: `Your song "${songTitle}" has been published to our processing queue with product code ${productCode}. We'll validate it within 2-3 days.`,
    metadata: {
      songId,
      songTitle,
      productCode,
      action: 'view_publishing_status',
    },
  });
}

/**
 * Helper function to create a song approved notification
 *
 * @param userId - Artist user ID
 * @param songTitle - Name of the song
 * @param songId - Song ID for reference
 */
export async function notifySongApproved(
  userId: string,
  songTitle: string,
  songId: string
): Promise<string> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.SONG_APPROVED,
    title: `✅ ${songTitle} Approved`,
    message: `Great news! Your song "${songTitle}" has been approved and is ready for publishing.`,
    metadata: {
      songId,
      songTitle,
      action: 'view_song',
    },
  });
}

/**
 * Helper function to create a song published notification
 *
 * @param userId - Artist user ID
 * @param songTitle - Name of the song
 * @param songId - Song ID for reference
 */
export async function notifySongPublished(
  userId: string,
  songTitle: string,
  songId: string
): Promise<string> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.SONG_PUBLISHED,
    title: `🚀 ${songTitle} is Now Live`,
    message: `Congratulations! Your song "${songTitle}" is now live on SingFLEX and available to millions of listeners.`,
    metadata: {
      songId,
      songTitle,
      action: 'view_song',
    },
  });
}

/**
 * Helper function to create a song flagged notification
 *
 * @param userId - Artist user ID
 * @param songTitle - Name of the song
 * @param reason - Reason for flagging
 * @param songId - Song ID for reference
 */
export async function notifySongFlagged(
  userId: string,
  songTitle: string,
  reason: string,
  songId: string
): Promise<string> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.SONG_FLAGGED,
    title: `⚠️ ${songTitle} Flagged for Review`,
    message: `Your song "${songTitle}" has been flagged during review. Reason: ${reason}. Please review and resubmit.`,
    metadata: {
      songId,
      songTitle,
      reason,
      action: 'view_song',
    },
  });
}

/**
 * Helper function to create a song rejected notification
 *
 * @param userId - Artist user ID
 * @param songTitle - Name of the song
 * @param reason - Reason for rejection
 * @param songId - Song ID for reference
 */
export async function notifySongRejected(
  userId: string,
  songTitle: string,
  reason: string,
  songId: string
): Promise<string> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.SONG_REJECTED,
    title: `❌ ${songTitle} Rejected`,
    message: `Unfortunately, your song "${songTitle}" was rejected. Reason: ${reason}. You can resubmit after making corrections.`,
    metadata: {
      songId,
      songTitle,
      reason,
      action: 'view_song',
    },
  });
}

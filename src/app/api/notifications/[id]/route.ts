import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema/notification.schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-server';

/**
 * PATCH /api/notifications/[id]
 *
 * Mark notification as read or update status
 *
 * Body:
 * {
 *   status: 'read' | 'archived',  // Update status
 *   read: boolean                 // Update read flag
 * }
 *
 * Returns updated notification
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user is authenticated
    const session = await requireAuth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Get the existing notification
    const existingNotif = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!existingNotif.length) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Verify notification belongs to user
    if (existingNotif[0].userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Build update object
    const updateData: Record<string, any> = {};
    const now = new Date();

    if (body.status !== undefined) {
      const validStatuses = ['unread', 'read', 'archived'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.read !== undefined) {
      updateData.read = body.read;
    }

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid fields to update. Valid fields: status, read',
        },
        { status: 400 }
      );
    }

    // Update timestamp
    updateData.updatedAt = now;

    // Perform the update
    await db
      .update(notifications)
      .set(updateData)
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        )
      );

    // Fetch and return updated notification
    const updatedNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    const updatedNotif = updatedNotifs[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Notification updated successfully',
        data: updatedNotif,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification',
      },
      { status: 500 }
    );
  }
}

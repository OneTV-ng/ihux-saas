import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema/notification.schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-server';

/**
 * GET /api/notifications
 *
 * Get user's notifications (paginated)
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - status: 'unread' | 'read' | 'archived' (optional)
 *
 * Returns:
 * {
 *   success: true,
 *   data: {
 *     notifications: [...],
 *     pagination: { page, limit, total, totalPages },
 *     unreadCount: number
 *   }
 * }
 */
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const status = searchParams.get('status') as 'unread' | 'read' | 'archived' | null;

    // Build conditions
    const conditions = [eq(notifications.userId, userId)];

    if (status) {
      conditions.push(eq(notifications.status, status));
    }

    // Get total count
    const countResult = await db
      .select({ count: db.sql`count(*)` })
      .from(notifications)
      .where(and(...conditions));

    const total = parseInt(countResult[0]?.count?.toString() || '0', 10);
    const totalPages = Math.ceil(total / limit);

    // Get paginated notifications
    const offset = (page - 1) * limit;
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Count unread notifications
    const unreadResult = await db
      .select({ count: db.sql`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );

    const unreadCount = parseInt(unreadResult[0]?.count?.toString() || '0', 10);

    return NextResponse.json(
      {
        success: true,
        data: {
          notifications: userNotifications,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
          unreadCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
      },
      { status: 500 }
    );
  }
}

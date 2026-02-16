import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminMessages, messageRecipients } from '@/db/schema/admin-message.schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';

/**
 * GET /api/admin/messages
 *
 * List all admin messages with recipient counts (admin only)
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - senderId?: string (optional, filter by sender)
 *
 * Returns:
 * {
 *   success: true,
 *   data: {
 *     messages: [...],
 *     pagination: { page, limit, total, totalPages }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin permission
    const session = await requireAdmin();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const senderId = searchParams.get('senderId') || null;

    // Build query
    let query = db.select().from(adminMessages);

    if (senderId) {
      query = query.where(eq(adminMessages.senderId, senderId));
    }

    // Get total count
    const countResult = await db
      .select({ count: db.sql`count(*)` })
      .from(adminMessages);

    const total = parseInt(countResult[0]?.count?.toString() || '0', 10);
    const totalPages = Math.ceil(total / limit);

    // Get paginated messages
    const offset = (page - 1) * limit;
    let messagesQuery = db
      .select()
      .from(adminMessages)
      .orderBy(desc(adminMessages.sentAt))
      .limit(limit)
      .offset(offset);

    if (senderId) {
      messagesQuery = messagesQuery.where(eq(adminMessages.senderId, senderId));
    }

    const messages = await messagesQuery;

    // For each message, get recipient count
    const messagesWithCounts = await Promise.all(
      messages.map(async (msg: typeof messages.$inferSelect) => {
        const recipientCountResult = await db
          .select({ count: db.sql`count(*)` })
          .from(messageRecipients)
          .where(eq(messageRecipients.messageId, msg.id));

        const recipientCount = parseInt(
          recipientCountResult[0]?.count?.toString() || '0',
          10
        );

        // Get read count
        const readCountResult = await db
          .select({ count: db.sql`count(*)` })
          .from(messageRecipients)
          .where(
            eq(messageRecipients.messageId, msg.id)
            // Note: using boolean false in Drizzle might require special handling
          );

        // For now, just return total recipient count
        return {
          ...msg,
          recipientCount: recipientCount,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          messages: messagesWithCounts,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
      },
      { status: 500 }
    );
  }
}

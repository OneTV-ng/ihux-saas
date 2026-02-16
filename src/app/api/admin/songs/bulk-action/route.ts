import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema/song.schema';
import { eq, inArray } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-server';
import { notifySongFlagged, notifySongRejected } from '@/lib/notification-service';

/**
 * POST /api/admin/songs/bulk-action
 *
 * Perform an action on multiple songs (admin only)
 *
 * Body:
 * {
 *   action: 'flag' | 'reject' | 'ignore' | 'feature',
 *   songIds?: string[],        // Manual selection
 *   filter?: {                 // OR filter-based selection
 *     status?: string,
 *     userId?: string
 *   },
 *   actionData?: {
 *     reason?: string,
 *     categories?: string[],   // For 'flag' action
 *     featured?: boolean       // For 'feature' action
 *   }
 * }
 *
 * Flow:
 * 1. Verify admin permission
 * 2. Resolve songs (by IDs or filter)
 * 3. Perform action on all songs
 * 4. Create notifications (best effort)
 * 5. Return count of affected songs
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const {
      action = '',
      songIds = [],
      filter = {},
      actionData = {},
    } = body;

    // Validate action
    const validActions = ['flag', 'reject', 'ignore', 'feature'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid action. Valid: ${validActions.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Resolve songs
    let targetSongs: typeof songs.$inferSelect[] = [];

    if (songIds.length > 0) {
      // Get songs by IDs
      targetSongs = await db
        .select()
        .from(songs)
        .where(inArray(songs.id, songIds));
    } else if (Object.keys(filter).length > 0) {
      // Get songs by filter
      let query = db.select().from(songs);

      if (filter.status) {
        query = query.where(eq(songs.status, filter.status));
      }

      if (filter.userId) {
        query = query.where(eq(songs.userId, filter.userId));
      }

      targetSongs = await query;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Either songIds or filter must be provided',
        },
        { status: 400 }
      );
    }

    // Validate we have songs to process
    if (targetSongs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No songs found matching the specified criteria',
        },
        { status: 400 }
      );
    }

    // Limit to 1000 songs max for performance
    if (targetSongs.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many songs (${targetSongs.length}). Max: 1,000`,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    let affectedCount = 0;

    // Perform action
    switch (action) {
      case 'flag':
        {
          const { categories = [], reason = '' } = actionData;

          if (!reason || reason.trim().length === 0) {
            return NextResponse.json(
              { success: false, error: 'reason is required for flag action' },
              { status: 400 }
            );
          }

          // Update all songs to flagged
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
            .where(inArray(songs.id, targetSongs.map((s) => s.id)));

          affectedCount = targetSongs.length;

          // Create notifications (best effort)
          try {
            for (const song of targetSongs) {
              try {
                await notifySongFlagged(song.userId, song.title, reason, song.id);
              } catch (err) {
                console.error(`Failed to notify user ${song.userId}:`, err);
              }
            }
          } catch (err) {
            console.error('Failed to create flag notifications:', err);
          }
        }
        break;

      case 'reject':
        {
          const { reason = '' } = actionData;

          if (!reason || reason.trim().length === 0) {
            return NextResponse.json(
              { success: false, error: 'reason is required for reject action' },
              { status: 400 }
            );
          }

          // Update all songs to rejected
          await db
            .update(songs)
            .set({
              status: 'rejected',
              flagReason: reason,
              flaggedBy: adminUserId,
              flaggedAt: now,
              updatedAt: now,
            })
            .where(inArray(songs.id, targetSongs.map((s) => s.id)));

          affectedCount = targetSongs.length;

          // Create notifications (best effort)
          try {
            for (const song of targetSongs) {
              try {
                await notifySongRejected(song.userId, song.title, reason, song.id);
              } catch (err) {
                console.error(`Failed to notify user ${song.userId}:`, err);
              }
            }
          } catch (err) {
            console.error('Failed to create rejection notifications:', err);
          }
        }
        break;

      case 'ignore':
        {
          // Update all songs to ignored
          await db
            .update(songs)
            .set({
              status: 'ignored',
              flaggedBy: adminUserId,
              flaggedAt: now,
              updatedAt: now,
            })
            .where(inArray(songs.id, targetSongs.map((s) => s.id)));

          affectedCount = targetSongs.length;
        }
        break;

      case 'feature':
        {
          const { featured = true } = actionData;

          // Update all songs featured status
          await db
            .update(songs)
            .set({
              isFeatured: featured,
              updatedAt: now,
            })
            .where(inArray(songs.id, targetSongs.map((s) => s.id)));

          affectedCount = targetSongs.length;
        }
        break;
    }

    return NextResponse.json(
      {
        success: true,
        message: `Bulk ${action} completed. Affected ${affectedCount} song(s)`,
        data: {
          action: action,
          affectedCount: affectedCount,
          totalProcessed: targetSongs.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform bulk action',
      },
      { status: 500 }
    );
  }
}

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { songs, adminTasks, adminAlerts, royalties, Song } from "@/db/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { DxlApiHandler, DxlApiContext, DxlApiResponse } from "@/lib/dxl-api-handler";

export class AdminHandler extends DxlApiHandler {
  async process(request: NextRequest, operation: string): Promise<DxlApiResponse> {
    const context = await this.extractContext(request);

    // Check admin permission for all operations
    if (!this.checkAdminPermission(context)) {
      return this.errorResponse(
        `admin.${operation}`,
        "admin",
        "Admin access required",
        403,
        "Forbidden"
      );
    }

    switch (operation) {
      case "approvals":
        return this.getApprovals(request, context);
      case "approve":
        return this.approveSong(request, context);
      case "flag":
        return this.flagSong(request, context);
      case "dashboard.stats":
        return this.getDashboardStats(request, context);
      case "tasks.list":
        return this.listTasks(request, context);
      case "tasks.create":
        return this.createTask(request, context);
      case "alerts.list":
        return this.listAlerts(request, context);
      case "royalty.list":
        return this.listRoyalties(request, context);
      case "royalty.user_inflow":
        return this.getUserRoyaltyInflow(request, context);
      default:
        return this.errorResponse(
          `admin.${operation}`,
          "admin",
          "Invalid operation",
          400,
          "BadRequest"
        );
    }
  }

  private async getApprovals(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      const pendingSongs = await db
        .select()
        .from(songs)
        .where(eq(songs.status, "checking"))
        .orderBy(desc(songs.createdAt));

      return this.successResponse(
        "admin.approvals",
        "admin",
        {
          total: pendingSongs.length,
          pending: pendingSongs.map((song: Song) => ({
            id: song.id,
            title: song.title,
            artist_id: song.artistId,
            artist_name: song.artistName,
            status: song.status,
            submitted_at: song.createdAt,
          })),
        },
        "Pending approvals retrieved"
      );
    } catch (error: any) {
      return this.errorResponse(
        "admin.approvals",
        "admin",
        error.message || "Failed to retrieve approvals",
        500,
        "InternalError"
      );
    }
  }

  private async approveSong(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      const body = await request.json();
      const { song_id, status, note } = body;

      if (!song_id || !status) {
        return this.errorResponse(
          "admin.approve",
          "admin",
          "Missing required fields",
          422,
          "ValidationError",
          { required: ["song_id", "status"] }
        );
      }

      await db
        .update(songs)
        .set({
          status,
          approvedBy: context.userId,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(songs.id, song_id));

      const [approvedSong] = await db
        .select()
        .from(songs)
        .where(eq(songs.id, song_id));

      if (!approvedSong) {
        return this.errorResponse(
          "admin.approve",
          "admin",
          "Song not found",
          404,
          "NotFound"
        );
      }

      return this.successResponse(
        "admin.approve",
        "admin",
        {
          song_id: approvedSong.id,
          status: approvedSong.status,
          approved_at: approvedSong.approvedAt,
        },
        "Song approved successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "admin.approve",
        "admin",
        error.message || "Failed to approve song",
        500,
        "InternalError"
      );
    }
  }

  private async flagSong(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      const body = await request.json();
      const { song_id, flag_type, reason, details } = body;

      if (!song_id || !flag_type || !reason) {
        return this.errorResponse(
          "admin.flag",
          "admin",
          "Missing required fields",
          422,
          "ValidationError",
          { required: ["song_id", "flag_type", "reason"] }
        );
      }

      await db
        .update(songs)
        .set({
          status: "flagged",
          flagType: flag_type,
          flagReason: reason,
          flaggedBy: context.userId,
          flaggedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(songs.id, song_id));

      const [flaggedSong] = await db
        .select()
        .from(songs)
        .where(eq(songs.id, song_id));

      if (!flaggedSong) {
        return this.errorResponse(
          "admin.flag",
          "admin",
          "Song not found",
          404,
          "NotFound"
        );
      }

      // Create alert
      await db.insert(adminAlerts).values({
        id: randomUUID(),
        type: "flag",
        severity: "warning",
        title: `Song flagged: ${flaggedSong.title}`,
        message: reason,
        entityType: "song",
        entityId: song_id,
        status: "active",
        metadata: details || {},
      });

      return this.successResponse(
        "admin.flag",
        "admin",
        {
          song_id: flaggedSong.id,
          status: flaggedSong.status,
          flag_type: flaggedSong.flagType,
          flagged_at: flaggedSong.flaggedAt,
        },
        "Song flagged successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "admin.flag",
        "admin",
        error.message || "Failed to flag song",
        500,
        "InternalError"
      );
    }
  }

  private async getDashboardStats(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      // Get various statistics
      const [songsStats] = await db
        .select({
          total: sql<number>`count(*)`,
          pending: sql<number>`SUM(CASE WHEN status = 'checking' THEN 1 ELSE 0 END)`,
          approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
          flagged: sql<number>`SUM(CASE WHEN status = 'flagged' THEN 1 ELSE 0 END)`,
        })
        .from(songs)
        .where(isNull(songs.deletedAt));

      const [tasksStats] = await db
        .select({
          total: sql<number>`count(*)`,
          pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
          in_progress: sql<number>`SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)`,
          completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
        })
        .from(adminTasks);

      const [alertsStats] = await db
        .select({
          total: sql<number>`count(*)`,
          active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
          critical: sql<number>`SUM(CASE WHEN severity = 'critical' AND status = 'active' THEN 1 ELSE 0 END)`,
        })
        .from(adminAlerts);

      return this.successResponse(
        "admin.dashboard.stats",
        "admin",
        {
          songs: songsStats,
          tasks: tasksStats,
          alerts: alertsStats,
          timestamp: new Date().toISOString(),
        },
        "Dashboard stats retrieved"
      );
    } catch (error: any) {
      return this.errorResponse(
        "admin.dashboard.stats",
        "admin",
        error.message || "Failed to retrieve dashboard stats",
        500,
        "InternalError"
      );
    }
  }

  private async listTasks(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      const { page, limit, offset } = this.getPaginationParams(request);

      const tasks = await db
        .select()
        .from(adminTasks)
        .orderBy(desc(adminTasks.createdAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(adminTasks);

      return this.successResponse(
        "admin.tasks.list",
        "admin",
        {
          total: Number(countResult.count),
          page,
          limit,
          items: tasks,
        },
        "Tasks retrieved successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "admin.tasks.list",
        "admin",
        error.message || "Failed to retrieve tasks",
        500,
        "InternalError"
      );
    }
  }

  private async createTask(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      const body = await request.json();
      const { title, description, priority, assigned_to, due_date } = body;

      if (!title) {
        return this.errorResponse(
          "admin.tasks.create",
          "admin",
          "Task title is required",
          422,
          "ValidationError"
        );
      }

      const taskId = randomUUID();
      await db
        .insert(adminTasks)
        .values({
          id: taskId,
          title,
          description,
          priority: priority || "medium",
          assignedTo: assigned_to,
          createdBy: context.userId!,
          dueDate: due_date ? new Date(due_date) : undefined,
          status: "pending",
        });

      const [task] = await db
        .select()
        .from(adminTasks)
        .where(eq(adminTasks.id, taskId));

      return this.successResponse(
        "admin.tasks.create",
        "admin",
        task,
        "Task created successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "admin.tasks.create",
        "admin",
        error.message || "Failed to create task",
        500,
        "InternalError"
      );
    }
  }

  private async listAlerts(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      const url = new URL(request.url);
      const status = url.searchParams.get("status") || "active";

      const alerts = await db
        .select()
        .from(adminAlerts)
        .where(eq(adminAlerts.status, status))
        .orderBy(desc(adminAlerts.createdAt))
        .limit(50);

      return this.successResponse(
        "admin.alerts.list",
        "admin",
        {
          total: alerts.length,
          items: alerts,
        },
        "Alerts retrieved successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "admin.alerts.list",
        "admin",
        error.message || "Failed to retrieve alerts",
        500,
        "InternalError"
      );
    }
  }

  private async listRoyalties(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      const { page, limit, offset } = this.getPaginationParams(request);
      const url = new URL(request.url);
      const period = url.searchParams.get("period");
      const status = url.searchParams.get("status");

      const conditions: any[] = [];
      if (period) conditions.push(eq(royalties.period, period));
      if (status) conditions.push(eq(royalties.paymentStatus, status));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await db
        .select()
        .from(royalties)
        .where(whereClause)
        .orderBy(desc(royalties.createdAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(royalties)
        .where(whereClause);

      return this.successResponse(
        "admin.royalty.list",
        "admin",
        {
          total: Number(countResult.count),
          page,
          limit,
          items: results,
        },
        "Royalties retrieved successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "admin.royalty.list",
        "admin",
        error.message || "Failed to retrieve royalties",
        500,
        "InternalError"
      );
    }
  }

  private async getUserRoyaltyInflow(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("user_id");
      const artistId = url.searchParams.get("artist_id");
      const songId = url.searchParams.get("song_id");

      if (!userId && !artistId && !songId) {
        return this.errorResponse(
          "admin.royalty.user_inflow",
          "admin",
          "One of user_id, artist_id, or song_id is required",
          400,
          "BadRequest"
        );
      }

      const conditions: any[] = [];
      if (userId) conditions.push(eq(royalties.userId, userId));
      if (artistId) conditions.push(eq(royalties.artistId, artistId));
      if (songId) conditions.push(eq(royalties.songId, songId));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await db
        .select()
        .from(royalties)
        .where(whereClause)
        .orderBy(desc(royalties.period));

      // Calculate totals
      const totals = results.reduce(
        (acc: any, r: any) => ({
          gross: acc.gross + parseFloat(r.grossAmountUsd as string),
          net: acc.net + parseFloat(r.netAmountUsd as string),
        }),
        { gross: 0, net: 0 }
      );

      return this.successResponse(
        "admin.royalty.user_inflow",
        "admin",
        {
          total_records: results.length,
          total_gross_usd: totals.gross.toFixed(2),
          total_net_usd: totals.net.toFixed(2),
          records: results,
        },
        "User royalty inflow retrieved successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "admin.royalty.user_inflow",
        "admin",
        error.message || "Failed to retrieve royalty inflow",
        500,
        "InternalError"
      );
    }
  }
}

import type { User } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users as userTable, sessions as sessionTable } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-server";
import { isRoleHigher, canTransitionRole } from "@/lib/role-utils";
import { approveVerification } from "@/lib/user-verification";

interface BulkResult {
  success: number;
  failed: number;
  errors: Array<{ userId: string; error: string }>;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const { action, userIds, banReason, banExpiresIn, role } = body;

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "action and userIds[] are required" },
        { status: 400 }
      );
    }

    const adminRole = session.user.role || "admin";
    const adminId = session.user.id;

    // Fetch all target users
    const targetUsers = await db
      .select({ id: userTable.id, role: userTable.role, name: userTable.name })
      .from(userTable)
      .where(inArray(userTable.id, userIds));

    const result: BulkResult = { success: 0, failed: 0, errors: [] };

    for (const target of targetUsers) {
      const targetRole = target.role || "new";

      // Skip users with equal or higher power level
      if (!isRoleHigher(adminRole, targetRole) && adminRole !== "sadmin") {
        result.failed++;
        result.errors.push({
          userId: target.id,
          error: `Cannot modify ${target.name || target.id} (role: ${targetRole})`,
        });
        continue;
      }

      try {
        switch (action) {
          case "ban": {
            const banExpires = banExpiresIn
              ? new Date(Date.now() + banExpiresIn * 1000)
              : null;
            await db
              .update(userTable)
              .set({
                banned: true,
                banReason: banReason || "Banned by admin",
                banExpires,
                updatedAt: new Date(),
              })
              .where(eq(userTable.id, target.id));
            result.success++;
            break;
          }
          case "unban": {
            await db
              .update(userTable)
              .set({
                banned: false,
                banReason: null,
                banExpires: null,
                updatedAt: new Date(),
              })
              .where(eq(userTable.id, target.id));
            result.success++;
            break;
          }
          case "delete": {
            await db.delete(userTable).where(eq(userTable.id, target.id));
            result.success++;
            break;
          }
          case "setRole": {
            if (!role) {
              result.failed++;
              result.errors.push({ userId: target.id, error: "Role is required" });
              continue;
            }
            const transition = canTransitionRole(targetRole, role, adminRole);
            if (!transition.allowed) {
              result.failed++;
              result.errors.push({ userId: target.id, error: transition.reason || "Role transition not allowed" });
              continue;
            }
            await db
              .update(userTable)
              .set({ role, updatedAt: new Date() })
              .where(eq(userTable.id, target.id));
            result.success++;
            break;
          }
          case "verify": {
            await db
              .update(userTable)
              .set({ emailVerified: true, updatedAt: new Date() })
              .where(eq(userTable.id, target.id));
            await approveVerification(target.id, adminId).catch(() => {});
            result.success++;
            break;
          }
          case "revokeSessions": {
            await db
              .delete(sessionTable)
              .where(eq(sessionTable.userId, target.id));
            result.success++;
            break;
          }
          default:
            result.failed++;
            result.errors.push({ userId: target.id, error: `Unknown action: ${action}` });
        }
      } catch (err) {
        result.failed++;
        result.errors.push({
          userId: target.id,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    // Report users not found
    const foundIds = new Set(targetUsers.map((u: User) => u.id));
    for (const uid of userIds) {
      if (!foundIds.has(uid)) {
        result.failed++;
        result.errors.push({ userId: uid, error: "User not found" });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bulk operation failed";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

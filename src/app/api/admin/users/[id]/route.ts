import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users as userTable, account as accountTable, sessions as sessionTable, usersVerification as userVerification } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-server";
import { canTransitionRole, isRoleHigher } from "@/lib/role-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const userData = await db.select().from(userTable).where(eq(userTable.id, id)).limit(1);
    if (!userData.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const accounts = await db
      .select({ providerId: accountTable.providerId })
      .from(accountTable)
      .where(eq(accountTable.userId, id));

    const sessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessionTable)
      .where(eq(sessionTable.userId, id));

    const verification = await db
      .select()
      .from(userVerification)
      .where(eq(userVerification.userId, id))
      .limit(1);

    return NextResponse.json({
      user: userData[0],
      accounts: accounts.map((a: { providerId: string }) => a.providerId),
      sessionCount: sessions[0]?.count ?? 0,
      verification: verification[0] ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    // Get target user
    const targetUser = await db.select().from(userTable).where(eq(userTable.id, id)).limit(1);
    if (!targetUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const adminRole = session.user.role || "admin";
    const targetRole = targetUser[0].role || "new";

    // Admin must have higher power level than target
    if (!isRoleHigher(adminRole, targetRole) && adminRole !== "sadmin") {
      return NextResponse.json(
        { error: "Cannot modify a user with equal or higher role" },
        { status: 403 }
      );
    }

    // If role change, validate transition
    if (body.role && body.role !== targetRole) {
      const transition = canTransitionRole(targetRole, body.role, adminRole);
      if (!transition.allowed) {
        return NextResponse.json({ error: transition.reason }, { status: 403 });
      }
    }

    // Build update object with only allowed fields
    const allowedFields = [
      "name", "email", "username", "phone", "whatsapp", "dateOfBirth",
      "address", "recordLabel", "role", "apiClass", "emailVerified",
      "image", "socialMedia", "bankDetails", "settings",
      "banned", "banReason", "banExpires",
    ] as const;

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updateData.updatedAt = new Date();

    await db.update(userTable).set(updateData).where(eq(userTable.id, id));

    const updated = await db.select().from(userTable).where(eq(userTable.id, id)).limit(1);

    return NextResponse.json({ user: updated[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

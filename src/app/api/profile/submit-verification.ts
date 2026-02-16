import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { users, usersVerification } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST - Submit profile for verification
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Update user_verification status to 'submitted'
    await db.update(usersVerification)
      .set({ status: "submitted", submittedAt: now })
      .where(eq(usersVerification.userId, session.user.id));

    // Update user role from 'new' to 'member' upon verification submission
    await db.update(users)
      .set({ role: "member" })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Profile submitted for verification. Your role has been updated to member."
    });
  } catch (error) {
    console.error("Error submitting for verification:", error);
    return NextResponse.json({ error: "Failed to submit for verification" }, { status: 500 });
  }
}

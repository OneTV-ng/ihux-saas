import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user, userVerification } from "@/db/schema";
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

    // Update user_verification status to 'submitted'
    await db.update(userVerification)
      .set({ status: "submitted", submittedAt: new Date() })
      .where(eq(userVerification.userId, session.user.id));

    // Optionally, update user table if you want to reflect verification status
    // await db.update(user).set({ verification: "submitted" }).where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true, message: "Profile submitted for verification." });
  } catch (error) {
    console.error("Error submitting for verification:", error);
    return NextResponse.json({ error: "Failed to submit for verification" }, { status: 500 });
  }
}

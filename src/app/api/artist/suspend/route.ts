import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { artists, artistProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST - Suspend/unsuspend an artist
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { artistId, suspend = true } = body;

    if (!artistId) {
      return NextResponse.json(
        { error: "Artist ID is required" },
        { status: 400 }
      );
    }

    // Verify artist exists and user owns it
    const [artist] = await db
      .select()
      .from(artists)
      .where(eq(artists.id, artistId))
      .limit(1);

    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    if (artist.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to modify this artist" },
        { status: 403 }
      );
    }

    // Update public status (suspend = make not public)
    await db
      .update(artistProfiles)
      .set({
        isPublic: !suspend,
        updatedAt: new Date(),
      })
      .where(eq(artistProfiles.artistId, artistId));

    return NextResponse.json({
      success: true,
      message: suspend ? "Artist suspended successfully" : "Artist activated successfully",
      data: { artistId, isPublic: !suspend },
    });
  } catch (error: any) {
    console.error("Error suspending artist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to suspend artist" },
      { status: 500 }
    );
  }
}

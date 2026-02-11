import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { eq } from "drizzle-orm";

// Mock artist table - you can replace this with your actual artist schema when ready
// For now, we'll return a mock response

// GET - Fetch default artist for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    // Verify the user is requesting their own data or is admin
    if (userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // TODO: Replace with actual database query when artist table is ready
    // const defaultArtist = await db
    //   .select()
    //   .from(artist)
    //   .where(and(eq(artist.userId, userId), eq(artist.isDefault, true)))
    //   .limit(1);

    // Mock response for now - check if user has artist profile based on username/name
    const mockArtist = {
      id: `artist_${userId}`,
      name: session.user.name || "Artist Name",
      image: session.user.image || null,
      bio: null,
      userId: userId,
      isDefault: true,
    };

    return NextResponse.json({
      success: true,
      data: mockArtist,
    });
  } catch (error) {
    console.error("Error fetching default artist:", error);
    return NextResponse.json(
      { error: "Failed to fetch default artist" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { setUserSelectedArtist, clearUserSelectedArtist } from "@/lib/artist-service";

// POST - Select an artist as active/current
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { artistId } = body;

    if (!artistId) {
      // Clear selection
      await clearUserSelectedArtist(session.user.id);
      return NextResponse.json({
        success: true,
        message: "Artist selection cleared",
        data: null,
      });
    }

    // Set selected artist
    await setUserSelectedArtist(session.user.id, artistId);

    return NextResponse.json({
      success: true,
      message: "Artist selected successfully",
      data: { artistId },
    });
  } catch (error: any) {
    console.error("Error selecting artist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to select artist" },
      { status: 500 }
    );
  }
}

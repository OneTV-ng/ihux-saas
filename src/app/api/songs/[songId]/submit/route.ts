import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs, tracks } from "@/db/music-schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/auth-server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  const startTime = Date.now();
  const { songId } = await params;

  console.log("\n" + "=".repeat(80));
  console.log("📤 [SUBMIT SONG] Endpoint called");
  console.log("📌 [SUBMIT SONG] Song ID:", songId);
  console.log("⏰ [SUBMIT SONG] Request time:", new Date().toISOString());
  console.log("=".repeat(80));

  try {
    // Stage 1: Authenticate user
    console.log("\n👤 [STAGE 1] Authenticating user...");
    const session = await getServerSession();

    if (!session?.user?.email) {
      console.error("❌ [STAGE 1] User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.email;
    console.log("✅ [STAGE 1] User authenticated:", userId);

    // Stage 2: Fetch and verify song
    console.log("\n🔍 [STAGE 2] Fetching song...");

    const songResult = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    if (!songResult || songResult.length === 0) {
      console.error("❌ [STAGE 2] Song not found");
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const song = songResult[0];
    console.log("✅ [STAGE 2] Song found:", songId);

    // Verify user owns the song
    if (song.createdBy !== userId) {
      console.error("❌ [STAGE 2] User doesn't own this song");
      return NextResponse.json(
        { error: "Forbidden - song doesn't belong to you" },
        { status: 403 }
      );
    }

    console.log("✅ [STAGE 2] User owns this song");

    // Stage 3: Verify song status is "new"
    console.log("\n✔️ [STAGE 3] Checking song status...");

    if (song.status !== "new") {
      console.error("❌ [STAGE 3] Cannot submit song with status:", song.status);
      return NextResponse.json(
        {
          error: `Song has already been submitted or processed. Current status: "${song.status}". Only songs with status "new" can be submitted.`,
        },
        { status: 409 }
      );
    }

    console.log("✅ [STAGE 3] Song status is 'new' - ready to submit");

    // Stage 4: Verify song has tracks
    console.log("\n🎼 [STAGE 4] Checking track count...");

    const trackResults = await db
      .select()
      .from(tracks)
      .where(eq(tracks.songId, songId));

    const trackCount = trackResults.length;
    console.log(`✅ [STAGE 4] Song has ${trackCount} track(s)`);

    if (trackCount === 0) {
      console.error("❌ [STAGE 4] Cannot submit song without tracks");
      return NextResponse.json(
        { error: "Song must have at least one track before submission" },
        { status: 400 }
      );
    }

    // Stage 5: Validate track count based on song type
    console.log("\n🔢 [STAGE 5] Validating track count for song type...");
    console.log(`📋 [STAGE 5] Song type: ${song.type}, Track count: ${trackCount}`);

    const typeValidation: Record<string, { min: number; max: number }> = {
      single: { min: 1, max: 1 },
      medley: { min: 2, max: 4 },
      album: { min: 5, max: Infinity },
    };

    const validation = typeValidation[song.type];

    if (!validation) {
      console.error("❌ [STAGE 5] Invalid song type:", song.type);
      return NextResponse.json(
        { error: "Invalid song type" },
        { status: 400 }
      );
    }

    if (trackCount < validation.min || trackCount > validation.max) {
      let errorMessage = "";
      if (song.type === "single") {
        errorMessage = `Single must have exactly 1 track. Current: ${trackCount}`;
      } else if (song.type === "medley") {
        errorMessage = `Medley must have 2-4 tracks. Current: ${trackCount}`;
      } else if (song.type === "album") {
        errorMessage = `Album must have at least 5 tracks. Current: ${trackCount}`;
      }

      console.error("❌ [STAGE 5]", errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    console.log("✅ [STAGE 5] Track count is valid for song type");

    // Stage 6: Update song status to "submitted"
    console.log("\n💾 [STAGE 6] Submitting song...");

    const now = new Date();
    await db
      .update(songs)
      .set({
        status: "submitted",
        updatedAt: now,
      })
      .where(eq(songs.id, songId));

    // Fetch updated song
    const updatedSongResult = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    if (!updatedSongResult || updatedSongResult.length === 0) {
      console.error("❌ [STAGE 6] Failed to update song status");
      return NextResponse.json(
        { error: "Failed to submit song" },
        { status: 500 }
      );
    }

    const updatedSong = updatedSongResult[0];
    console.log("✅ [STAGE 6] Song status updated to 'submitted'");

    // Success response
    const totalTime = Date.now() - startTime;
    console.log("\n" + "=".repeat(80));
    console.log("✨ [SUCCESS] Song submitted successfully!");
    console.log("📌 [RESULT] Song ID:", songId);
    console.log("📊 [RESULT] Total tracks:", trackCount);
    console.log("✔️ [RESULT] New status: submitted");
    console.log("⏱️ [RESULT] Total processing time:", totalTime, "ms");
    console.log("=".repeat(80));
    console.log("📝 [INFO] Admin will now review this submission for approval");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({
      success: true,
      song: {
        id: updatedSong.id,
        title: updatedSong.title,
        artistName: updatedSong.artistName,
        type: updatedSong.type,
        numberOfTracks: updatedSong.numberOfTracks,
        status: updatedSong.status,
        createdAt: updatedSong.createdAt,
        updatedAt: updatedSong.updatedAt,
      },
      tracks: trackResults,
      message: "Song submitted for review successfully. Admin will review and approve or reject.",
      processingTime: totalTime,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] Song submission failed!");
    console.error("⏱️ [ERROR] Time before failure:", totalTime, "ms");
    console.error("📋 [ERROR] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : typeof error,
    });
    console.error("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit song" },
      { status: 500 }
    );
  }
}

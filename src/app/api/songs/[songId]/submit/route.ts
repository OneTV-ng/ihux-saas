import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { songs, tracks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: { songId: string } }
) {
  console.log("\n" + "=".repeat(80));
  console.log("📤 [SUBMIT SONG] Endpoint called");
  console.log(`📌 Song ID: ${params.songId}`);

  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.error("❌ [SUBMIT SONG] No active session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`✅ [SUBMIT SONG] User authenticated: ${userId}`);

    // Fetch song
    const songRecords = await db
      .select()
      .from(songs)
      .where(eq(songs.id, params.songId))
      .limit(1);

    if (!songRecords || songRecords.length === 0) {
      console.error("❌ [SUBMIT SONG] Song not found:", params.songId);
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const song = songRecords[0];

    // Verify user owns the song
    if (song.createdBy !== userId) {
      console.error("❌ [SUBMIT SONG] Unauthorized - user doesn't own song");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify song status is 'new'
    if (song.status !== "new") {
      console.error("❌ [SUBMIT SONG] Song already submitted or in invalid state");
      return NextResponse.json(
        { error: "Song is not in 'new' status and cannot be submitted" },
        { status: 400 }
      );
    }

    // Verify song has tracks
    if (song.numberOfTracks === 0) {
      console.error("❌ [SUBMIT SONG] Song has no tracks");
      return NextResponse.json(
        { error: "Song must have at least one track to submit" },
        { status: 400 }
      );
    }

    // Validate track count based on type
    if (song.type === "single" && song.numberOfTracks !== 1) {
      console.error("❌ [SUBMIT SONG] Single must have exactly 1 track");
      return NextResponse.json(
        { error: "Single must have exactly 1 track" },
        { status: 400 }
      );
    }

    if (song.type === "medley" && (song.numberOfTracks < 2 || song.numberOfTracks > 4)) {
      console.error("❌ [SUBMIT SONG] Medley must have 2-4 tracks");
      return NextResponse.json(
        { error: "Medley must have 2-4 tracks" },
        { status: 400 }
      );
    }

    if (song.type === "album" && song.numberOfTracks < 5) {
      console.error("❌ [SUBMIT SONG] Album must have at least 5 tracks");
      return NextResponse.json(
        { error: "Album must have at least 5 tracks" },
        { status: 400 }
      );
    }

    // Update song status to 'submitted'
    const now = new Date();
    try {
      await db
        .update(songs)
        .set({
          status: "submitted",
          updatedAt: now,
        })
        .where(eq(songs.id, params.songId));

      console.log("✅ [SUBMIT SONG] Song status updated to 'submitted'");
    } catch (dbError) {
      console.error("❌ [SUBMIT SONG] Database error:");
      if (dbError instanceof Error) {
        console.error("Message:", dbError.message);
      }
      throw dbError;
    }

    // Fetch updated song with all tracks
    const updatedSongRecords = await db
      .select()
      .from(songs)
      .where(eq(songs.id, params.songId))
      .limit(1);

    const updatedSong = updatedSongRecords[0];

    const allTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.songId, params.songId));

    console.log("\n" + "=".repeat(80));
    console.log("✨ [SUCCESS] Song submitted successfully");
    console.log("📌 [RESULT] Song ID:", params.songId);
    console.log("📌 [RESULT] Status:", updatedSong.status);
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({
      success: true,
      song: {
        id: updatedSong.id,
        title: updatedSong.title,
        status: updatedSong.status,
        numberOfTracks: updatedSong.numberOfTracks,
        tracks: allTracks,
      },
      message: "Song submitted for review successfully",
    });
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] Failed to submit song!");
    if (error instanceof Error) {
      console.error("📋 Error Message:", error.message);
      console.error("📋 Error Stack:", error.stack);
    }
    console.error("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: "Failed to submit song" },
      { status: 500 }
    );
  }
}

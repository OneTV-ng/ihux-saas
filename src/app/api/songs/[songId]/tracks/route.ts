import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { songs, tracks, uploads } from "@/db/music-schema";
import { eq } from "drizzle-orm";

// Helper to generate UUID
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { songId: string } }
) {
  console.log("\n" + "=".repeat(80));
  console.log("🎵 [ADD TRACK] Endpoint called");
  console.log(`📌 Song ID: ${params.songId}`);

  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.error("❌ [ADD TRACK] No active session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`✅ [ADD TRACK] User authenticated: ${userId}`);

    // Parse request body
    const body = await req.json();
    const {
      title,
      audioFileUploadId,
      duration,
      explicit,
      isrc,
      lyrics,
      leadVocal,
      featured,
      producer,
      writer,
    } = body;

    console.log(`📋 [ADD TRACK] Request body:`, {
      title,
      audioFileUploadId,
      duration,
    });

    // Validate required fields
    if (!title || !audioFileUploadId) {
      console.error("❌ [ADD TRACK] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: title, audioFileUploadId" },
        { status: 400 }
      );
    }

    // Verify song exists and user owns it
    const songRecords = await db
      .select()
      .from(songs)
      .where(eq(songs.id, params.songId))
      .limit(1);

    if (!songRecords || songRecords.length === 0) {
      console.error("❌ [ADD TRACK] Song not found:", params.songId);
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const song = songRecords[0];

    // Verify user owns the song
    if (song.createdBy !== userId) {
      console.error("❌ [ADD TRACK] Unauthorized - user doesn't own song");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify song status is 'new'
    if (song.status !== "new") {
      console.error("❌ [ADD TRACK] Cannot add tracks to submitted song");
      return NextResponse.json(
        { error: "Cannot add tracks to submitted song" },
        { status: 400 }
      );
    }

    // Verify upload exists
    const uploadRecords = await db
      .select()
      .from(uploads)
      .where(eq(uploads.id, audioFileUploadId))
      .limit(1);

    if (!uploadRecords || uploadRecords.length === 0) {
      console.error("❌ [ADD TRACK] Upload not found:", audioFileUploadId);
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    const upload = uploadRecords[0];
    console.log("✅ [ADD TRACK] Upload verified");

    // Get next track number
    const maxTrackResult = await db
      .select({
        maxTrackNumber: tracks.trackNumber,
      })
      .from(tracks)
      .where(eq(tracks.songId, params.songId));

    const maxTrackNumber =
      maxTrackResult && maxTrackResult.length > 0
        ? Math.max(...maxTrackResult.map((r) => r.maxTrackNumber || 0))
        : 0;

    const nextTrackNumber = maxTrackNumber + 1;
    console.log(`🔢 [ADD TRACK] Next track number: ${nextTrackNumber}`);

    // Create track
    const trackId = generateId();
    const now = new Date();

    try {
      await db.insert(tracks).values({
        id: trackId,
        songId: params.songId,
        trackNumber: nextTrackNumber,
        title: title.trim(),
        mp3: upload.url || "",
        duration: duration || undefined,
        explicit: explicit || "no",
        isrc: isrc || undefined,
        lyrics: lyrics || undefined,
        leadVocal: leadVocal || undefined,
        featured: featured || undefined,
        producer: producer || undefined,
        writer: writer || undefined,
        createdAt: now,
        updatedAt: now,
      });

      console.log("✅ [ADD TRACK] Track created in database");
    } catch (dbError) {
      console.error("❌ [ADD TRACK] Database error:");
      if (dbError instanceof Error) {
        console.error("Message:", dbError.message);
      }
      throw dbError;
    }

    // Update song numberOfTracks
    try {
      await db
        .update(songs)
        .set({
          numberOfTracks: song.numberOfTracks + 1,
          updatedAt: now,
        })
        .where(eq(songs.id, params.songId));

      console.log("✅ [ADD TRACK] Song updated with new track count");
    } catch (updateError) {
      console.error("❌ [ADD TRACK] Failed to update song:");
      if (updateError instanceof Error) {
        console.error("Message:", updateError.message);
      }
      throw updateError;
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
    console.log("✨ [SUCCESS] Track added successfully");
    console.log("📌 [RESULT] Track ID:", trackId);
    console.log("📌 [RESULT] Track Number:", nextTrackNumber);
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({
      success: true,
      track: {
        id: trackId,
        songId: params.songId,
        trackNumber: nextTrackNumber,
        title: title.trim(),
        mp3: upload.url,
        duration: duration || undefined,
        createdAt: now,
      },
      song: {
        id: updatedSong.id,
        title: updatedSong.title,
        numberOfTracks: updatedSong.numberOfTracks,
        tracks: allTracks,
      },
    });
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] Failed to add track!");
    if (error instanceof Error) {
      console.error("📋 Error Message:", error.message);
      console.error("📋 Error Stack:", error.stack);
    }
    console.error("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: "Failed to add track" },
      { status: 500 }
    );
  }
}

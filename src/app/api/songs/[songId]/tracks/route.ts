import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs, tracks, uploads } from "@/db/music-schema";
import { eq, max } from "drizzle-orm";
import { getServerSession } from "@/lib/auth-server";

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
  { params }: { params: Promise<{ songId: string }> }
) {
  const startTime = Date.now();
  const { songId } = await params;

  console.log("\n" + "=".repeat(80));
  console.log("🎼 [ADD TRACK] Endpoint called");
  console.log("📌 [ADD TRACK] Song ID:", songId);
  console.log("⏰ [ADD TRACK] Request time:", new Date().toISOString());
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

    // Stage 2: Parse request body
    console.log("\n📥 [STAGE 2] Parsing request body...");
    const body = await req.json();
    console.log("✅ [STAGE 2] Request parsed successfully");

    const {
      title,
      audioFileUploadId,
      isrc,
      explicit,
      lyrics,
      leadVocal,
      featured,
      producer,
      writer,
      duration,
    } = body;

    console.log("📋 [STAGE 2] Extracted fields:", {
      title,
      audioFileUploadId,
      isrc,
      explicit,
      duration,
    });

    // Stage 3: Validate required fields
    console.log("\n✔️ [STAGE 3] Validating required fields...");

    if (!title || !title.trim()) {
      console.error("❌ [STAGE 3] Track title is required");
      return NextResponse.json(
        { error: "Track title is required" },
        { status: 400 }
      );
    }

    if (!audioFileUploadId || !audioFileUploadId.trim()) {
      console.error("❌ [STAGE 3] Audio file upload ID is required");
      return NextResponse.json(
        { error: "Audio file upload ID is required" },
        { status: 400 }
      );
    }

    console.log("✅ [STAGE 3] All required fields valid");

    // Stage 4: Verify song exists and user owns it
    console.log("\n🔍 [STAGE 4] Verifying song ownership...");

    const song = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    if (!song || song.length === 0) {
      console.error("❌ [STAGE 4] Song not found");
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const songRecord = song[0];
    console.log("✅ [STAGE 4] Song found:", songId);

    // Verify user owns the song
    if (songRecord.createdBy !== userId) {
      console.error("❌ [STAGE 4] User doesn't own this song");
      return NextResponse.json(
        { error: "Forbidden - song doesn't belong to you" },
        { status: 403 }
      );
    }

    console.log("✅ [STAGE 4] User owns this song");

    // Stage 5: Verify song status is "new"
    console.log("\n⚠️ [STAGE 5] Checking song status...");

    if (songRecord.status !== "new") {
      console.error("❌ [STAGE 5] Cannot add tracks to submitted/approved songs");
      return NextResponse.json(
        {
          error: `Cannot add tracks to a song with status "${songRecord.status}". Song must have status "new"`,
        },
        { status: 409 }
      );
    }

    console.log("✅ [STAGE 5] Song status is 'new' - can add tracks");

    // Stage 6: Verify audio file upload exists
    console.log("\n📤 [STAGE 6] Verifying audio file upload...");

    const upload = await db
      .select()
      .from(uploads)
      .where(eq(uploads.id, audioFileUploadId))
      .limit(1);

    if (!upload || upload.length === 0) {
      console.error("❌ [STAGE 6] Upload not found");
      return NextResponse.json(
        { error: "Audio file upload not found" },
        { status: 404 }
      );
    }

    const uploadRecord = upload[0];
    console.log("✅ [STAGE 6] Upload found:", audioFileUploadId);

    if (uploadRecord.status !== "complete") {
      console.error("❌ [STAGE 6] Upload status is not complete");
      return NextResponse.json(
        { error: "Upload must be complete before adding as track" },
        { status: 400 }
      );
    }

    console.log("✅ [STAGE 6] Upload is complete and ready");

    // Stage 7: Get next track number
    console.log("\n🔢 [STAGE 7] Calculating track number...");

    const maxTrackResult = await db
      .select({ maxTrackNumber: max(tracks.trackNumber) })
      .from(tracks)
      .where(eq(tracks.songId, songId));

    const currentMaxTrack = maxTrackResult[0]?.maxTrackNumber || 0;
    const nextTrackNumber = currentMaxTrack + 1;

    console.log(`✅ [STAGE 7] Next track number: ${nextTrackNumber}`);

    // Stage 8: Create track (in transaction with song update)
    console.log("\n🎬 [STAGE 8] Creating track and updating song...");

    const trackId = generateId();
    const now = new Date();

    // Build track insert data with conditional optional fields
    const trackInsertData: any = {
      id: trackId,
      songId,
      trackNumber: nextTrackNumber,
      title: title.trim(),
      mp3: uploadRecord.url,
      explicit: explicit && ["no", "yes", "covered"].includes(explicit) ? explicit : "no",
      duration: duration && typeof duration === "number" ? duration : null,
      createdAt: now,
      updatedAt: now,
    };

    // Add optional fields only if they have values
    if (isrc && isrc.trim()) trackInsertData.isrc = isrc.trim();
    if (lyrics && lyrics.trim()) trackInsertData.lyrics = lyrics.trim();
    if (leadVocal && leadVocal.trim()) trackInsertData.leadVocal = leadVocal.trim();
    if (featured && featured.trim()) trackInsertData.featured = featured.trim();
    if (producer && producer.trim()) trackInsertData.producer = producer.trim();
    if (writer && writer.trim()) trackInsertData.writer = writer.trim();

    console.log("📊 [STAGE 8] Track insert data:", trackInsertData);

    try {
      // Insert track
      const createdTrack = await db.insert(tracks).values(trackInsertData).returning();

      console.log("✅ [STAGE 8a] Track created successfully");

      // Update song numberOfTracks
      const updatedSong = await db
        .update(songs)
        .set({
          numberOfTracks: songRecord.numberOfTracks + 1,
          updatedAt: now,
        })
        .where(eq(songs.id, songId))
        .returning();

      console.log("✅ [STAGE 8b] Song updated with new track count");

      // Fetch updated song with all tracks
      const songWithTracks = await db
        .select()
        .from(songs)
        .where(eq(songs.id, songId))
        .limit(1);

      const allTracks = await db.select().from(tracks).where(eq(tracks.songId, songId));

      const totalTime = Date.now() - startTime;
      console.log("\n" + "=".repeat(80));
      console.log("✨ [SUCCESS] Track added successfully!");
      console.log("📌 [RESULT] Track ID:", trackId);
      console.log("🔢 [RESULT] Track Number:", nextTrackNumber);
      console.log("📊 [RESULT] Total tracks now:", updatedSong[0].numberOfTracks);
      console.log("⏱️ [RESULT] Total processing time:", totalTime, "ms");
      console.log("=".repeat(80) + "\n");

      return NextResponse.json({
        success: true,
        track: createdTrack[0],
        song: {
          id: songWithTracks[0].id,
          title: songWithTracks[0].title,
          numberOfTracks: songWithTracks[0].numberOfTracks,
          status: songWithTracks[0].status,
          tracks: allTracks,
        },
        processingTime: totalTime,
      });
    } catch (err: any) {
      console.error("❌ [STAGE 8] Track creation failed!");
      console.error("📋 Error message:", err instanceof Error ? err.message : String(err));
      console.error("🔍 Error code:", err?.code);
      console.error("📄 Full error:", err);
      throw err;
    }
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] Adding track failed!");
    console.error("⏱️ [ERROR] Time before failure:", totalTime, "ms");
    console.error("📋 [ERROR] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : typeof error,
    });
    console.error("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add track" },
      { status: 500 }
    );
  }
}

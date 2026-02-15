import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs, tracks, uploads } from "@/db/schema";
import { uploadJobs } from "@/db/upload-jobs-schema";
import { eq } from "drizzle-orm";

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper function to remove empty fields from object
function cleanObject(obj: any): any {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Keep field if it has a value and is not an empty string or whitespace-only string
    if (value !== null && value !== undefined && value !== "") {
      if (typeof value === "string" && value.trim() === "") {
        // Skip whitespace-only strings
        continue;
      }
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("\n" + "=".repeat(80));
  console.log("🎵 [API] PUBLISH ENDPOINT CALLED");
  console.log("⏰ [API] Request time:", new Date().toISOString());
  console.log("=".repeat(80));

  try {
    // Stage 1: Parse request
    console.log("\n📥 [STAGE 1] Parsing request body...");
    const body = await req.json();
    console.log("✅ [STAGE 1] Request parsed successfully");
    console.log("📊 [STAGE 1] Payload size:", JSON.stringify(body).length, "bytes");

    // Stage 2: Extract and validate fields
    console.log("\n🔍 [STAGE 2] Extracting and validating fields...");
    const { id, userId, title: titleField, songTitle, type: typeField, songType, genre, language, upc, artistId, artistName, tracks: tracksList, cover, copyrightAcknowledged } = body;

    const title = titleField || songTitle;
    const type = typeField || songType;

    console.log("📋 [STAGE 2] Extracted fields:", {
      jobId: id,
      userId,
      title,
      type,
      artist: artistName,
      genre,
      language,
      tracksCount: tracksList?.length,
      hasCover: !!cover,
      copyrightAcknowledged,
    });

    // Stage 3: Validate copyright
    console.log("\n✔️ [STAGE 3] Validating copyright acknowledgement...");
    if (!copyrightAcknowledged) {
      console.error("❌ [STAGE 3] Copyright not acknowledged!");
      return NextResponse.json({ error: "Copyright acknowledgement required" }, { status: 400 });
    }
    console.log("✅ [STAGE 3] Copyright acknowledged");

    // Stage 4: Validate required fields
    console.log("\n✔️ [STAGE 4] Validating required fields...");
    if (!title || !artistId || !tracksList?.length) {
      console.error("❌ [STAGE 4] Missing required fields:", {
        hasTitle: !!title,
        hasArtistId: !!artistId,
        hasTracksList: !!tracksList?.length,
      });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    console.log("✅ [STAGE 4] All required fields present");

    // Stage 5: Generate IDs
    console.log("\n🆔 [STAGE 5] Generating song and track IDs...");
    const songId = generateId();
    const now = new Date();
    console.log("✅ [STAGE 5] Song ID generated:", songId);

    // Stage 6: Create song record FIRST (before tracks due to foreign key constraint)
    console.log("\n🎵 [STAGE 6] Creating song record...");
    const totalDuration = tracksList.reduce((sum: number, t: any) => sum + (t.duration || 0), 0) || null;
    // Build song data with required fields only, omit empty optional ones
    const songData: any = {
      id: songId,
      title,
      artistId,
      artistName,
      type,
      numberOfTracks: tracksList.length,
      isFeatured: false,
      plays: 0,
      status: "checking",
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    // Add optional fields only if they have values
    if (language && language.trim()) songData.language = language;
    if (genre && genre.trim()) songData.genre = genre;
    if (upc && upc.trim()) songData.upc = upc;
    if (cover && cover.trim()) songData.cover = cover;
    if (totalDuration !== null && totalDuration > 0) songData.duration = totalDuration;

    console.log("📊 [STAGE 6] Song details:", {
      songId,
      title,
      artist: artistName,
      type,
      genre,
      language,
      numberOfTracks: tracksList.length,
      totalDuration,
      cover: !!cover,
    });

    try {
      await db.insert(songs).values(songData);
    } catch (err: any) {
      console.error("❌ [STAGE 6] Song creation failed!");
      console.error("📋 Error message:", err instanceof Error ? err.message : String(err));
      console.error("🔍 Error code:", err?.code);
      console.error("📄 Full error:", err);
      throw err;
    }
    console.log("✅ [STAGE 6] Song record created successfully");

    // Setup base URL for file paths
    const baseUrl = process.env.NEXT_CLIENT_URL || "http://localhost:3000";

    // Stage 7: Process tracks (now that song exists)
    console.log("\n🎼 [STAGE 7] Processing tracks (total: " + tracksList.length + ")...");
    const trackIds: string[] = [];

    for (let i = 0; i < tracksList.length; i++) {
      const trackData = tracksList[i];
      const trackId = generateId();
      trackIds.push(trackId);

      console.log(`\n  🎵 [TRACK ${i + 1}/${tracksList.length}] Processing track: "${trackData.title}"`);
      console.log(`  📊 [TRACK ${i + 1}] Details:`, {
        trackId,
        title: trackData.title,
        duration: trackData.duration,
        leadVocal: trackData.leadVocal,
        isrc: trackData.isrc,
        explicit: trackData.explicit,
      });

      // Sub-stage 7a: Create upload record
      console.log(`  📤 [TRACK ${i + 1}/Upload] Creating upload record...`);
      await db
        .insert(uploads)
        .values({
          id: generateId(),
          userId,
          filename: `${trackId}.mp3`,
          originalName: trackData.file?.name || `track-${(trackData.trackNumber || i + 1)}.mp3`,
          mimeType: "audio/mpeg",
          size: 0,
          status: "complete",
          path: `/uploads/songs/${trackId}.mp3`,
          url: `${baseUrl}/uploads/songs/${trackId}.mp3`,
          progress: 100,
          metadata: JSON.stringify({
            trackNumber: trackData.trackNumber || i + 1,
            title: trackData.title,
            isrc: trackData.isrc || null,
          }),
        })
        .catch((err: any) => {
          console.warn(`  ⚠️ [TRACK ${i + 1}/Upload] Upload record creation skipped:`, err.message);
        });
      console.log(`  ✅ [TRACK ${i + 1}/Upload] Upload record created`);

      // Sub-stage 7b: Create track record
      console.log(`  🎬 [TRACK ${i + 1}/DB] Inserting track into database...`);

      // Build insert data with required fields only, omit empty optional ones
      const trackInsertData: any = {
        id: trackId,
        songId,
        trackNumber: trackData.trackNumber || i + 1,
        title: trackData.title || `Track ${i + 1}`,
        mp3: `${baseUrl}/uploads/songs/${trackId}.mp3`,
        explicit: trackData.explicit || "no",
        duration: trackData.duration || 0,
      };

      // Add optional fields only if they have values
      if (trackData.isrc && trackData.isrc.trim()) trackInsertData.isrc = trackData.isrc;
      if (trackData.lyrics && trackData.lyrics.trim()) trackInsertData.lyrics = trackData.lyrics;
      if (trackData.leadVocal && trackData.leadVocal.trim()) trackInsertData.leadVocal = trackData.leadVocal;
      if (trackData.featured && trackData.featured.trim()) trackInsertData.featured = trackData.featured;
      if (trackData.producer && trackData.producer.trim()) trackInsertData.producer = trackData.producer;
      if (trackData.writer && trackData.writer.trim()) trackInsertData.writer = trackData.writer;

      console.log(`  📊 [TRACK ${i + 1}/DB] Insert data:`, trackInsertData);

      try {
        await db.insert(tracks).values(trackInsertData);
      } catch (err: any) {
        console.error(`  ❌ [TRACK ${i + 1}/DB] Track creation failed!`);
        console.error(`  📋 Error message:`, err instanceof Error ? err.message : String(err));
        console.error(`  🔍 Error code:`, (err as any)?.code);
        console.error(`  📄 SQL Error:`, (err as any)?.sql || "No SQL available");
        console.error(`  📄 Full error:`, err);
        throw err;
      }
      console.log(`  ✅ [TRACK ${i + 1}/DB] Track created successfully`);
    }
    console.log(`\n✅ [STAGE 7] All ${tracksList.length} tracks processed successfully`);

    // Stage 9: Update upload job
    console.log("\n📝 [STAGE 9] Updating upload job status...");
    console.log("📋 [STAGE 9] Job ID:", id);
    await db
      .update(uploadJobs)
      .set({
        status: "completed",
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(uploadJobs.id, id))
      .catch((err: any) => {
        console.warn("⚠️ [STAGE 9] Job update skipped:", err instanceof Error ? err.message : String(err));
      });
    console.log("✅ [STAGE 9] Upload job updated successfully");

    // Success response
    const totalTime = Date.now() - startTime;
    console.log("\n" + "=".repeat(80));
    console.log("✨ [SUCCESS] Music publishing completed successfully!");
    console.log("📌 [RESULT] Song ID:", songId);
    console.log("🎼 [RESULT] Tracks created:", trackIds.length);
    console.log("⏱️ [RESULT] Total processing time:", totalTime, "ms");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({
      success: true,
      songId,
      trackIds,
      message: "Music published successfully. Your song is now being processed.",
      status: "checking",
      processingTime: totalTime,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] Publishing failed!");
    console.error("⏱️ [ERROR] Time before failure:", totalTime, "ms");
    console.error("📋 [ERROR] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    console.error("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish music" },
      { status: 500 }
    );
  }
}

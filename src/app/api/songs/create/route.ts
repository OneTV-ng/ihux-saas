import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs, users } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";

// Helper to generate UUID
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("\n" + "=".repeat(80));
  console.log("🎵 [CREATE SONG] Endpoint called");
  console.log("⏰ [CREATE SONG] Request time:", new Date().toISOString());
  console.log("=".repeat(80));

  try {
    // Stage 1: Get user from session
    console.log("\n👤 [STAGE 1] Authenticating user...");
    const session = await getServerSession();

    if (!session?.user?.id || !session?.user?.email) {
      console.error("❌ [STAGE 1] User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    console.log("✅ [STAGE 1] User authenticated:", userEmail, "ID:", userId);

    // Stage 2: Parse request
    console.log("\n📥 [STAGE 2] Parsing request body...");
    const body = await req.json();
    console.log("✅ [STAGE 2] Request parsed successfully");

    const {
      title,
      type,
      artistId,
      artistName,
      genre,
      language,
      upc,
      cover,
      copyrightAcknowledged,
      releaseDate,
      producer,
      writer,
      recordLabel,
      featured,
    } = body;

    console.log("📋 [STAGE 2] Extracted fields:", {
      title,
      type,
      artistId,
      artistName,
      genre,
      language,
      upc,
      hasCover: !!cover,
      copyrightAcknowledged,
      releaseDate,
      producer,
      writer,
      recordLabel,
      featured,
    });

    // Stage 3: Validate required fields
    console.log("\n✔️ [STAGE 3] Validating required fields...");

    if (!title || !title.trim()) {
      console.error("❌ [STAGE 3] Title is required");
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!type || !["single", "album", "medley"].includes(type)) {
      console.error("❌ [STAGE 3] Type must be one of: single, album, medley");
      return NextResponse.json(
        { error: "Type must be one of: single, album, medley" },
        { status: 400 }
      );
    }

    if (!artistId || !artistId.trim()) {
      console.error("❌ [STAGE 3] Artist ID is required");
      return NextResponse.json(
        { error: "Artist ID is required" },
        { status: 400 }
      );
    }

    if (!artistName || !artistName.trim()) {
      console.error("❌ [STAGE 3] Artist name is required");
      return NextResponse.json(
        { error: "Artist name is required" },
        { status: 400 }
      );
    }

    if (copyrightAcknowledged !== true) {
      console.error("❌ [STAGE 3] Copyright acknowledgement required");
      return NextResponse.json(
        { error: "Copyright acknowledgement is required" },
        { status: 400 }
      );
    }

    console.log("✅ [STAGE 3] All required fields valid");

    // Stage 4: Validate cover if provided
    if (cover) {
      console.log("\n🖼️ [STAGE 4] Validating cover...");
      // In a real implementation, verify cover upload exists in uploads table
      // For now, just validate it's a string
      if (typeof cover !== "string") {
        console.error("❌ [STAGE 4] Cover must be a valid string");
        return NextResponse.json(
          { error: "Invalid cover" },
          { status: 400 }
        );
      }
      console.log("✅ [STAGE 4] Cover validated");
    }

    // Stage 5: Generate song ID
    console.log("\n🆔 [STAGE 5] Generating song ID...");
    const songId = generateId();
    const now = new Date();
    console.log("✅ [STAGE 5] Song ID generated:", songId);

    // Stage 6: Create song record
    console.log("\n💾 [STAGE 6] Creating song record in database...");

    try {
      const createdSongResult = await db
        .insert(songs)
        .values({
          id: songId,
          title: title.trim(),
          userId: userId,
          artistId,
          artistName: artistName.trim(),
          type,
          genre: genre && genre.trim() ? genre.trim() : null,
          language: language && language.trim() ? language.trim() : "English",
          upc: upc && upc.trim() ? upc.trim() : null,
          cover: cover ? cover.trim() : null,
          releaseDate: releaseDate ? new Date(releaseDate) : now,
          producer: producer && producer.trim() ? producer.trim() : null,
          writer: writer && writer.trim() ? writer.trim() : null,
          recordLabel: recordLabel && recordLabel.trim() ? recordLabel.trim() : null,
          featured: featured && featured.trim() ? featured.trim() : null,
          numberOfTracks: 0,
          isFeatured: false,
          status: "new",
          createdAt: now,
          updatedAt: now,
        });

      const createdSong = Array.isArray(createdSongResult) ? createdSongResult[0] : createdSongResult;
      console.log("✅ [STAGE 6] Song record created successfully");
    } catch (err: any) {
      console.error("❌ [STAGE 6] Song creation failed!");
      console.error("📋 Error message:", err instanceof Error ? err.message : String(err));
      console.error("🔍 Error code:", err?.code);
      console.error("📄 Full error:", err);
      throw err;
    }

    // Success response
    const totalTime = Date.now() - startTime;
    console.log("\n" + "=".repeat(80));
    console.log("✨ [SUCCESS] Song created successfully!");
    console.log("📌 [RESULT] Song ID:", songId);
    console.log("⏱️ [RESULT] Total processing time:", totalTime, "ms");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({
      success: true,
      songId,
      song: {
        id: songId,
        title: title.trim(),
        artistId,
        artistName: artistName.trim(),
        type,
        genre: genre && genre.trim() ? genre.trim() : null,
        language: language && language.trim() ? language.trim() : "English",
        upc: upc && upc.trim() ? upc.trim() : null,
        cover: cover ? cover.trim() : null,
        releaseDate: releaseDate ? new Date(releaseDate) : now,
        producer: producer && producer.trim() ? producer.trim() : null,
        writer: writer && writer.trim() ? writer.trim() : null,
        recordLabel: recordLabel && recordLabel.trim() ? recordLabel.trim() : null,
        featured: featured && featured.trim() ? featured.trim() : null,
        numberOfTracks: 0,
        status: "new",
        createdAt: now,
        updatedAt: now,
      },
      processingTime: totalTime,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] Song creation failed!");
    console.error("⏱️ [ERROR] Time before failure:", totalTime, "ms");
    console.error("📋 [ERROR] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    console.error("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create song" },
      { status: 500 }
    );
  }
}

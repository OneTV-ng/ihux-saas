import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs, tracks } from "@/db/music-schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  const { songId } = await params;

  console.log("\n" + "=".repeat(80));
  console.log("📖 [GET SONG] Endpoint called");
  console.log("📌 [GET SONG] Song ID:", songId);
  console.log("=".repeat(80));

  try {
    // Fetch song
    console.log("\n🔍 [STAGE 1] Fetching song...");

    const songResult = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    if (!songResult || songResult.length === 0) {
      console.error("❌ [STAGE 1] Song not found");
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const song = songResult[0];
    console.log("✅ [STAGE 1] Song found:", songId);

    // Fetch all tracks for this song
    console.log("\n🎼 [STAGE 2] Fetching tracks...");

    const trackResults = await db
      .select()
      .from(tracks)
      .where(eq(tracks.songId, songId));

    console.log(`✅ [STAGE 2] Found ${trackResults.length} track(s)`);

    // Calculate total duration
    const totalDuration = trackResults.reduce(
      (sum: number, track: any) => sum + (track.duration || 0),
      0
    );

    console.log("\n" + "=".repeat(80));
    console.log("✨ [SUCCESS] Song fetched successfully!");
    console.log("📌 [RESULT] Song ID:", songId);
    console.log("📊 [RESULT] Total tracks:", trackResults.length);
    console.log("⏱️ [RESULT] Total duration:", totalDuration, "seconds");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({
      success: true,
      song: {
        id: song.id,
        title: song.title,
        artistId: song.artistId,
        artistName: song.artistName,
        type: song.type,
        genre: song.genre,
        language: song.language,
        upc: song.upc,
        cover: song.cover,
        numberOfTracks: song.numberOfTracks,
        isFeatured: song.isFeatured,
        plays: song.plays,
        status: song.status,
        duration: totalDuration,
        releaseDate: song.releaseDate,
        createdAt: song.createdAt,
        updatedAt: song.updatedAt,
      },
      tracks: trackResults.map((track: any) => ({
        id: track.id,
        songId: track.songId,
        trackNumber: track.trackNumber,
        title: track.title,
        isrc: track.isrc,
        mp3: track.mp3,
        explicit: track.explicit,
        lyrics: track.lyrics,
        leadVocal: track.leadVocal,
        featured: track.featured,
        producer: track.producer,
        writer: track.writer,
        duration: track.duration,
        createdAt: track.createdAt,
      })),
    });
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] Failed to fetch song!");
    console.error("📋 [ERROR] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : typeof error,
    });
    console.error("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch song" },
      { status: 500 }
    );
  }
}

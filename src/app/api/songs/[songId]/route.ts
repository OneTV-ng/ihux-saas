import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs, tracks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  const { songId } = await params;
  console.log("\n" + "=".repeat(80));
  console.log("📖 [GET SONG] Endpoint called");
  console.log(`📌 Song ID: ${songId}`);

  try {
    // Fetch song
    const songRecords = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    if (!songRecords || songRecords.length === 0) {
      console.error("❌ [GET SONG] Song not found:", songId);
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const song = songRecords[0];

    // Fetch all tracks for this song
    const allTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.songId, songId));

    // Calculate total duration
    const totalDuration = allTracks.reduce((sum, track) => {
      return sum + (track.duration || 0);
    }, 0);

    console.log("✅ [GET SONG] Song fetched successfully");
    console.log(`📌 [GET SONG] Tracks: ${allTracks.length}`);
    console.log(`📌 [GET SONG] Total duration: ${totalDuration}s`);
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({
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
        status: song.status,
        duration: totalDuration,
        createdBy: song.createdBy,
        createdAt: song.createdAt,
        updatedAt: song.updatedAt,
      },
      tracks: allTracks,
    });
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] Failed to fetch song!");
    if (error instanceof Error) {
      console.error("📋 Error Message:", error.message);
      console.error("📋 Error Stack:", error.stack);
    }
    console.error("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}

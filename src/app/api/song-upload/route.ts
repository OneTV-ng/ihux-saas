import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs, tracks } from "@/db/schema";
import { randomUUID } from "crypto";

/**
 * POST /api/song-upload
 * Upload a new song with metadata and media files
 * Creates a song record (album/release) and track record (audio file)
 */
export async function POST(request: NextRequest) {
  try {
    const songData = await request.json();

    // Validate required fields
    if (!songData.artistId || !songData.userId) {
      return NextResponse.json(
        { error: "Artist ID and User ID are required" },
        { status: 400 }
      );
    }

    if (!songData.mp3Url || !songData.coverUrl) {
      return NextResponse.json(
        { error: "Audio file and cover art are required" },
        { status: 400 }
      );
    }

    // Extract track title from tracks array (format sent by upload page)
    // Handle both formats: tracks array and direct songTitle field
    const trackTitle = songData.tracks?.[0]?.title || songData.songTitle || "Untitled";
    const trackArtist = songData.tracks?.[0]?.artist || songData.artist || "Unknown";
    const trackIsrc = songData.tracks?.[0]?.isrc || songData.isrc || null;

    if (!trackTitle || trackTitle === "Untitled") {
      return NextResponse.json(
        { error: "Song title is required" },
        { status: 400 }
      );
    }

    // Create song ID
    const songId = randomUUID();
    const trackId = randomUUID();

    // Insert song record (album/release metadata)
    await db.insert(songs).values({
      id: songId,
      userId: songData.userId,
      artistId: songData.artistId,
      title: trackTitle,
      artistName: trackArtist,
      type: songData.type || "single",
      genre: songData.genre || null,
      releaseDate: songData.releaseDate ? new Date(songData.releaseDate) : new Date(),
      producer: songData.producer || null,
      writer: songData.writer || null,
      recordLabel: songData.recordLabel || null,
      featured: songData.featured || null,
      language: songData.language || "English",
      upc: songData.upc || null,
      cover: songData.coverUrl,
      numberOfTracks: 1,
      isFeatured: songData.isFeatured || false,
      plays: 0,
      status: "new",
    });

    // Insert track record (audio file with metadata)
    await db.insert(tracks).values({
      id: trackId,
      songId: songId,
      trackNumber: 1,
      title: trackTitle,
      isrc: trackIsrc,
      mp3: songData.mp3Url,
      explicit: songData.explicit || "no",
      lyrics: songData.lyrics || null,
      leadVocal: trackArtist,
      featured: songData.featured || null,
      producer: songData.producer || null,
      writer: songData.writer || null,
      duration: songData.duration || null,
      links: songData.mediaLinks ? JSON.stringify(songData.mediaLinks) : null,
    });

    return NextResponse.json({
      success: true,
      songId,
      trackId,
      message: "Song uploaded successfully",
    });
  } catch (error) {
    console.error("Song upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload song";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

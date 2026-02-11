import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const songData = await request.json();
    // Generate product code: {year} + "00" + song id padded to 4 digits
    const year = new Date().getFullYear();
    const songId = Math.floor(Math.random() * 10000); // Replace with actual DB id
    const productCode = `${year}00${songId.toString().padStart(4, "0")}`;
    // Add artistId and userId (mock for now, replace with real values from session/profile)
    songData.songId = songId;
    songData.artistId = songData.artistId || "artist-id-placeholder";
    songData.userId = songData.userId || "user-id-placeholder";
    songData.productCode = productCode;

    // Ensure tracks are linked to artistId and sorted by track_number
    if (Array.isArray(songData.tracks)) {
      songData.tracks = songData.tracks.map((track: any, idx: number) => ({
        ...track,
        artistId: track.artistId || songData.artistId,
        track_number: idx + 1,
      })).sort((a: any, b: any) => a.track_number - b.track_number);
    }

    // Save song data as JSON file
    const uploadDir = join(process.cwd(), "public", "uploads", "songs");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    const filename = `${productCode}.json`;
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, JSON.stringify(songData, null, 2));

    return NextResponse.json({ success: true, productCode, filename, songId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save song data" }, { status: 500 });
  }
}

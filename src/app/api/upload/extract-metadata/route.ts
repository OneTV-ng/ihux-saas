import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("\n" + "=".repeat(80));
  console.log("🎵 [METADATA API] Extract metadata endpoint called");
  console.log("⏰ Time:", new Date().toISOString());

  try {
    console.log("\n📥 [METADATA] Parsing form data...");
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("❌ [METADATA] No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("✅ [METADATA] File received");
    console.log("📋 [METADATA] File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Convert file to buffer
    console.log("\n🔄 [METADATA] Converting file to buffer...");
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("✅ [METADATA] Buffer created, size:", buffer.length, "bytes");

    // Extract metadata using a simple ID3 parser
    console.log("\n🔍 [METADATA] Extracting ID3v2 metadata...");
    const metadata = extractID3Metadata(buffer);

    console.log("📊 [METADATA] Extracted metadata:", {
      title: metadata.title ? "✓ Found" : "✗ Not found",
      artist: metadata.artist ? "✓ Found" : "✗ Not found",
      album: metadata.album ? "✓ Found" : "✗ Not found",
      year: metadata.year ? "✓ Found" : "✗ Not found",
      duration: metadata.duration > 0 ? `${metadata.duration}s` : "✗ Not found",
    });

    const responseData = {
      success: true,
      metadata: {
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
        artist: metadata.artist || "",
        duration: metadata.duration || 0,
        album: metadata.album || "",
        year: metadata.year || "",
      },
    };

    console.log("✅ [METADATA] Returning extracted metadata");
    console.log("📤 [METADATA] Response data:", {
      title: responseData.metadata.title,
      artist: responseData.metadata.artist || "[empty]",
      duration: responseData.metadata.duration,
      album: responseData.metadata.album || "[empty]",
      year: responseData.metadata.year || "[empty]",
    });

    const totalTime = Date.now() - startTime;
    console.log("\n" + "=".repeat(80));
    console.log("✨ [SUCCESS] Metadata extracted successfully");
    console.log("⏱️ Processing time:", totalTime, "ms");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(responseData);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] Metadata extraction failed!");
    console.error("⏱️ Time before failure:", totalTime, "ms");
    console.error("📋 Error details:", {
      message: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    console.error("=".repeat(80) + "\n");

    return NextResponse.json(
      { error: "Failed to extract metadata" },
      { status: 500 }
    );
  }
}

// Simple ID3v2 metadata extractor
function extractID3Metadata(buffer: Buffer) {
  const metadata: any = {
    title: "",
    artist: "",
    album: "",
    year: "",
    duration: 0,
  };

  try {
    // Check for ID3v2 header
    if (buffer.length >= 10 && buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
      // Parse ID3v2 frames
      const id3Size = getID3Size(buffer);
      const id3Data = buffer.slice(10, Math.min(10 + id3Size, buffer.length));

      // Extract TIT2 (title) frame
      const titleMatch = findFrame(id3Data, "TIT2");
      if (titleMatch) {
        metadata.title = decodeFrame(titleMatch);
      }

      // Extract TPE1 (artist) frame
      const artistMatch = findFrame(id3Data, "TPE1");
      if (artistMatch) {
        metadata.artist = decodeFrame(artistMatch);
      }

      // Extract TALB (album) frame
      const albumMatch = findFrame(id3Data, "TALB");
      if (albumMatch) {
        metadata.album = decodeFrame(albumMatch);
      }

      // Extract TYER (year) frame
      const yearMatch = findFrame(id3Data, "TYER");
      if (yearMatch) {
        metadata.year = decodeFrame(yearMatch);
      }
    }

    // Try to estimate duration from file size and bitrate
    // This is a rough estimate - a proper implementation would use an audio library
    if (buffer.length > 0) {
      // Average MP3 bitrate is ~128kbps, estimate duration
      const estimatedSeconds = (buffer.length / 128) / 8; // Rough estimate
      metadata.duration = Math.round(estimatedSeconds);
    }
  } catch (err) {
    console.error("ID3 parsing error:", err);
  }

  return metadata;
}

function getID3Size(buffer: Buffer): number {
  if (buffer.length < 10) return 0;
  const b1 = buffer[6] & 0x7f;
  const b2 = buffer[7] & 0x7f;
  const b3 = buffer[8] & 0x7f;
  const b4 = buffer[9] & 0x7f;
  return (b1 << 21) | (b2 << 14) | (b3 << 7) | b4;
}

function findFrame(data: Buffer, frameId: string): Buffer | null {
  const frameBytes = Buffer.from(frameId);
  let pos = 0;

  while (pos < data.length - 10) {
    let match = true;
    for (let i = 0; i < frameId.length; i++) {
      if (data[pos + i] !== frameBytes[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      // Found frame
      const sizeBytes = data.slice(pos + 4, pos + 8);
      const frameSize = (sizeBytes[0] << 21) | (sizeBytes[1] << 14) | (sizeBytes[2] << 7) | sizeBytes[3];
      return data.slice(pos + 10, pos + 10 + frameSize);
    }

    pos++;
  }

  return null;
}

function decodeFrame(frameData: Buffer): string {
  try {
    if (frameData.length === 0) return "";

    const encoding = frameData[0];
    let text = "";

    if (encoding === 0) {
      // ISO-8859-1
      text = frameData.slice(1).toString("latin1");
    } else if (encoding === 1) {
      // UTF-16 with BOM
      text = frameData.slice(3).toString("utf16le");
    } else if (encoding === 3) {
      // UTF-8
      text = frameData.slice(1).toString("utf8");
    } else {
      text = frameData.slice(1).toString("utf8");
    }

    return text.replace(/\0/g, "").trim();
  } catch (err) {
    return "";
  }
}

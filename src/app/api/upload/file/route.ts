import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploads } from "@/db/music-schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Helper to generate UUID
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Extract metadata from audio file
async function extractAudioMetadata(buffer: Buffer): Promise<Record<string, any>> {
  try {
    // Simple duration calculation from MP3 header
    // For now, we'll extract basic info
    const metadata: Record<string, any> = {
      type: "audio",
    };

    // Try to extract duration from MP3 frame headers
    // This is a simplified version - a full implementation would use a library like jsmediatags
    let frameCount = 0;
    let offset = 0;

    // Look for MP3 sync word (0xFFF)
    while (offset < buffer.length - 4) {
      if ((buffer[offset] & 0xff) === 0xff && (buffer[offset + 1] & 0xe0) === 0xe0) {
        frameCount++;
        // Extract frame info
        const frameHeader = buffer.readUInt32BE(offset);
        const mpegVersion = (frameHeader >> 19) & 0x3;
        const layerVersion = (frameHeader >> 17) & 0x3;
        const bitRate = (frameHeader >> 12) & 0xf;

        // Calculate frame size (simplified)
        const sampleRate = [44100, 48000, 32000, 0][(frameHeader >> 10) & 0x3];
        if (sampleRate === 0) break;

        const samples = mpegVersion === 3 ? 1152 : 576;
        const frameSize = Math.floor((samples * 8 * [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384][bitRate]) / sampleRate) + ((frameHeader >> 9) & 0x1);

        offset += frameSize || 1;

        if (frameCount >= 10) {
          // Estimate duration from first 10 frames
          const duration = Math.round((buffer.length / (offset / frameCount)) / sampleRate);
          metadata.duration = duration;
          break;
        }
      } else {
        offset++;
      }
    }

    return metadata;
  } catch (error) {
    console.error("Error extracting audio metadata:", error);
    return { type: "audio" };
  }
}

// Extract metadata from image
async function extractImageMetadata(buffer: Buffer): Promise<Record<string, any>> {
  try {
    const metadata: Record<string, any> = {
      type: "image",
    };

    // Check PNG header
    if (buffer.slice(0, 4).toString("hex") === "89504e47") {
      const widthBuffer = buffer.slice(16, 20);
      const heightBuffer = buffer.slice(20, 24);
      metadata.width = widthBuffer.readUInt32BE(0);
      metadata.height = heightBuffer.readUInt32BE(0);
      metadata.format = "png";
      return metadata;
    }

    // Check JPEG header
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      // Find SOF (Start of Frame) marker
      let offset = 2;
      while (offset < buffer.length - 9) {
        if (buffer[offset] === 0xff) {
          const marker = buffer[offset + 1];
          // SOF markers are 0xC0-0xC3, 0xC5-0xC7, 0xC9-0xCB, 0xCD-0xCF
          if ((marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) || marker === 0xda) {
            const height = buffer.readUInt16BE(offset + 5);
            const width = buffer.readUInt16BE(offset + 7);
            metadata.width = width;
            metadata.height = height;
            metadata.format = "jpeg";
            return metadata;
          }
          const segmentLength = buffer.readUInt16BE(offset + 2);
          offset += segmentLength + 2;
        } else {
          offset++;
        }
      }
      return metadata;
    }

    return metadata;
  } catch (error) {
    console.error("Error extracting image metadata:", error);
    return { type: "image" };
  }
}

// Calculate file checksum
function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash("md5").update(buffer).digest("hex");
}

// Validate file type and size
function validateFile(file: Buffer, fileType: string, originalName: string): { valid: boolean; error?: string } {
  const maxSizes: Record<string, number> = {
    audio: 100 * 1024 * 1024, // 100MB
    cover: 10 * 1024 * 1024,  // 10MB
    document: 20 * 1024 * 1024, // 20MB
  };

  if (!(fileType in maxSizes)) {
    return { valid: false, error: "Invalid file type" };
  }

  if (file.length > maxSizes[fileType]) {
    return { valid: false, error: `File too large. Max size for ${fileType}: ${maxSizes[fileType] / 1024 / 1024}MB` };
  }

  // Basic type validation
  if (fileType === "audio" && !originalName.toLowerCase().endsWith(".mp3")) {
    return { valid: false, error: "Only MP3 files are supported for audio" };
  }

  if (fileType === "cover") {
    const ext = originalName.toLowerCase();
    if (!ext.endsWith(".jpg") && !ext.endsWith(".jpeg") && !ext.endsWith(".png")) {
      return { valid: false, error: "Only JPG and PNG files are supported for cover images" };
    }
  }

  return { valid: true };
}

export async function POST(req: NextRequest) {
  console.log("\n" + "=".repeat(80));
  console.log("📤 [FILE UPLOAD] Endpoint called");

  try {
    // Get user from session or headers (assumes auth middleware sets userId)
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`✅ [FILE UPLOAD] User authenticated: ${userId}`);

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("type") as string;

    if (!file || !fileType) {
      console.error("❌ [FILE UPLOAD] Missing file or type");
      return NextResponse.json({ error: "File and type are required" }, { status: 400 });
    }

    console.log(`📋 [FILE UPLOAD] File info:`, {
      name: file.name,
      size: file.size,
      type: fileType,
    });

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file
    const validation = validateFile(buffer, fileType, file.name);
    if (!validation.valid) {
      console.error("❌ [FILE UPLOAD] Validation failed:", validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    console.log("✅ [FILE UPLOAD] File validation passed");

    // Generate unique filename
    const uploadId = generateId();
    const timestamp = Date.now();
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const filename = `${timestamp}_${uploadId}.${ext}`;

    console.log(`🆔 [FILE UPLOAD] Generated filename: ${filename}`);

    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", userId, fileType);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`📁 [FILE UPLOAD] Created directory: ${uploadDir}`);
    }

    // Save file to disk
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`💾 [FILE UPLOAD] File saved to: ${filePath}`);

    // Extract metadata
    let metadata: Record<string, any> = {};
    if (fileType === "audio") {
      metadata = await extractAudioMetadata(buffer);
    } else if (fileType === "cover") {
      metadata = await extractImageMetadata(buffer);
    }

    console.log(`📊 [FILE UPLOAD] Metadata extracted:`, metadata);

    // Calculate checksum
    const checksum = calculateChecksum(buffer);
    console.log(`🔐 [FILE UPLOAD] Checksum: ${checksum}`);

    // Save to database
    const publicUrl = `/uploads/${userId}/${fileType}/${filename}`;

    await db
      .insert(uploads)
      .values({
        id: uploadId,
        userId,
        filename,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        status: "complete",
        path: filePath,
        url: publicUrl,
        checksum,
        progress: 100,
        metadata: JSON.stringify(metadata),
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
      });

    // Fetch the created record
    const uploadRecords = await db
      .select()
      .from(uploads)
      .where(eq(uploads.id, uploadId))
      .limit(1);

    const uploadRecord = uploadRecords[0];
    console.log("✅ [FILE UPLOAD] Database record created:", uploadRecord?.id);

    console.log("\n" + "=".repeat(80));
    console.log("✨ [SUCCESS] File uploaded successfully");
    console.log("📌 [RESULT] Upload ID:", uploadId);
    console.log("🔗 [RESULT] URL:", publicUrl);
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({
      success: true,
      upload: {
        id: uploadRecord[0].id,
        url: uploadRecord[0].url,
        filename: uploadRecord[0].filename,
        originalName: uploadRecord[0].originalName,
        mimeType: uploadRecord[0].mimeType,
        size: uploadRecord[0].size,
        path: uploadRecord[0].path,
        checksum: uploadRecord[0].checksum,
        metadata: metadata,
        status: uploadRecord[0].status,
        progress: uploadRecord[0].progress,
        createdAt: uploadRecord[0].createdAt,
      },
    });
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] File upload failed!");
    console.error("📋 Error:", error instanceof Error ? error.message : String(error));
    console.error("=".repeat(80) + "\n");

    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

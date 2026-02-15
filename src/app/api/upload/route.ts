import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's username
    const userData = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const username = userData[0]?.username || session.user.id;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'profile', 'audio', 'document', etc

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg",
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images, audio files, and documents are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max for audio, 5MB for images)
    const maxSize = file.type.startsWith("audio/") ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size too large. Maximum ${maxSize / (1024 * 1024)}MB allowed.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cover art validation
    let rejectionFlag = false;
    let rejectionReasons: string[] = [];
    if (file.type.startsWith("image/")) {
      // Use sharp for image validation
      let sharp;
      try {
        sharp = (await import("sharp")).default;
      } catch (e) {
        return NextResponse.json({ error: "Image validation library not found." }, { status: 500 });
      }
      try {
        const img = sharp(buffer);
        const metadata = await img.metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;
        const dpi = metadata.density || 72;
        if (width < 3000 || height < 3000) {
          rejectionFlag = true;
          rejectionReasons.push("Cover art must be at least 3000x3000 pixels.");
        }
        if (width > 6000 || height > 6000) {
          rejectionFlag = true;
          rejectionReasons.push("Cover art must be no larger than 6000x6000 pixels.");
        }
        if (dpi < 70) {
          rejectionFlag = true;
          rejectionReasons.push("Cover art must be at least 70 dpi.");
        }
        if (dpi > 600) {
          rejectionFlag = true;
          rejectionReasons.push("Cover art must be no more than 600 dpi.");
        }
        // Content checks (basic, for demo: flag if filename contains 'logo', 'social', etc)
        const forbidden = ["logo", "social", "handle", "brand"];
        if (forbidden.some(word => file.name.toLowerCase().includes(word))) {
          rejectionFlag = true;
          rejectionReasons.push("Cover art must not contain logos or social media handles.");
        }
        // TODO: Add OCR/content analysis for stricter checks
      } catch (err) {
        return NextResponse.json({ error: "Failed to validate cover art image." }, { status: 400 });
      }
    }

    // Create uploads directory with username path
    const uploadDir = join(process.cwd(), "public", "uploads", username, type || "files");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}.${extension}`;
    const filepath = join(uploadDir, filename);
    // Save file
    await writeFile(filepath, buffer);

    // Return the URL path with full client URL
    const baseUrl = process.env.NEXT_CLIENT_URL || "http://localhost:3000";
    const url = `${baseUrl}/uploads/${username}/${type || "files"}/${filename}`;

    // If image, return details
    let imageDetails = undefined;
    if (file.type.startsWith("image/")) {
      try {
        const sharp = (await import("sharp")).default;
        const img = sharp(buffer);
        const metadata = await img.metadata();
        imageDetails = {
          width: metadata.width,
          height: metadata.height,
          dpi: metadata.density,
          format: metadata.format,
        };
      } catch (err) {
        console.error("Error retrieving image metadata:", err);
      }
    }
    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type,
      rejectionFlag,
      rejectionReasons,
      imageDetails,
      message: rejectionFlag ? "File uploaded with issues" : "File uploaded successfully",
    });

  
  } catch (error:  any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

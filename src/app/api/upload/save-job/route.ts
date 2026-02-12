import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploadJobs } from "@/db/upload-jobs-schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("\n" + "=".repeat(80));
  console.log("💾 [SAVE-JOB API] Endpoint called");
  console.log("⏰ Time:", new Date().toISOString());

  try {
    console.log("\n📥 [SAVE-JOB] Parsing request...");
    const body = await req.json();
    const { id, userId, title, type, genre, language, upc, artistId, artistName, tracks, copyrightAcknowledged, status, currentStep, progress } = body;

    console.log("✅ [SAVE-JOB] Request parsed");
    console.log("📋 [SAVE-JOB] Job details:", {
      jobId: id,
      userId,
      title,
      type,
      genre,
      currentStep,
      progress,
      tracksCount: tracks?.length,
      status,
    });

    // Validate required fields
    console.log("\n✔️ [SAVE-JOB] Validating required fields...");
    if (!userId || !title || !artistId) {
      console.error("❌ [SAVE-JOB] Validation failed - missing fields:", {
        hasUserId: !!userId,
        hasTitle: !!title,
        hasArtistId: !!artistId,
      });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    console.log("✅ [SAVE-JOB] All required fields present");

    // Check if job exists
    console.log("\n🔍 [SAVE-JOB] Checking if job exists (ID: " + id + ")...");
    const existing = await db
      .select()
      .from(uploadJobs)
      .where(eq(uploadJobs.id, id))
      .limit(1);

    if (existing.length > 0) {
      // Update existing job
      console.log("📝 [SAVE-JOB] Job exists - updating...");
      console.log("📊 [SAVE-JOB] Updating fields:", {
        songTitle: title,
        songType: type,
        genre,
        currentStep,
        progress,
      });

      await db
        .update(uploadJobs)
        .set({
          songTitle: title,
          songType: type,
          genre,
          language,
          upc,
          artistName,
          tracks: JSON.stringify(tracks),
          copyrightAcknowledged,
          status,
          currentStep,
          progress,
          updatedAt: new Date(),
        })
        .where(eq(uploadJobs.id, id));
      console.log("✅ [SAVE-JOB] Job updated successfully");
    } else {
      // Create new job
      console.log("🆕 [SAVE-JOB] Job does not exist - creating new...");
      console.log("📊 [SAVE-JOB] Creating with:", {
        jobId: id,
        userId,
        title,
        type,
        artistName,
        genre,
        expiresAt: "30 days from now",
      });

      await db.insert(uploadJobs).values({
        id,
        userId,
        songTitle: title,
        songType: type,
        genre,
        language,
        upc,
        artistId,
        artistName,
        tracks: JSON.stringify(tracks),
        copyrightAcknowledged,
        status,
        currentStep,
        progress,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
      console.log("✅ [SAVE-JOB] New job created successfully");
    }

    const totalTime = Date.now() - startTime;
    console.log("\n" + "=".repeat(80));
    console.log("✨ [SUCCESS] Job saved successfully");
    console.log("⏱️ Processing time:", totalTime, "ms");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ success: true, jobId: id, time: totalTime });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("\n" + "=".repeat(80));
    console.error("❌ [ERROR] Save job failed!");
    console.error("⏱️ Time before failure:", totalTime, "ms");
    console.error("📋 Error:", error instanceof Error ? error.message : String(error));
    console.error("=".repeat(80) + "\n");

    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }
}

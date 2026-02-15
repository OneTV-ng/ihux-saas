import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { DxlApiHandler, DxlApiContext, DxlApiResponse } from "@/lib/dxl-api-handler";

export class UploadsHandler extends DxlApiHandler {
  async process(request: NextRequest, operation: string): Promise<DxlApiResponse> {
    const context = await this.extractContext(request);

    switch (operation) {
      case "start":
        return this.startUpload(request, context);
      case "chunk":
        return this.uploadChunk(request, context);
      case "complete":
        return this.completeUpload(request, context);
      case "status":
        return this.getUploadStatus(request, context);
      default:
        return this.errorResponse(
          `uploads.${operation}`,
          "uploads",
          "Invalid operation",
          400,
          "BadRequest"
        );
    }
  }

  private async startUpload(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      if (!context.userId) {
        return this.errorResponse(
          "uploads.start",
          "uploads",
          "Authentication required",
          401,
          "Unauthorized"
        );
      }

      const body = await request.json();
      const { filename, size, mime_type } = body;

      if (!filename || !size || !mime_type) {
        return this.errorResponse(
          "uploads.start",
          "uploads",
          "Missing required fields",
          422,
          "ValidationError",
          { required: ["filename", "size", "mime_type"] }
        );
      }

      const chunkSize = 1048576; // 1MB
      const totalChunks = Math.ceil(size / chunkSize);

      const uploadId = randomUUID();
      await db
        .insert(uploads)
        .values({
          id: uploadId,
          userId: context.userId,
          filename: `${Date.now()}_${filename}`,
          originalName: filename,
          mimeType: mime_type,
          size,
          status: "loading",
          chunkSize,
          totalChunks,
          uploadedChunks: 0,
          progress: 0,
        });

      const [upload] = await db
        .select()
        .from(uploads)
        .where(eq(uploads.id, uploadId));

      return this.successResponse(
        "uploads.start",
        "uploads",
        {
          upload_id: upload.id,
          filename: upload.filename,
          status: upload.status,
          chunk_size: upload.chunkSize,
          total_chunks: totalChunks,
        },
        "Upload started"
      );
    } catch (error: any) {
      return this.errorResponse(
        "uploads.start",
        "uploads",
        error.message || "Failed to start upload",
        500,
        "InternalError"
      );
    }
  }

  private async uploadChunk(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      if (!context.userId) {
        return this.errorResponse(
          "uploads.chunk",
          "uploads",
          "Authentication required",
          401,
          "Unauthorized"
        );
      }

      const uploadId = request.headers.get("Upload-ID");
      const chunkNumber = parseInt(request.headers.get("Chunk-Number") || "0");

      if (!uploadId || !chunkNumber) {
        return this.errorResponse(
          "uploads.chunk",
          "uploads",
          "Missing upload ID or chunk number",
          400,
          "BadRequest"
        );
      }

      // Get upload record
      const [upload] = await db
        .select()
        .from(uploads)
        .where(and(eq(uploads.id, uploadId), eq(uploads.userId, context.userId)));

      if (!upload) {
        return this.errorResponse(
          "uploads.chunk",
          "uploads",
          "Upload not found",
          404,
          "NotFound"
        );
      }

      // Here you would save the actual chunk data to storage
      // For now, we'll just update the progress

      const uploadedChunks = upload.uploadedChunks! + 1;
      const progress = Math.floor((uploadedChunks / upload.totalChunks!) * 100);

      await db
        .update(uploads)
        .set({
          uploadedChunks,
          progress,
          updatedAt: new Date(),
        })
        .where(eq(uploads.id, uploadId));

      return this.successResponse(
        "uploads.chunk",
        "uploads",
        {
          upload_id: uploadId,
          chunk_number: chunkNumber,
          total_chunks: upload.totalChunks,
          progress,
        },
        "Chunk uploaded successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "uploads.chunk",
        "uploads",
        error.message || "Failed to upload chunk",
        500,
        "InternalError"
      );
    }
  }

  private async completeUpload(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      if (!context.userId) {
        return this.errorResponse(
          "uploads.complete",
          "uploads",
          "Authentication required",
          401,
          "Unauthorized"
        );
      }

      const body = await request.json();
      const { upload_id, checksum } = body;

      if (!upload_id) {
        return this.errorResponse(
          "uploads.complete",
          "uploads",
          "Upload ID is required",
          400,
          "BadRequest"
        );
      }

      const [upload] = await db
        .select()
        .from(uploads)
        .where(and(eq(uploads.id, upload_id), eq(uploads.userId, context.userId)));

      if (!upload) {
        return this.errorResponse(
          "uploads.complete",
          "uploads",
          "Upload not found",
          404,
          "NotFound"
        );
      }

      // Simulate file path and URL (in production, use actual storage)
      const path = `/storage/uploads/${upload.filename}`;
      const url = `${process.env.CDN_URL || "https://cdn.example.com"}${path}`;

      await db
        .update(uploads)
        .set({
          status: "complete",
          progress: 100,
          path,
          url,
          checksum,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(uploads.id, upload_id));

      const [completedUpload] = await db
        .select()
        .from(uploads)
        .where(eq(uploads.id, upload_id));

      return this.successResponse(
        "uploads.complete",
        "uploads",
        {
          upload_id: completedUpload.id,
          status: completedUpload.status,
          path: completedUpload.path,
          size: completedUpload.size,
          url: completedUpload.url,
        },
        "Upload completed successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "uploads.complete",
        "uploads",
        error.message || "Failed to complete upload",
        500,
        "InternalError"
      );
    }
  }

  private async getUploadStatus(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      if (!context.userId) {
        return this.errorResponse(
          "uploads.status",
          "uploads",
          "Authentication required",
          401,
          "Unauthorized"
        );
      }

      const url = new URL(request.url);
      const uploadId = url.searchParams.get("id");

      if (!uploadId) {
        return this.errorResponse(
          "uploads.status",
          "uploads",
          "Upload ID is required",
          400,
          "BadRequest"
        );
      }

      const [upload] = await db
        .select()
        .from(uploads)
        .where(and(eq(uploads.id, uploadId), eq(uploads.userId, context.userId)));

      if (!upload) {
        return this.errorResponse(
          "uploads.status",
          "uploads",
          "Upload not found",
          404,
          "NotFound"
        );
      }

      return this.successResponse(
        "uploads.status",
        "uploads",
        {
          upload_id: upload.id,
          filename: upload.originalName,
          status: upload.status,
          progress: upload.progress,
          size: upload.size,
          url: upload.url,
        },
        "Upload status retrieved"
      );
    } catch (error: any) {
      return this.errorResponse(
        "uploads.status",
        "uploads",
        error.message || "Failed to get upload status",
        500,
        "InternalError"
      );
    }
  }
}

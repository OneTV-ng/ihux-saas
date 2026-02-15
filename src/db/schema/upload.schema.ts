import { mysqlTable as table, text, timestamp, varchar, json, index, int as integer, bigint } from 'drizzle-orm/mysql-core';
import { users } from './user.schema';

export const uploads = table("uploads", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // File Metadata
  filename: varchar("filename", { length: 255 }).notNull(), // The stored name (UUID/Hash)
  originalName: varchar("original_name", { length: 255 }).notNull(), // The user's filename
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  
  // Use bigint for sizes to support files larger than 2GB
  size: bigint("size", { mode: "number" }).notNull(),
  
  // Storage Location
  path: text("path"), // S3 Key or local path
  url: text("url"),   // Public or signed URL
  checksum: varchar("checksum", { length: 64 }), // MD5/SHA hash to verify file integrity
  
  // Status & Progress Tracking
  status: varchar("status", { length: 32 }).notNull().default("pending"), // pending, uploading, processing, completed, failed
  progress: integer("progress").default(0), // 0 to 100
  
  // Chunking Support (For resumable uploads)
  chunkSize: integer("chunk_size"),
  totalChunks: integer("total_chunks"),
  uploadedChunks: integer("uploaded_chunks").default(0),
  
  metadata: json("metadata"), // e.g., { "bitrate": "320kbps", "format": "mp3" }
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (t) => ({
  userIdx: index("uploads_user_idx").on(t.userId),
  statusIdx: index("uploads_status_idx").on(t.status),
}));

// --- Types ---
export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;
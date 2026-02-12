import { mysqlTable as table, text, timestamp, json, varchar, int as integer, boolean } from 'drizzle-orm/mysql-core';
import { user } from './schema';

// Upload Jobs table - tracks user's upload progress for recovery
export const uploadJobs = table("upload_jobs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" }),

  // Song metadata
  songTitle: text("song_title").notNull(),
  songType: text("song_type").notNull(), // 'single', 'album', 'medley'
  genre: text("genre"),
  language: text("language").default("en"),
  upc: text("upc"),
  artistId: varchar("artist_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" }),
  artistName: text("artist_name").notNull(),

  // Cover image upload
  coverUploadId: varchar("cover_upload_id", { length: 36 }),

  // Tracks data (JSON to store multiple track info)
  tracks: json("tracks"), // Array of track objects with metadata

  // Progress tracking
  status: text("status").notNull().default("in_progress"), // 'in_progress', 'completed', 'failed', 'cancelled'
  currentStep: text("current_step").default("metadata"), // 'metadata', 'cover', 'tracks', 'review', 'publishing'
  progress: integer("progress").default(0), // 0-100

  // Copyright acknowledgement
  copyrightAcknowledged: boolean("copyright_acknowledged").default(false).notNull(),
  copyrightWarningAcknowledgedAt: timestamp("copyright_warning_acknowledged_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"), // auto-delete after 30 days if incomplete
});

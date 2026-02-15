import {
  mysqlTable as table,
  varchar,
  timestamp,
  json,
  int,
  text,
  index,
} from "drizzle-orm/mysql-core";
import { users } from "./schema/user.schema";

export const uploadJobs = table(
  "upload_jobs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Song Metadata
    songTitle: varchar("song_title", { length: 255 }).notNull(),
    songType: varchar("song_type", { length: 100 }),
    genre: varchar("genre", { length: 100 }),
    language: varchar("language", { length: 50 }),
    upc: varchar("upc", { length: 50 }),

    // Artist Info
    artistId: varchar("artist_id", { length: 36 }),
    artistName: varchar("artist_name", { length: 255 }),

    // Tracks
    tracks: json("tracks"), // JSON array of track data

    // Copyright
    copyrightAcknowledged: text("copyright_acknowledged"),

    // Job Progress
    status: varchar("status", { length: 50 }).default("in_progress"), // in_progress, completed, failed
    currentStep: varchar("current_step", { length: 100 }),
    progress: int("progress").default(0), // 0-100

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (t) => ({
    userIdx: index("upload_jobs_user_idx").on(t.userId),
    statusIdx: index("upload_jobs_status_idx").on(t.status),
  })
);

export type UploadJob = typeof uploadJobs.$inferSelect;
export type NewUploadJob = typeof uploadJobs.$inferInsert;

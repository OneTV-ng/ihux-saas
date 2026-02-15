import { mysqlTable as table, text, timestamp, boolean, int as integer, varchar, index } from 'drizzle-orm/mysql-core';

// --- SONGS TABLE (The Release/Album) ---
// SUBMISSION REQUIRED FIELDS: title, userId, artistId, artistName, type, genre, releaseDate, cover, language
export const songs = table("songs", {
  id: varchar("id", { length: 100 }).primaryKey(),

  // REQUIRED for submission
  title: varchar("title", { length: 255 }).notNull().default(""),
  userId: varchar("user_id", { length: 100 }).notNull(),
  artistId: varchar("artist_id", { length: 100 }).notNull(),
  artistName: varchar("artist_name", { length: 255 }).notNull().default(""),
  type: varchar("type", { length: 50 }).notNull().default("single"),
  genre: varchar("genre", { length: 100 }).default("Pop"),
  releaseDate: timestamp("release_date").defaultNow(),
  cover: text("cover"),
  language: varchar("language", { length: 50 }).default("English"),

  // OPTIONAL submission fields
  producer: text("producer"),
  writer: text("writer"),
  recordLabel: varchar("record_label", { length: 255 }),
  featured: text("featured"),
  upc: varchar("upc", { length: 50 }),

  // Metadata
  numberOfTracks: integer("number_of_tracks").default(0),
  isFeatured: boolean("is_featured").default(false).notNull(),
  plays: integer("plays").default(0),
  duration: integer("duration"),

  // Submission & Moderation Status
  status: varchar("status", { length: 32 }).notNull().default("new"),
  flagType: varchar("flag_type", { length: 32 }),
  flagReason: text("flag_reason"),
  flaggedAt: timestamp("flagged_at"),
  flaggedBy: varchar("flagged_by", { length: 100 }),
  approvedBy: varchar("approved_by", { length: 100 }),
  approvedAt: timestamp("approved_at"),

  // Tracking & Management
  createdBy: varchar("created_by", { length: 100 }),
  managedBy: varchar("managed_by", { length: 100 }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (t) => ({
  userIdx: index("songs_user_idx").on(t.userId),
  artistIdx: index("songs_artist_idx").on(t.artistId),
  statusIdx: index("songs_status_idx").on(t.status),
  typeIdx: index("songs_type_idx").on(t.type),
  featuredIdx: index("songs_featured_idx").on(t.isFeatured),
}));

// --- TRACKS TABLE (The Audio Files) ---
// SUBMISSION REQUIRED FIELDS: songId, title, mp3, explicit
export const tracks = table("tracks", {
  id: varchar("id", { length: 100 }).primaryKey(),

  // REQUIRED for submission
  songId: varchar("song_id", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  mp3: text("mp3").notNull(),
  explicit: varchar("explicit", { length: 10 }).default("no"),

  // OPTIONAL submission fields
  trackNumber: integer("track_number").default(1),
  isrc: varchar("isrc", { length: 32 }),
  lyrics: text("lyrics"),
  leadVocal: varchar("lead_vocal", { length: 255 }),
  featured: text("featured"),
  producer: text("producer"),
  writer: text("writer"),
  duration: integer("duration").default(0),

  // External links (JSON: spotify, apple music, youtube, etc.)
  links: text("links"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  songIdx: index("tracks_song_idx").on(t.songId),
  isrcIdx: index("tracks_isrc_idx").on(t.isrc),
}));

// --- Infer Types ---
export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;
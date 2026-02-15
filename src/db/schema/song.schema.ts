import { mysqlTable as table, text, timestamp, boolean, int as integer, varchar, index } from 'drizzle-orm/mysql-core';
import { users } from './user.schema';
import { artists } from './artist.schema';

// --- SONGS TABLE (The Release/Album) ---
export const songs = table("songs", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull().default(""),

  // User who owns the account publishing this song
  userId: varchar("user_id", { length: 100 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Artist profile used to publish this song (can be different artists per user)
  artistId: varchar("artist_id", { length: 100 })
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),

  artistName: varchar("artist_name", { length: 255 }).notNull().default(""),
  type: varchar("type", { length: 50 }).notNull(), // e.g., 'single', 'album', 'ep'
  genre: varchar("genre", { length: 100 }).default("Pop"),
  releaseDate: timestamp("release_date").defaultNow(),
  producer: text("producer"),
  writer: text("writer"),
  recordLabel: varchar("record_label", { length: 255 }),
  featured: text("featured"),
  language: varchar("language", { length: 50 }).default("English"),
  upc: varchar("upc", { length: 50 }),
  cover: text("cover"),
  numberOfTracks: integer("number_of_tracks").default(0),
  isFeatured: boolean("is_featured").default(false).notNull(),
  plays: integer("plays").default(0),
  status: varchar("status", { length: 32 }).notNull().default("new"),
  duration: integer("duration"),
  flagType: varchar("flag_type", { length: 32 }),
  flagReason: text("flag_reason"),
  flaggedAt: timestamp("flagged_at"),
  flaggedBy: varchar("flagged_by", { length: 100 }).references(() => users.id),
  approvedBy: varchar("approved_by", { length: 100 }).references(() => users.id),
  approvedAt: timestamp("approved_at"),
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
export const tracks = table("tracks", {
  id: varchar("id", { length: 100 }).primaryKey(),
  songId: varchar("song_id", { length: 100 })
    .notNull()
    .references(() => songs.id, { onDelete: "cascade" }),
  trackNumber: integer("track_number").default(1),
  title: varchar("title", { length: 255 }).notNull(),
  isrc: varchar("isrc", { length: 32 }),
  mp3: text("mp3").notNull(),
  explicit: varchar("explicit", { length: 10 }).default("no"),
  lyrics: text("lyrics"),
  leadVocal: varchar("lead_vocal", { length: 255 }),
  featured: text("featured"),
  producer: text("producer"),
  writer: text("writer"),
  duration: integer("duration").default(0),
  links: text("links"),
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
// src/db/music-schema.ts

// --- Types generated from schema definitions below ---
export type Song = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artist?:any; // populated artist info
  type: string;
  genre?: string | null;
  language?: string | null;
  upc?: string | null;
  cover?: string | null;
  numberOfTracks?: number | null;
  tracks?: Track[];
  isFeatured: boolean;
  plays?: number | null;
  releaseDate?: Date | null;  
  status: string;
  duration ?: number | null; // in seconds
  flagType?: string | null;
  flagReason?: string | null;
  flaggedAt?: Date | null;
  flaggedBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdBy: string;
  managedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type Track = {
  id: string;
  songId: string;
  trackNumber?: number | null;
  isrc?: string | null;
  mp3: string;
  explicit?: string | null;
  lyrics?: string | null;
  leadVocal?: string | null;
  featured?: string | null;
  producer?: string | null;
  writer?: string | null;
  duration?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

import { mysqlTable as table, text, timestamp, boolean, int as integer, decimal as numeric, json, varchar, index } from 'drizzle-orm/mysql-core';
import { user } from "./schema";



export const songs = table("songs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  artistId: varchar("artist_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" }),
  artistName: text("artist_name").notNull(),
  type: text("type").notNull(), // 'single', 'album', 'medley'
  genre: text("genre"),
  language: text("language").default("en"),
  upc: text("upc"),
  cover: text("cover"), // URL or upload_id
  numberOfTracks: integer("number_of_tracks").default(1),
  isFeatured: boolean("is_featured").default(false).notNull(),
  status: text("status").notNull().default("new"), // 'new', 'checking', 'approved', 'flagged', 'deleted'
  flagType: text("flag_type"), // 'flag_cover', 'flag_song', 'copyright'
  flagReason: text("flag_reason"),
  flaggedAt: timestamp("flagged_at"),
  flaggedBy: text("flagged_by").references(() => user.id),
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: timestamp("approved_at"),
  createdBy: text("created_by").notNull().references(() => user.id),
  managedBy: text("managed_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  artistIdx: index("songs_artist_idx").on(table.artistId),
  statusIdx: index("songs_status_idx").on(table.status),
  typeIdx: index("songs_type_idx").on(table.type),
  featuredIdx: index("songs_featured_idx").on(table.isFeatured),
}));

// Tracks table (individual tracks within songs/albums)
export const tracks = table("tracks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  songId: varchar("song_id", { length: 36 }).notNull().references(() => songs.id, { onDelete: "cascade" }),
  trackNumber: integer("track_number"),
  isrc: text("isrc"),
  mp3: text("mp3").notNull(), // URL or upload_id
  explicit: text("explicit").default("no"), // 'no', 'yes', 'covered'
  lyrics: text("lyrics"),
  leadVocal: text("lead_vocal"),
  featured: text("featured"),
  producer: text("producer"),
  writer: text("writer"),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  songIdx: index("tracks_song_idx").on(table.songId),
  isrcIdx: index("tracks_isrc_idx").on(table.isrc),
  trackNumberIdx: index("tracks_track_number_idx").on(table.trackNumber),
}));

// Uploads table (file upload management)
export const uploads = table("uploads", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // in bytes
  status: text("status").notNull().default("loading"), // 'loading', 'complete', 'failed', 'deleted'
  path: text("path"),
  url: text("url"),
  checksum: text("checksum"),
  chunkSize: integer("chunk_size").default(1048576), // 1MB default
  totalChunks: integer("total_chunks"),
  uploadedChunks: integer("uploaded_chunks").default(0),
  progress: integer("progress").default(0), // 0-100
  metadata: json("metadata"), // additional file metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("uploads_user_idx").on(table.userId),
  statusIdx: index("uploads_status_idx").on(table.status),
}));

// Royalties table
export const royalties = table("royalties", {
  id: varchar("id", { length: 36 }).primaryKey(),
  period: text("period").notNull(), // '2026-Q1', '2026-02', etc.
  periodType: text("period_type").notNull(), // 'monthly', 'quarterly'
  upc: text("upc"),
  isrc: text("isrc"),
  trackName: text("track_name").notNull(),
  songTitle: text("song_title").notNull(),
  artistName: text("artist_name").notNull(),
  recordLabel: text("record_label"),
  grossAmountUsd: numeric("gross_amount_usd", { precision: 10, scale: 2 }).notNull(),
  deductionsPercent: numeric("deductions_percent", { precision: 5, scale: 2 }).default("0"),
  deductionsUsd: numeric("deductions_usd", { precision: 10, scale: 2 }).default("0"),
  netAmountUsd: numeric("net_amount_usd", { precision: 10, scale: 2 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" }),
  songId: varchar("song_id", { length: 36 }).references(() => songs.id),
  trackId: varchar("track_id", { length: 36 }).references(() => tracks.id),
  artistId: varchar("artist_id", { length: 36 }).references(() => user.id),
  managerId: varchar("manager_id", { length: 36 }).references(() => user.id),
  matchStatus: text("match_status").default("unmatched"), // 'matched', 'partial', 'unmatched'
  matchedBy: varchar("matched_by", { length: 36 }).references(() => user.id),
  matchedAt: timestamp("matched_at"),
  approvedBy: varchar("approved_by", { length: 36 }).references(() => user.id),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  paymentStatus: text("payment_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  periodIdx: index("royalties_period_idx").on(table.period),
  artistIdx: index("royalties_artist_idx").on(table.artistId),
  statusIdx: index("royalties_status_idx").on(table.paymentStatus),
  upcIdx: index("royalties_upc_idx").on(table.upc),
  isrcIdx: index("royalties_isrc_idx").on(table.isrc),
}));


// Admin tasks table
export const adminTasks = table("admin_tasks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'cancelled'
  assignedTo: varchar("assigned_to", { length: 36 }).references(() => user.id),
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => user.id),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  metadata: json("metadata"), // task-specific data
  artistId: varchar("artist_id", { length: 36 }).references(() => user.id),
  userId: varchar("user_id", { length: 36 }).references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  assignedIdx: index("admin_tasks_assigned_idx").on(table.assignedTo),
  statusIdx: index("admin_tasks_status_idx").on(table.status),
  priorityIdx: index("admin_tasks_priority_idx").on(table.priority),
}));

// Admin alerts/notifications table
export const adminAlerts = table("admin_alerts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  type: text("type").notNull(), // 'flag', 'copyright', 'user_report', 'system'
  title: text("title").notNull(),
  message: text("message").notNull(),
  entityType: text("entity_type"), // 'song', 'user', 'upload', 'royalty'
  entityId: varchar("entity_id", { length: 36 }),
  status: text("status").notNull().default("active"), // 'active', 'resolved', 'dismissed'
  severity: text("severity"),
  matchedBy: varchar("matched_by", { length: 36 }).references(() => user.id),
  approvedBy: varchar("approved_by", { length: 36 }).references(() => user.id),
  resolvedBy: varchar("resolved_by", { length: 36 }).references(() => user.id),
  resolvedAt: timestamp("resolved_at"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("admin_alerts_status_idx").on(table.status),
  typeIdx: index("admin_alerts_type_idx").on(table.type),
}));

// API keys table
export const apiKeys = table("api_keys", {
  id: varchar("id", { length: 36 }).primaryKey(),
  assignedTo: varchar("assigned_to", { length: 36 }).references(() => user.id),
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => user.id),
  userId: varchar("user_id", { length: 36 }).references(() => user.id),
  key: text("key").unique(),
  name: text("name").notNull(),
  apiClass: integer("api_class").notNull().default(5), // 5, 10, 20, 50
  rateLimit: integer("rate_limit").notNull().default(60), // requests per minute
  status: text("status").notNull().default("active"), // 'active', 'suspended', 'revoked'
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("api_keys_user_idx").on(table.userId),
  keyIdx: index("api_keys_key_idx").on(table.key),
}));

// Extended user profile for music platform
export const userProfiles = table("user_profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  username: text("username").unique(),
  firstname: text("firstname"),
  lastname: text("lastname"),
  bio: text("bio"),
  platform: text("platform").default("web"), // 'web', 'mobile', 'desktop'
  socials: json("socials"), // { instagram: '', twitter: '', tiktok: '' }
  preferences: json("preferences"), // user settings
  metadata: json("metadata"),
  selectedArtistId: varchar("selected_artist_id", { length: 36 }), // Currently active artist for uploads
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index("user_profiles_username_idx").on(table.username),
}));

// Artists table - Private business information
export const artists = table("artists", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" }),
  artistName: text("artist_name").notNull().unique(), // Internal name/slug
  displayName: text("display_name").notNull(),
  slug: text("slug").notNull().unique(), // URL slug
  bio: text("bio"),
  city: text("city"),
  country: text("country"),
  birthday: timestamp("birthday"),
  gender: text("gender"),
  genre: text("genre"),
  recordLabel: text("record_label"),
  contact: json("contact"),
  legalId: text("legal_id"), // Path to legal ID document
  contract: text("contract"), // Path to contract document
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("artists_user_idx").on(table.userId),
  slugIdx: index("artists_slug_idx").on(table.slug),
  artistNameIdx: index("artists_name_idx").on(table.artistName),
}));


// Artist profiles table - Public artist profiles
export const artistProfiles = table("artist_profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  artistId: varchar("artist_id", { length: 36 }).notNull().references(() => artists.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" }),
  picture: text("picture"),
  thumbnails: json("thumbnails"),
  gallery: json("gallery"),
  mediaPlatform: json("media_platform"),
  socialMedia: json("social_media"),
  fanNews: json("fan_news"),
  press: json("press"),
  team: json("team"),
  producer: text("producer"),
  songwriter: text("songwriter"),
  studio: text("studio"),
  recordLabel: text("record_label"),
  genre: text("genre"),
  subGenre: text("sub_genre"),
  country: text("country"),
  city: text("city"),
  isPublic: boolean("is_public").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  totalSongs: integer("total_songs").default(0).notNull(),
  totalPlays: integer("total_plays").default(0).notNull(),
  totalFollowers: integer("total_followers").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  artistIdx: index("artist_profiles_artist_idx").on(table.artistId),
  publicIdx: index("artist_profiles_public_idx").on(table.isPublic),
  featuredIdx: index("artist_profiles_featured_idx").on(table.isFeatured),
}));


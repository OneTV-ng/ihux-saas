import { mysqlTable as table, text, timestamp, varchar, decimal, index } from 'drizzle-orm/mysql-core';
import { users } from './user.schema';
import { songs, tracks } from './song.schema';

export const royalties = table("royalties", {
  id: varchar("id", { length: 100 }).primaryKey(),
  
  // Period tracking (e.g., "2024-Q1" or "2024-05")
  period: varchar("period", { length: 32 }).notNull(),
  periodType: varchar("period_type", { length: 20 }).notNull(), // monthly, quarterly
  
  // External Identifiers for matching
  upc: varchar("upc", { length: 50 }),
  isrc: varchar("isrc", { length: 32 }),
  trackName: varchar("track_name", { length: 255 }).notNull(),
  songTitle: varchar("song_title", { length: 255 }).notNull(),
  artistName: varchar("artist_name", { length: 255 }).notNull(),
  recordLabel: varchar("record_label", { length: 255 }),

  // Financial Data (Precision: 12 digits total, 4 after decimal)
  grossAmountUsd: decimal("gross_amount_usd", { precision: 12, scale: 4 }).notNull().default("0.0000"),
  deductionsPercent: decimal("deductions_percent", { precision: 5, scale: 2 }).default("0.00"),
  deductionsUsd: decimal("deductions_usd", { precision: 12, scale: 4 }).default("0.0000"),
  netAmountUsd: decimal("net_amount_usd", { precision: 12, scale: 4 }).notNull().default("0.0000"),

  // Internal Relations
  userId: varchar("user_id", { length: 100 }).notNull().references(() => users.id),
  songId: varchar("song_id", { length: 100 }).references(() => songs.id, { onDelete: "set null" }),
  trackId: varchar("track_id", { length: 36 }).references(() => tracks.id, { onDelete: "set null" }),
  artistId: varchar("artist_id", { length: 100 }), // Matches the artist table ID
  managerId: varchar("manager_id", { length: 36 }).references(() => users.id),

  // Reconciliation Status
  matchStatus: varchar("match_status", { length: 32 }).default("pending"), // pending, matched, manual
  matchedBy: varchar("matched_by", { length: 36 }).references(() => users.id),
  matchedAt: timestamp("matched_at"),
  
  // Payment Status
  approvedBy: varchar("approved_by", { length: 100 }).references(() => users.id),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  paymentStatus: varchar("payment_status", { length: 32 }).default("unpaid"), // unpaid, processing, paid

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userPeriodIdx: index("royalty_user_period_idx").on(t.userId, t.period),
  isrcIdx: index("royalty_isrc_idx").on(t.isrc),
  songIdx: index("royalty_song_idx").on(t.songId),
  paymentIdx: index("royalty_payment_status_idx").on(t.paymentStatus),
}));

export type Royalty = typeof royalties.$inferSelect;
export type NewRoyalty = typeof royalties.$inferInsert;
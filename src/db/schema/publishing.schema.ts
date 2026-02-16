import { mysqlTable as table, text, timestamp, varchar, int as integer, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

/**
 * PUBLISHING RECORDS TABLE
 * Tracks every time an admin publishes a song to the processing queue
 * Supports multiple publishing records per song (republishing history)
 */
export const publishingRecords = table("publishing_records", {
  id: varchar("id", { length: 100 }).primaryKey(),

  // References
  songId: varchar("song_id", { length: 100 }).notNull(),

  // Product code: SF-SC-{year}-{4digit} (e.g., SF-SC-2026-2002)
  productCode: varchar("product_code", { length: 50 }).notNull().unique(),

  // Admin who published
  publishedBy: varchar("published_by", { length: 100 }).notNull(),

  // Current status in publishing workflow
  // processing = admin published, waiting for validation
  // approved = external validation passed
  // published = live on platform
  status: varchar("status", { length: 32 }).notNull().default("processing"),

  // Optional notes (e.g., field changes made)
  notes: text("notes"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  songIdx: index("pub_song_idx").on(t.songId),
  codeIdx: index("pub_code_idx").on(t.productCode),
  publishedByIdx: index("pub_by_idx").on(t.publishedBy),
  statusIdx: index("pub_status_idx").on(t.status),
}));

/**
 * PRODUCT CODE SEQUENCES TABLE
 * Atomic counter for generating product codes per year
 * Prevents race conditions by using database transactions
 */
export const productCodeSequences = table("product_code_sequences", {
  // Year (e.g., 2026)
  year: integer("year").primaryKey(),

  // Sequence counter (starts at 2001, first code is 2002)
  // Resets each year
  sequence: integer("sequence").notNull().default(2001),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * PUBLISHING RELATIONS
 * Define how publishing records relate to songs
 */
export const publishingRecordsRelations = relations(publishingRecords, ({ one }) => ({
  // Note: No foreign key constraint, managed at app level
  // But we can still define the relationship for querying
}));

/**
 * TYPE EXPORTS
 * Infer types from the Drizzle schema definitions
 */
export type PublishingRecord = typeof publishingRecords.$inferSelect;
export type PublishingRecordInsert = typeof publishingRecords.$inferInsert;

export type ProductCodeSequence = typeof productCodeSequences.$inferSelect;
export type ProductCodeSequenceInsert = typeof productCodeSequences.$inferInsert;

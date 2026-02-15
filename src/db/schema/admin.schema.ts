import { mysqlTable as table, text, timestamp, boolean, int as integer, varchar, index } from 'drizzle-orm/mysql-core';
import { users } from './user.schema'; // Ensure this matches your export name

export const admin = table("admin", {
 id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }), // Foreign key to your user table
  to: varchar("to", { length: 255 }).notNull(), // Varchar is better for 'to' addresses
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(), // Text is perfect here for long content
  status: varchar("status", { length: 50 }).notNull(), // Changed from text to allow indexing
  error: text("error"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(), // Auto-update on status change
}, (t) => ({
  userIdx: index("email_logs_user_idx").on(t.userId),
  statusIdx: index("email_logs_status_idx").on(t.status),
  toIdx: index("email_logs_to_idx").on(t.to), // Added index for searching by recipient
}));
export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;
// ...existing code...
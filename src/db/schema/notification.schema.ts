import { mysqlTable as table, text, timestamp, boolean, varchar, json, index } from 'drizzle-orm/mysql-core';

export const notifications = table("notifications", {
  id: varchar("id", { length: 100 }).primaryKey(),
  userId: varchar("user_id", { length: 100 }).notNull(),
  // Changed to varchar to allow for specific category filtering
  type: varchar("type", { length: 50 }).notNull(), 
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  // Changed to varchar for indexing; 'unread' vs 'read' vs 'archived'
  status: varchar("status", { length: 20 }).notNull().default("unread"),
  read: boolean("read").default(false).notNull(),
  metadata: json("metadata"), // Great for storing links, actor IDs, or icons
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userIdx: index("notifications_user_idx").on(t.userId),
  // Now valid because status is a varchar
  statusIdx: index("notifications_status_idx").on(t.status),
  // Combined index for the most common query: finding unread notifications for a specific user
  userReadIdx: index("notifications_user_read_idx").on(t.userId, t.read),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
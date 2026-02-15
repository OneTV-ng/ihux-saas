import { mysqlTable as table, text, timestamp, varchar, json, index } from 'drizzle-orm/mysql-core';
import { users } from './user.schema';
import { artists } from './artist.schema';

// --- ADMIN TASKS (Internal Workflow) ---
export const adminTasks = table("admin_tasks", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Categorization
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  status: varchar("status", { length: 32 }).notNull().default("todo"), // todo, in_progress, review, done
  
  // Assignments
  assignedTo: varchar("assigned_to", { length: 100 }).references(() => users.id),
  createdBy: varchar("created_by", { length: 100 }).notNull().references(() => users.id),
  
  // Scheduling
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  
  // Contextual Relations
  metadata: json("metadata"),
  artistId: varchar("artist_id", { length: 100 }).references(() => artists.id),
  userId: varchar("user_id", { length: 100 }).references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  statusIdx: index("admin_tasks_status_idx").on(t.status),
  assigneeIdx: index("admin_tasks_assignee_idx").on(t.assignedTo),
  priorityIdx: index("admin_tasks_priority_idx").on(t.priority),
}));

// --- ADMIN ALERTS (System/Moderation Flags) ---
export const adminAlerts = table("admin_alerts", {
  id: varchar("id", { length: 100 }).primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // e.g., 'copyright_claim', 'payment_failure'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Dynamic Linking (What is this alert about?)
  entityType: varchar("entity_type", { length: 50 }), // 'song', 'artist', 'royalty'
  entityId: varchar("entity_id", { length: 36 }),
  
  // Moderation State
  status: varchar("status", { length: 32 }).default("open"), // open, investigation, resolved, dismissed
  severity: varchar("severity", { length: 20 }).default("info"), // info, warning, critical
  
  // Audit Trail
  matchedBy: varchar("matched_by", { length: 36 }).references(() => users.id),
  approvedBy: varchar("approved_by", { length: 100 }).references(() => users.id),
  resolvedBy: varchar("resolved_by", { length: 36 }).references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  alertTypeIdx: index("admin_alerts_type_idx").on(t.type),
  alertStatusIdx: index("admin_alerts_status_idx").on(t.status),
  entityIdx: index("admin_alerts_entity_idx").on(t.entityType, t.entityId),
}));

// --- Types ---
export type AdminTask = typeof adminTasks.$inferSelect;
export type NewAdminTask = typeof adminTasks.$inferInsert;
export type AdminAlert = typeof adminAlerts.$inferSelect;
export type NewAdminAlert = typeof adminAlerts.$inferInsert;
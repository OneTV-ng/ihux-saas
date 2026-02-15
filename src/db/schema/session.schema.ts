import { mysqlTable, varchar, text, timestamp, index } from 'drizzle-orm/mysql-core';
// Import your user table to establish the foreign key relationship
import { users } from './user.schema'; 

// SESSION TABLE
export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow().defaultNow().notNull(),
  
  // IP and User Agent usually use 'text' or 'varchar'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  // Unified userId with the foreign key reference
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Impersonation fields
  impersonatedBy: text('impersonated_by'),
  impersonatedAt: timestamp('impersonated_at'),
}, (table) => ({
  userIdx: index('sessions_user_id_idx').on(table.userId),
  tokenIdx: index('sessions_token_idx').on(table.token),
}));

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
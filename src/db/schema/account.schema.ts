import { mysqlTable, varchar, text, timestamp } from 'drizzle-orm/mysql-core';

export const account = mysqlTable('account', {
  // Use varchar(36) for UUIDs or varchar(255) for general IDs
  id: varchar('id', { length: 36 }).primaryKey(), 
  
  // These should also be varchar if you plan to index them or use them in lookups
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  
  // These are fine as text because they aren't keys/indices
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// --- Types ---
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;   
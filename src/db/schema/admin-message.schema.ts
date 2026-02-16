import {
  mysqlTable as table,
  varchar,
  text,
  timestamp,
  boolean,
  json,
  index,
} from 'drizzle-orm/mysql-core';

/**
 * Admin Messages Table
 * Stores custom messages sent by admins to users (individual or bulk)
 */
export const adminMessages = table(
  'admin_messages',
  {
    id: varchar('id', { length: 100 }).primaryKey(),
    senderId: varchar('sender_id', { length: 100 }).notNull(), // Admin who sent it

    // Recipient type: 'individual', 'role', 'status', 'bulk'
    recipientType: varchar('recipient_type', { length: 20 }).notNull(),

    // Recipient filter: { role: 'artist', status: 'submitted', userIds: [...] }
    // Flexible JSON to support different filtering strategies
    recipientFilter: json('recipient_filter'),

    subject: varchar('subject', { length: 255 }).notNull(),
    message: text('message').notNull(),

    // Timestamps
    sentAt: timestamp('sent_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    senderIdx: index('admin_msg_sender_idx').on(t.senderId),
    sentIdx: index('admin_msg_sent_idx').on(t.sentAt),
  })
);

/**
 * Message Recipients Table
 * Tracks who received each message and whether they've read it
 */
export const messageRecipients = table(
  'message_recipients',
  {
    id: varchar('id', { length: 100 }).primaryKey(),
    messageId: varchar('message_id', { length: 100 }).notNull(),
    userId: varchar('user_id', { length: 100 }).notNull(),

    // Read status
    read: boolean('read').default(false).notNull(),
    readAt: timestamp('read_at'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    messageIdx: index('msg_recipient_message_idx').on(t.messageId),
    userIdx: index('msg_recipient_user_idx').on(t.userId),
    readIdx: index('msg_recipient_read_idx').on(t.read),
  })
);

/**
 * Type exports
 */
export type AdminMessage = typeof adminMessages.$inferSelect;
export type NewAdminMessage = typeof adminMessages.$inferInsert;
export type MessageRecipient = typeof messageRecipients.$inferSelect;
export type NewMessageRecipient = typeof messageRecipients.$inferInsert;

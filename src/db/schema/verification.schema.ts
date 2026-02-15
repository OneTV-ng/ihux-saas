import { mysqlTable as table, text as textType,mysqlEnum ,boolean, timestamp as timestampType, varchar, json, index, uniqueIndex } from 'drizzle-orm/mysql-core';

import { users as user } from "./user.schema";

//export
 const xxaccount = table("account", {
  id: varchar("id", { length: 100 }).primaryKey(),
  accountId: textType("account_id").notNull(),
  providerId: textType("provider_id").notNull(),
  userId: textType("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: textType("access_token"),
  refreshToken: textType("refresh_token"),
  idToken: textType("id_token"),
  accessTokenExpiresAt: timestampType("access_token_expires_at"),
  refreshTokenExpiresAt: timestampType("refresh_token_expires_at"),
  scope: textType("scope"),
  password: textType("password"),
  createdAt: timestampType("created_at").notNull(),
  updatedAt: timestampType("updated_at").notNull(),
});


export const verification = table("verification", {
  id: varchar("id", { length: 100 }).primaryKey(),
  identifier: textType("identifier").notNull(),
  value: textType("value").notNull(),
  expiresAt: timestampType("expires_at").notNull(),
  createdAt: timestampType("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestampType("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  type: textType("type"),
});

// User Verification Table - For account verification workflow
export const usersVerificationxxxx = table("user_verification", {
  id: varchar("id", { length: 100 }).primaryKey(),
  userId: varchar("user_id", { length: 100 } )
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: textType("status", { 
    enum: ["updating", "submitted", "processing", "flagged", "rejected", "suspended", "verified"] 
  })
    .$defaultFn(() => "updating")
    .notNull(),
  submittedAt: timestampType("submitted_at"),
  processedAt: timestampType("processed_at"),
  verifiedAt: timestampType("verified_at"),
  remark: textType("remark"),
  rejectionReason: textType("rejection_reason"),
  flagReason: textType("flag_reason"),
  reviewedBy: varchar("reviewed_by", { length: 100 } ).references(() => user.id),
  governmentIdUrl: textType("government_id_url"),
  signatureUrl: textType("signature_url"),
  completionPercentage: textType("completion_percentage").$defaultFn(() => "0"),
  createdAt: timestampType("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestampType("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});


export const usersVerification = table("user_verification", {
  id: varchar("id", { length: 100 }).primaryKey(),
  userId: varchar("user_id", { length: 100 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  status: mysqlEnum("status", [
    "updating", "submitted", "processing", "flagged", "rejected", "suspended", "verified"
  ]).default("updating").notNull(),
  
  submittedAt: timestampType("submitted_at"),
  processedAt: timestampType("processed_at"),
  verifiedAt: timestampType("verified_at"),
  
  remark: textType("remark"),
  rejectionReason: textType("rejection_reason"),
  flagReason: textType("flag_reason"),
  
  reviewedBy: varchar("reviewed_by", { length: 100 })
    .references(() => user.id),
    
  governmentIdUrl: textType("government_id_url"),
  signatureUrl: textType("signature_url"),
  
  // Using varchar as requested for the percentage string
  completionPercentage: varchar("completion_percentage", { length: 10 }).default("0"),
  
  createdAt: timestampType("created_at").defaultNow().notNull(),
  updatedAt: timestampType("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userIdIdx: index("verification_user_id_idx").on(t.userId),
}));

export type UsersVerification = typeof usersVerification.$inferSelect;
export type NewUsersVerification = typeof usersVerification.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert; 
; 
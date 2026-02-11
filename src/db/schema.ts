import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  type: textType("type"),
});

// User Verification Table - For account verification workflow
export const userVerification = table("user_verification", {
  id: textType("id").primaryKey(),
  userId: textType("user_id")
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
  reviewedBy: textType("reviewed_by").references(() => user.id),
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

// Role definitions and permissions
export const ROLES = {
  GUEST: "guest" as const,           // Unregistered users (read-only access) - Power: 00
  NEW: "new" as const,               // Registered but unverified users - Power: 05
  MEMBER: "member" as const,         // Verified users (basic access) - Power: 10
  ARTIST: "artist" as const,         // Content creators - Power: 15
  BAND: "band" as const,             // Band accounts - Power: 20
  STUDIO: "studio" as const,         // Studio accounts - Power: 25
  CHOIR: "choir" as const,           // Choir accounts - Power: 30
  GROUP: "group" as const,           // Group accounts - Power: 35
  COMMUNITY: "community" as const,   // Community accounts - Power: 40
  LABEL: "label" as const,           // Label accounts - Power: 45
  EDITOR: "editor" as const,         // Content editors - Power: 50
  MANAGER: "manager" as const,       // Content managers - Power: 55
  ADMIN: "admin" as const,           // Administrators - Power: 60
  SADMIN: "sadmin" as const,         // Super administrators - Power: 65
};

export const ROLE_POWER_LEVELS = {
  guest: 0,
  new: 5,
  member: 10,
  artist: 15,
  band: 20,
  studio: 25,
  choir: 30,
  group: 35,
  community: 40,
  label: 45,
  editor: 50,
  manager: 55,
  admin: 60,
  sadmin: 65,
};

export const API_CLASSES = {
  BASIC: "5" as const,       // 100/page, no totals, 60 req/min (member, artist)
  STANDARD: "10" as const,   // 250/page, no totals, 120 req/min (band, studio, label, editor)
  ADVANCED: "20" as const,   // 500/page, see totals, 300 req/min (supervisor, manager)
  PREMIUM: "30" as const,    // 1000/page, see totals, 600 req/min (admin)
  UNLIMITED: "50" as const,  // Unlimited, see totals, unlimited req/min (sadmin)
};

export const ROLE_PERMISSIONS = {
  guest: {
    powerLevel: 0,
    apiClass: null,
    maxPerPage: 20,
    canSeeTotals: false,
    requestsPerMin: 10,
    canUpload: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  new: {
    powerLevel: 5,
    apiClass: null,
    maxPerPage: 20,
    canSeeTotals: false,
    requestsPerMin: 20,
    canUpload: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  member: {
    powerLevel: 10,
    apiClass: "5" as const,
    maxPerPage: 100,
    canSeeTotals: false,
    requestsPerMin: 60,
    canUpload: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  artist: {
    powerLevel: 15,
    apiClass: "5" as const,
    maxPerPage: 100,
    canSeeTotals: false,
    requestsPerMin: 60,
    canUpload: true,
    canEdit: true,
    canDelete: true, // Can delete own content
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  band: {
    powerLevel: 20,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  studio: {
    powerLevel: 25,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  choir: {
    powerLevel: 30,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  group: {
    powerLevel: 35,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: true,
  },
  community: {
    powerLevel: 40,
    apiClass: "20" as const,
    maxPerPage: 500,
    canSeeTotals: false,
    requestsPerMin: 300,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: true,
  },
  label: {
    powerLevel: 45,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: true,
  },
  editor: {
    powerLevel: 50,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: true,
  },
  manager: {
    powerLevel: 55,
    apiClass: "20" as const,
    maxPerPage: 500,
    canSeeTotals: true,
    requestsPerMin: 300,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: true, // Can approve but not create/modify accounts
    canFlag: true,
  },
  admin: {
    powerLevel: 60,
    apiClass: "30" as const,
    maxPerPage: 1000,
    canSeeTotals: true,
    requestsPerMin: 600,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canApprove: true,
    canFlag: true,
  },
  sadmin: {
    powerLevel: 65,
    apiClass: "50" as const,
    maxPerPage: Infinity,
    canSeeTotals: true,
    requestsPerMin: Infinity,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canApprove: true,
    canFlag: true,
  },
};

export type UserRole = keyof typeof ROLE_PERMISSIONS;
export type ApiClass = typeof API_CLASSES[keyof typeof API_CLASSES];

// Export music platform tables from music-schema
export * from "./music-schema";

// Artist Profile Table
export const artistProfiles = table("artist_profiles", {
  id: textType("id").primaryKey(),
  userId: textType("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  artistName: textType("artist_name").notNull().unique(),
  displayName: textType("display_name"),
  bio: textType("bio"),
  picture: textType("picture"),
  thumbnails: jsonType("thumbnails"),
  gallery: jsonType("gallery"),
  mediaPlatform: jsonType("media_platform"),
  socialMedia: jsonType("social_media"),
  fanNews: jsonType("fan_news"),
  isPublic: booleanType("is_public").$defaultFn(() => false),
  isVerified: booleanType("is_verified").$defaultFn(() => false),
  totalSongs: textType("total_songs"),
  totalPlays: textType("total_plays"),
  totalFollowers: textType("total_followers"),
  createdAt: timestampType("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestampType("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const tenant = table("tenant", {
  id: textType("id").primaryKey(),
  tenantName: textType("tenant_name").notNull().unique(),
  apiKey: textType("api_key"),
  email: textType("email"),
  url: textType("url"),
  contact: textType("contact"),
  name: textType("name"),
  shortName: textType("short_name"),
  brandingJson: jsonType("branding_json"),
  contactsJson: jsonType("contacts_json"),
  aboutUsJson: jsonType("about_us_json"),
  createdAt: timestampType("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestampType("updated_at").$defaultFn(() => new Date()).notNull(),
});

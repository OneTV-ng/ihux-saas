import { mysqlTable as table, text,boolean, timestamp, varchar, json, index, uniqueIndex } from 'drizzle-orm/mysql-core';

//import users from "./user.schema";

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
//export * from "./music.schema";





// --- Users Table (Auth & Core Identity) ---
export const users = table("users", {
  id: varchar("id", { length: 100 }).primaryKey(),
  username: varchar("username", { length: 255 }).default(""),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  emailVerified: boolean("email_verified").default(false).notNull(),
  passwordHash: text("password_hash").notNull().default(""),
  
  // Profile & Media
  image: text("image"),
  thumbnail: text("thumbnail"),
  profilePicture: text("profile_picture"),
  headerBackground: text("header_background"),
  
  // Contact & Personal
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  dateOfBirth: varchar("date_of_birth", { length: 10 }), // Store as YYYY-MM-DD
  address: text("address"),
  
  // Professional & Metadata
  recordLabel: varchar("record_label", { length: 255 }),
  socialMedia: json("social_media"), // Stores URLs as { twitter: '...', instagram: '...' }
  bankDetails: json("bank_details"), // Stores { bankName: '...', accountNumber: '...' }
  settings: json("settings"),       // Stores user preferences
  
  // Auth & Status
  role: varchar("role", { length: 50 }).notNull().default("user"),
  banned: boolean("banned").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (t) => ({
  usernameUnique: uniqueIndex("users_username_unique").on(t.username),
  emailUnique: uniqueIndex("users_email_unique").on(t.email),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// --- Users Table (Auth & Core Identity) ---
// --- User Profiles Table (Extended Metadata) ---
export const userProfiles = table("user_profiles", {
  id: varchar("id", { length: 100 }).primaryKey(),
  userId: varchar("user_id", { length: 100 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 255 }),
  firstname: varchar("firstname", { length: 100 }),
  lastname: varchar("lastname", { length: 100 }),
  bio: text("bio"),
  platform: varchar("platform", { length: 50 }).default("web"),
  socials: json("socials"),
  preferences: json("preferences"),
  metadata: json("metadata"),
  selectedArtistId: varchar("selected_artist_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userIdUnique: uniqueIndex("user_profiles_user_id_unique").on(t.userId),
  usernameIdx: index("user_profiles_username_idx").on(t.username),
}));

// --- Infer Types ---
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;



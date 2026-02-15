import { 
  mysqlTable as table, 
  text, 
  timestamp, 
  boolean, 
  int as integer, 
  json, 
  varchar, 
  index, 
  uniqueIndex 
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

// --- Artist Table (Core Identity & Legal) ---
export const artists = table("artists", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    // Changed to varchar(255) because MySQL 'text' cannot be UNIQUE
    artistName: varchar("artist_name", { length: 255 }).notNull(), 
    displayName: varchar("display_name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    bio: text("bio"),
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }),
    birthday: timestamp("birthday"),
    gender: varchar("gender", { length: 50 }),
    genre: varchar("genre", { length: 100 }),
    recordLabel: varchar("record_label", { length: 255 }),
    contact: json("contact"),
    legalId: varchar("legal_id", { length: 255 }),
    contract: text("contract"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    userIdx: index("artists_user_idx").on(t.userId),
    slugUnique: uniqueIndex("artists_slug_unique").on(t.slug),
    artistNameUnique: uniqueIndex("artists_name_unique").on(t.artistName),
}));

// --- Artist Profile Table (Public Metadata & Stats) ---
export const artistProfiles = table("artist_profiles", {
    id: varchar("id", { length: 36 }).primaryKey(),
    artistId: varchar("artist_id", { length: 36 })
        .notNull()
        .references(() => artists.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 }).notNull(),
    picture: text("picture"),
    thumbnails: json("thumbnails"),
    gallery: json("gallery"),
    mediaPlatform: json("media_platform"),
    socialMedia: json("social_media"),
    fanNews: json("fan_news"),
    press: json("press"),
    team: json("team"),
    producer: varchar("producer", { length: 255 }),
    songwriter: varchar("songwriter", { length: 255 }),
    studio: varchar("studio", { length: 255 }),
    recordLabel: varchar("record_label", { length: 255 }),
    genre: varchar("genre", { length: 100 }),
    subGenre: varchar("sub_genre", { length: 100 }),
    country: varchar("country", { length: 100 }),
    city: varchar("city", { length: 100 }),
    isPublic: boolean("is_public").default(true).notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    totalSongs: integer("total_songs").default(0).notNull(),
    totalPlays: integer("total_plays").default(0).notNull(),
    totalFollowers: integer("total_followers").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    artistIdx: index("artist_profiles_artist_idx").on(t.artistId),
    publicIdx: index("artist_profiles_public_idx").on(t.isPublic),
    featuredIdx: index("artist_profiles_featured_idx").on(t.isFeatured),
}));

// --- Types (Using Drizzle's InferSelect) ---
export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;
export type ArtistProfile = typeof artistProfiles.$inferSelect;
export type NewArtistProfile = typeof artistProfiles.$inferInsert;
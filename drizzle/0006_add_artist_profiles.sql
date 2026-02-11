-- Add selectedArtistId to user_profiles table
ALTER TABLE "user_profiles" ADD COLUMN "selected_artist_id" uuid;

-- Create artist_profiles table
CREATE TABLE IF NOT EXISTS "artist_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"artist_name" text NOT NULL UNIQUE,
	"display_name" text NOT NULL,
	"bio" text,
	"picture" text,
	"thumbnails" jsonb,
	"gallery" jsonb,
	"media_platform" jsonb,
	"social_media" jsonb,
	"fan_news" jsonb,
	"is_public" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"total_songs" integer DEFAULT 0 NOT NULL,
	"total_plays" integer DEFAULT 0 NOT NULL,
	"total_followers" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artist_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "artist_profiles_user_idx" ON "artist_profiles" ("user_id");
CREATE INDEX IF NOT EXISTS "artist_profiles_name_idx" ON "artist_profiles" ("artist_name");
CREATE INDEX IF NOT EXISTS "artist_profiles_public_idx" ON "artist_profiles" ("is_public");

-- Restructure artist tables: separate private business info (artists) from public profile (artist_profiles)

-- Step 1: Create the new artists table for private business information
CREATE TABLE "artists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "artist_name" text NOT NULL UNIQUE,
  "display_name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "bio" text,
  "city" text,
  "country" text,
  "birthday" timestamp,
  "gender" text,
  "genre" text,
  "contact" jsonb,
  "legal_id" text,
  "contract" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes on artists table
CREATE INDEX "artists_user_idx" ON "artists"("user_id");
CREATE INDEX "artists_slug_idx" ON "artists"("slug");
CREATE INDEX "artists_name_idx" ON "artists"("artist_name");

-- Step 2: Migrate existing data from artist_profiles to artists table
INSERT INTO "artists" (
  "id",
  "user_id",
  "artist_name",
  "display_name",
  "slug",
  "bio",
  "city",
  "country",
  "gender",
  "genre",
  "created_at",
  "updated_at"
)
SELECT
  "id",
  "user_id",
  "artist_name",
  "display_name",
  "artist_name" as "slug", -- Use artist_name as slug initially
  "bio",
  "city",
  "country",
  "gender",
  "genre",
  "created_at",
  "updated_at"
FROM "artist_profiles";

-- Step 3: Add artist_id column to artist_profiles
ALTER TABLE "artist_profiles" ADD COLUMN "artist_id" uuid;

-- Step 4: Populate artist_id by matching the id
UPDATE "artist_profiles" ap
SET "artist_id" = a."id"
FROM "artists" a
WHERE ap."id" = a."id";

-- Step 5: Make artist_id NOT NULL and add foreign key
ALTER TABLE "artist_profiles" ALTER COLUMN "artist_id" SET NOT NULL;
ALTER TABLE "artist_profiles" ADD CONSTRAINT "artist_profiles_artist_id_fkey"
  FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE;

-- Step 6: Add press field to artist_profiles
ALTER TABLE "artist_profiles" ADD COLUMN "press" jsonb;

-- Step 7: Remove fields from artist_profiles that moved to artists table
ALTER TABLE "artist_profiles" DROP COLUMN "user_id";
ALTER TABLE "artist_profiles" DROP COLUMN "artist_name";
ALTER TABLE "artist_profiles" DROP COLUMN "display_name";
ALTER TABLE "artist_profiles" DROP COLUMN "bio";
ALTER TABLE "artist_profiles" DROP COLUMN "gender";
ALTER TABLE "artist_profiles" DROP COLUMN "city";
ALTER TABLE "artist_profiles" DROP COLUMN "country";
ALTER TABLE "artist_profiles" DROP COLUMN "genre";

-- Step 8: Update indexes on artist_profiles
DROP INDEX IF EXISTS "artist_profiles_user_idx";
DROP INDEX IF EXISTS "artist_profiles_name_idx";
CREATE INDEX "artist_profiles_artist_idx" ON "artist_profiles"("artist_id");

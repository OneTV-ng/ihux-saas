-- Add isFeatured field to songs table
ALTER TABLE "songs" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;

-- Add isFeatured field to artist_profiles table
ALTER TABLE "artist_profiles" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;

-- Create indexes for faster featured queries
CREATE INDEX "songs_featured_idx" ON "songs" ("is_featured");
CREATE INDEX "artist_profiles_featured_idx" ON "artist_profiles" ("is_featured");

-- Add gender, city, and country fields to artist_profiles
ALTER TABLE "artist_profiles" ADD COLUMN "gender" text;
ALTER TABLE "artist_profiles" ADD COLUMN "city" text;
ALTER TABLE "artist_profiles" ADD COLUMN "country" text;

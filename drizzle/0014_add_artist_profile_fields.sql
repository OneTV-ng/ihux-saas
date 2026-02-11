-- Migration: Add new fields to artist_profiles
ALTER TABLE artist_profiles
  ADD COLUMN producer TEXT,
  ADD COLUMN songwriter TEXT,
  ADD COLUMN studio TEXT,
  ADD COLUMN record_label TEXT,
  ADD COLUMN genre TEXT,
  ADD COLUMN sub_genre TEXT,
  ADD COLUMN country TEXT,
  ADD COLUMN city TEXT,
  ADD COLUMN team JSON,
  ADD COLUMN preference JSON;

-- Migration: Fix songs.artist_id foreign key constraint
-- Issue: artist_id was incorrectly referencing users.id instead of artists.id
-- This migration fixes the constraint

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS=0;

-- Drop the incorrect foreign key constraint
ALTER TABLE `songs` DROP FOREIGN KEY `songs_artist_id_users_id_fk`;

-- Add the correct foreign key constraint
ALTER TABLE `songs`
ADD CONSTRAINT `songs_artist_id_artists_id_fk`
FOREIGN KEY (`artist_id`)
REFERENCES `artists`(`id`)
ON DELETE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Verify the constraint is correct
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'songs' AND COLUMN_NAME = 'artist_id';

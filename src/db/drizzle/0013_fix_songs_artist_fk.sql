-- Migration: songs.artist_id FK constraint removal
-- Per requirements: foreign key constraints are NOT used - relationships managed at application level
-- Previous migrations incorrectly added FK constraints that need to be removed

SET FOREIGN_KEY_CHECKS=0;

-- Drop any FK constraints on artist_id and user_id (relationships managed at application level)
ALTER TABLE `songs` DROP FOREIGN KEY IF EXISTS `songs_artist_id_users_id_fk`;
ALTER TABLE `songs` DROP FOREIGN KEY IF EXISTS `songs_artist_id_artists_id_fk`;
ALTER TABLE `songs` DROP FOREIGN KEY IF EXISTS `songs_user_id_users_id_fk`;

-- Verify constraints are removed
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'songs' AND (COLUMN_NAME = 'artist_id' OR COLUMN_NAME = 'user_id') AND REFERENCED_TABLE_NAME IS NOT NULL;

SET FOREIGN_KEY_CHECKS=1;

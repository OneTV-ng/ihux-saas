-- Cleanup deprecated columns and add missing foreign key constraints
-- This migration:
-- 1. Adds missing foreign keys for artists.user_id and artistProfiles.user_id
-- 2. Updates songs table foreign keys to properly handle optional fields
-- 3. Removes deprecated created_by and managed_by columns from songs table (if they exist)

SET FOREIGN_KEY_CHECKS=0;

-- Step 1: Add missing foreign key constraint for artists.user_id
ALTER TABLE artists
  DROP KEY IF EXISTS artists_user_idx,
  ADD CONSTRAINT artists_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD KEY artists_user_idx (user_id);

-- Step 2: Add missing foreign key constraint for artist_profiles.user_id
ALTER TABLE artist_profiles
  DROP KEY IF EXISTS artist_profiles_user_id_users_id_fk,
  ADD CONSTRAINT artist_profiles_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 3: Update songs table foreign keys to properly set NULL for optional fields
ALTER TABLE songs
  DROP FOREIGN KEY IF EXISTS songs_flagged_by_users_id_fk,
  DROP FOREIGN KEY IF EXISTS songs_approved_by_users_id_fk,
  ADD CONSTRAINT songs_flagged_by_users_id_fk
    FOREIGN KEY (flagged_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT songs_approved_by_users_id_fk
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Step 4: Ensure songs.user_id has proper constraint
ALTER TABLE songs
  DROP FOREIGN KEY IF EXISTS songs_user_id_users_id_fk,
  ADD CONSTRAINT songs_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 5: Ensure songs.artist_id has proper constraint
ALTER TABLE songs
  DROP FOREIGN KEY IF EXISTS songs_artist_id_artists_id_fk,
  ADD CONSTRAINT songs_artist_id_artists_id_fk
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE;

-- Step 6: Remove deprecated columns from songs table if they exist
-- Check if columns exist before dropping (safe approach)
SET @dbname = DATABASE();
SET @tablename = 'songs';
SET @columnname1 = 'created_by';
SET @columnname2 = 'managed_by';

-- Drop created_by column if it exists and is not referenced
SELECT IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname1
  ),
  'ALTER TABLE songs DROP COLUMN created_by;',
  'SELECT 1;'
) INTO @sql1;

SELECT IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname2
  ),
  'ALTER TABLE songs DROP COLUMN managed_by;',
  'SELECT 1;'
) INTO @sql2;

PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Step 7: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Verification: Show all constraints
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

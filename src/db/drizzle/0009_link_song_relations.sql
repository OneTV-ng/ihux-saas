-- Link songs table to users and artists with proper foreign keys
-- This migration ensures data integrity and relationships

-- Step 1: Drop existing constraints if they exist
SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_artist_id_users_id_fk;
ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_artist_id_artists_id_fk;
ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_user_id_users_id_fk;

-- Step 2: Ensure columns exist with correct types
-- Add userId column if it doesn't exist
ALTER TABLE songs 
  ADD COLUMN IF NOT EXISTS user_id VARCHAR(36) AFTER id;

-- Ensure artistId is VARCHAR(36) to match artists.id
ALTER TABLE songs MODIFY COLUMN artist_id VARCHAR(36) NOT NULL;

-- Step 3: Populate userId from artists table if empty
-- (assumes each song's artist belongs to a user)
UPDATE songs s
LEFT JOIN artists a ON s.artist_id = a.id
SET s.user_id = a.user_id
WHERE s.user_id IS NULL AND a.user_id IS NOT NULL;

-- Step 4: Add NOT NULL constraint to userId
ALTER TABLE songs MODIFY COLUMN user_id VARCHAR(36) NOT NULL;

-- Step 5: Create proper foreign key indexes
CREATE INDEX IF NOT EXISTS songs_user_id_idx ON songs(user_id);
CREATE INDEX IF NOT EXISTS songs_artist_id_idx ON songs(artist_id);

-- Step 6: Add proper foreign key constraints
ALTER TABLE songs
  ADD CONSTRAINT songs_user_id_users_id_fk 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE songs
  ADD CONSTRAINT songs_artist_id_artists_id_fk 
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE;

-- Step 7: Remove deprecated columns
ALTER TABLE songs 
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS managed_by;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Verification query
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME,
  CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'songs' AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY COLUMN_NAME;

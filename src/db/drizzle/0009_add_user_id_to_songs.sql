-- Add user_id field to songs table
-- This tracks which user account owns/manages the song

ALTER TABLE songs 
ADD COLUMN user_id VARCHAR(36) NOT NULL AFTER id,
ADD CONSTRAINT songs_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for user_id
CREATE INDEX songs_user_idx ON songs(user_id);

-- Fix artist_id to properly reference artists table
-- First, drop the old foreign key if it exists
ALTER TABLE songs DROP FOREIGN KEY songs_artist_id_users_id_fk;

-- Update artist_id column length to match artists.id (36 chars, not 100)
ALTER TABLE songs MODIFY COLUMN artist_id VARCHAR(36) NOT NULL;

-- Add proper foreign key to artists table
ALTER TABLE songs 
ADD CONSTRAINT songs_artist_fk FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE;

-- Remove unused columns
ALTER TABLE songs DROP COLUMN created_by;
ALTER TABLE songs DROP COLUMN managed_by;

-- Update existing data if needed (populate user_id from users table)
-- This assumes each user has at most one associated entry - adjust as needed for your data
UPDATE songs s 
LEFT JOIN artists a ON s.artist_id = a.id
SET s.user_id = COALESCE(a.user_id, s.user_id)
WHERE s.user_id IS NULL;


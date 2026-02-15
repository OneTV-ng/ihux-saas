-- Update all ID columns to VARCHAR(100) from VARCHAR(36)
-- This migration handles foreign key constraints properly

-- Step 1: Disable foreign key checks
SET FOREIGN_KEY_CHECKS=0;

-- Step 2: Drop all foreign key constraints
-- Get all foreign keys and drop them

-- Songs table constraints
ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_artist_id_artists_id_fk;
ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_user_id_users_id_fk;
ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_flagged_by_users_id_fk;
ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_approved_by_users_id_fk;

-- Tracks table constraints
ALTER TABLE tracks DROP FOREIGN KEY IF EXISTS tracks_song_id_songs_id_fk;

-- Artists table constraints
ALTER TABLE artists DROP FOREIGN KEY IF EXISTS artists_user_id_users_id_fk;

-- Accounts table constraints
ALTER TABLE accounts DROP FOREIGN KEY IF EXISTS accounts_user_id_users_id_fk;

-- Sessions table constraints
ALTER TABLE sessions DROP FOREIGN KEY IF EXISTS sessions_user_id_users_id_fk;

-- Verification table constraints
ALTER TABLE verification DROP FOREIGN KEY IF EXISTS verification_user_id_users_id_fk;

-- Uploads table constraints
ALTER TABLE uploads DROP FOREIGN KEY IF EXISTS uploads_user_id_users_id_fk;

-- Admin table constraints
ALTER TABLE admin DROP FOREIGN KEY IF EXISTS admin_user_id_users_id_fk;
ALTER TABLE admin DROP FOREIGN KEY IF EXISTS admin_approved_by_users_id_fk;

-- Admin task table constraints
ALTER TABLE admin_task DROP FOREIGN KEY IF EXISTS admin_task_created_by_users_id_fk;
ALTER TABLE admin_task DROP FOREIGN KEY IF EXISTS admin_task_assigned_to_users_id_fk;

-- Email log table constraints
ALTER TABLE email_log DROP FOREIGN KEY IF EXISTS email_log_user_id_users_id_fk;

-- Notification table constraints
ALTER TABLE notification DROP FOREIGN KEY IF EXISTS notification_user_id_users_id_fk;

-- Royalty table constraints
ALTER TABLE royalty DROP FOREIGN KEY IF EXISTS royalty_user_id_users_id_fk;
ALTER TABLE royalty DROP FOREIGN KEY IF EXISTS royalty_song_id_songs_id_fk;

-- Step 3: Modify all ID columns to VARCHAR(100)

-- USERS table
ALTER TABLE users MODIFY COLUMN id VARCHAR(100) NOT NULL;

-- ARTISTS table
ALTER TABLE artists MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE artists MODIFY COLUMN user_id VARCHAR(100) NOT NULL;

-- SONGS table
ALTER TABLE songs MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE songs MODIFY COLUMN user_id VARCHAR(100) NOT NULL;
ALTER TABLE songs MODIFY COLUMN artist_id VARCHAR(100) NOT NULL;
ALTER TABLE songs MODIFY COLUMN flagged_by VARCHAR(100);
ALTER TABLE songs MODIFY COLUMN approved_by VARCHAR(100);

-- TRACKS table
ALTER TABLE tracks MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE tracks MODIFY COLUMN song_id VARCHAR(100) NOT NULL;

-- SESSIONS table
ALTER TABLE sessions MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE sessions MODIFY COLUMN user_id VARCHAR(100) NOT NULL;

-- ACCOUNTS table
ALTER TABLE accounts MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE accounts MODIFY COLUMN user_id VARCHAR(100) NOT NULL;
ALTER TABLE accounts MODIFY COLUMN provider_account_id VARCHAR(100);

-- VERIFICATION table
ALTER TABLE verification MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE verification MODIFY COLUMN identifier VARCHAR(100);
ALTER TABLE verification MODIFY COLUMN user_id VARCHAR(100);

-- UPLOADS table
ALTER TABLE uploads MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE uploads MODIFY COLUMN user_id VARCHAR(100) NOT NULL;

-- ADMIN table
ALTER TABLE admin MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE admin MODIFY COLUMN user_id VARCHAR(100) NOT NULL;
ALTER TABLE admin MODIFY COLUMN approved_by VARCHAR(100);

-- ADMIN_TASK table
ALTER TABLE admin_task MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE admin_task MODIFY COLUMN created_by VARCHAR(100) NOT NULL;
ALTER TABLE admin_task MODIFY COLUMN assigned_to VARCHAR(100);

-- EMAIL_LOG table
ALTER TABLE email_log MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE email_log MODIFY COLUMN user_id VARCHAR(100);

-- NOTIFICATION table
ALTER TABLE notification MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE notification MODIFY COLUMN user_id VARCHAR(100) NOT NULL;

-- ROYALTY table
ALTER TABLE royalty MODIFY COLUMN id VARCHAR(100) NOT NULL;
ALTER TABLE royalty MODIFY COLUMN user_id VARCHAR(100) NOT NULL;
ALTER TABLE royalty MODIFY COLUMN song_id VARCHAR(100);

-- Step 4: Re-create all foreign key constraints

-- Songs FK constraints
ALTER TABLE songs
  ADD CONSTRAINT songs_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE songs
  ADD CONSTRAINT songs_artist_id_artists_id_fk
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE;

ALTER TABLE songs
  ADD CONSTRAINT songs_flagged_by_users_id_fk
    FOREIGN KEY (flagged_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE songs
  ADD CONSTRAINT songs_approved_by_users_id_fk
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Tracks FK constraint
ALTER TABLE tracks
  ADD CONSTRAINT tracks_song_id_songs_id_fk
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE;

-- Artists FK constraint
ALTER TABLE artists
  ADD CONSTRAINT artists_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Accounts FK constraint
ALTER TABLE accounts
  ADD CONSTRAINT accounts_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Sessions FK constraint
ALTER TABLE sessions
  ADD CONSTRAINT sessions_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Verification FK constraint
ALTER TABLE verification
  ADD CONSTRAINT verification_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Uploads FK constraint
ALTER TABLE uploads
  ADD CONSTRAINT uploads_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Admin FK constraints
ALTER TABLE admin
  ADD CONSTRAINT admin_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE admin
  ADD CONSTRAINT admin_approved_by_users_id_fk
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Admin task FK constraints
ALTER TABLE admin_task
  ADD CONSTRAINT admin_task_created_by_users_id_fk
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE admin_task
  ADD CONSTRAINT admin_task_assigned_to_users_id_fk
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- Email log FK constraint
ALTER TABLE email_log
  ADD CONSTRAINT email_log_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Notification FK constraint
ALTER TABLE notification
  ADD CONSTRAINT notification_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Royalty FK constraints
ALTER TABLE royalty
  ADD CONSTRAINT royalty_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE royalty
  ADD CONSTRAINT royalty_song_id_songs_id_fk
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE;

-- Step 5: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Verification query
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE (COLUMN_NAME IN ('id', 'user_id', 'artist_id', 'song_id'))
  AND TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, COLUMN_NAME;

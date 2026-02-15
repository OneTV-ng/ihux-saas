-- Fix artist_id column length to accommodate prefixed artist IDs
ALTER TABLE songs MODIFY COLUMN artist_id VARCHAR(100) NOT NULL;
ALTER TABLE tracks MODIFY COLUMN lead_vocal VARCHAR(255);

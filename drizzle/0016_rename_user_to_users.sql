-- Migration: Rename user table to users and update foreign keys
RENAME TABLE user TO users;

-- Update foreign keys in related tables (example for MySQL)
ALTER TABLE songs CHANGE artist_id artist_id VARCHAR(255), DROP FOREIGN KEY songs_ibfk_1, ADD CONSTRAINT songs_artist_id_fk FOREIGN KEY (artist_id) REFERENCES users(id);
ALTER TABLE songs CHANGE flagged_by flagged_by VARCHAR(255), DROP FOREIGN KEY songs_ibfk_2, ADD CONSTRAINT songs_flagged_by_fk FOREIGN KEY (flagged_by) REFERENCES users(id);
ALTER TABLE songs CHANGE approved_by approved_by VARCHAR(255), DROP FOREIGN KEY songs_ibfk_3, ADD CONSTRAINT songs_approved_by_fk FOREIGN KEY (approved_by) REFERENCES users(id);
ALTER TABLE songs CHANGE created_by created_by VARCHAR(255), DROP FOREIGN KEY songs_ibfk_4, ADD CONSTRAINT songs_created_by_fk FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE songs CHANGE managed_by managed_by VARCHAR(255), DROP FOREIGN KEY songs_ibfk_5, ADD CONSTRAINT songs_managed_by_fk FOREIGN KEY (managed_by) REFERENCES users(id);
-- Repeat for all other tables referencing user(id)

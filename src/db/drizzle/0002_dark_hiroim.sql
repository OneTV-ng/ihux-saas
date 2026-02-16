ALTER TABLE `songs` DROP FOREIGN KEY `songs_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `songs` DROP FOREIGN KEY `songs_artist_id_artists_id_fk`;
--> statement-breakpoint
ALTER TABLE `songs` DROP FOREIGN KEY `songs_flagged_by_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `songs` DROP FOREIGN KEY `songs_approved_by_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `tracks` DROP FOREIGN KEY `tracks_song_id_songs_id_fk`;
--> statement-breakpoint
ALTER TABLE `songs` ADD `created_by` varchar(100);--> statement-breakpoint
ALTER TABLE `songs` ADD `managed_by` varchar(100);
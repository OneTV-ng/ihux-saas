ALTER TABLE `songs` DROP FOREIGN KEY `songs_artist_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `songs` DROP FOREIGN KEY `songs_created_by_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `songs` DROP FOREIGN KEY `songs_managed_by_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `songs` MODIFY COLUMN `artist_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `songs` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_artist_id_artists_id_fk` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `songs_user_idx` ON `songs` (`user_id`);--> statement-breakpoint
ALTER TABLE `songs` DROP COLUMN `created_by`;--> statement-breakpoint
ALTER TABLE `songs` DROP COLUMN `managed_by`;
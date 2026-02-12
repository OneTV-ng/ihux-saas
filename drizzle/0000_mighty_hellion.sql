CREATE TABLE `account` (
	`id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_profiles` (
	`id` varchar(36) NOT NULL,
	`artist_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`picture` text,
	`thumbnails` json,
	`gallery` json,
	`media_platform` json,
	`social_media` json,
	`fan_news` json,
	`press` json,
	`team` json,
	`producer` text,
	`songwriter` text,
	`studio` text,
	`record_label` text,
	`genre` text,
	`sub_genre` text,
	`country` text,
	`city` text,
	`is_public` boolean NOT NULL DEFAULT true,
	`is_verified` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
	`total_songs` int NOT NULL DEFAULT 0,
	`total_plays` int NOT NULL DEFAULT 0,
	`total_followers` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `artist_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` text NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `tenant` (
	`id` text NOT NULL,
	`tenant_name` text NOT NULL,
	`api_key` text,
	`email` text,
	`url` text,
	`contact` text,
	`name` text,
	`short_name` text,
	`branding_json` json,
	`contacts_json` json,
	`about_us_json` json,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `tenant_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_tenant_name_unique` UNIQUE(`tenant_name`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`gender` text,
	`email` text NOT NULL,
	`username` text,
	`thumbnail` text,
	`provider` text,
	`verified` boolean NOT NULL,
	`email_verified` boolean NOT NULL,
	`image` text,
	`tenant` text,
	`profile_picture` text,
	`header_background` text,
	`phone` text,
	`whatsapp` text,
	`date_of_birth` date,
	`address` text,
	`record_label` text,
	`social_media` json,
	`bank_details` json,
	`settings` json,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`role` text NOT NULL,
	`api_class` text NOT NULL,
	`banned` boolean NOT NULL,
	`ban_reason` text,
	`ban_expires` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `user_verification` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`submitted_at` timestamp,
	`processed_at` timestamp,
	`verified_at` timestamp,
	`remark` text,
	`rejection_reason` text,
	`flag_reason` text,
	`reviewed_by` text,
	`government_id_url` text,
	`signature_url` text,
	`completion_percentage` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `user_verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp,
	`updated_at` timestamp,
	`type` text,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_alerts` (
	`id` varchar(36) NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`entity_type` text,
	`entity_id` varchar(36),
	`status` text NOT NULL DEFAULT ('active'),
	`severity` text,
	`matched_by` varchar(36),
	`approved_by` varchar(36),
	`resolved_by` varchar(36),
	`resolved_at` timestamp,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_tasks` (
	`id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT ('medium'),
	`status` text NOT NULL DEFAULT ('pending'),
	`assigned_to` varchar(36),
	`created_by` varchar(36) NOT NULL,
	`due_date` timestamp,
	`completed_at` timestamp,
	`metadata` json,
	`artist_id` varchar(36),
	`user_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` varchar(36) NOT NULL,
	`assigned_to` varchar(36),
	`created_by` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`key` text,
	`name` text NOT NULL,
	`api_class` int NOT NULL DEFAULT 5,
	`rate_limit` int NOT NULL DEFAULT 60,
	`status` text NOT NULL DEFAULT ('active'),
	`last_used_at` timestamp,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`artist_name` text NOT NULL,
	`display_name` text NOT NULL,
	`slug` text NOT NULL,
	`bio` text,
	`city` text,
	`country` text,
	`birthday` timestamp,
	`gender` text,
	`genre` text,
	`record_label` text,
	`contact` json,
	`legal_id` text,
	`contract` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `artists_id` PRIMARY KEY(`id`),
	CONSTRAINT `artists_artist_name_unique` UNIQUE(`artist_name`),
	CONSTRAINT `artists_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `royalties` (
	`id` varchar(36) NOT NULL,
	`period` text NOT NULL,
	`period_type` text NOT NULL,
	`upc` text,
	`isrc` text,
	`track_name` text NOT NULL,
	`song_title` text NOT NULL,
	`artist_name` text NOT NULL,
	`record_label` text,
	`gross_amount_usd` decimal(10,2) NOT NULL,
	`deductions_percent` decimal(5,2) DEFAULT '0',
	`deductions_usd` decimal(10,2) DEFAULT '0',
	`net_amount_usd` decimal(10,2) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`song_id` varchar(36),
	`track_id` varchar(36),
	`artist_id` varchar(36),
	`manager_id` varchar(36),
	`match_status` text DEFAULT ('unmatched'),
	`matched_by` varchar(36),
	`matched_at` timestamp,
	`approved_by` varchar(36),
	`approved_at` timestamp,
	`paid_at` timestamp,
	`payment_status` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `royalties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`artist_id` varchar(36) NOT NULL,
	`artist_name` text NOT NULL,
	`type` text NOT NULL,
	`genre` text,
	`language` text DEFAULT ('en'),
	`upc` text,
	`cover` text,
	`number_of_tracks` int DEFAULT 1,
	`is_featured` boolean NOT NULL DEFAULT false,
	`status` text NOT NULL DEFAULT ('new'),
	`flag_type` text,
	`flag_reason` text,
	`flagged_at` timestamp,
	`flagged_by` text,
	`approved_by` text,
	`approved_at` timestamp,
	`created_by` text NOT NULL,
	`managed_by` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `songs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` varchar(36) NOT NULL,
	`song_id` varchar(36) NOT NULL,
	`track_number` int,
	`isrc` text,
	`mp3` text NOT NULL,
	`explicit` text DEFAULT ('no'),
	`lyrics` text,
	`lead_vocal` text,
	`featured` text,
	`producer` text,
	`writer` text,
	`duration` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` int NOT NULL,
	`status` text NOT NULL DEFAULT ('loading'),
	`path` text,
	`url` text,
	`checksum` text,
	`chunk_size` int DEFAULT 1048576,
	`total_chunks` int,
	`uploaded_chunks` int DEFAULT 0,
	`progress` int DEFAULT 0,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`username` text,
	`firstname` text,
	`lastname` text,
	`bio` text,
	`platform` text DEFAULT ('web'),
	`socials` json,
	`preferences` json,
	`metadata` json,
	`selected_artist_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `user_profiles_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD CONSTRAINT `artist_profiles_artist_id_artists_id_fk` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD CONSTRAINT `artist_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_verification` ADD CONSTRAINT `user_verification_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_verification` ADD CONSTRAINT `user_verification_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_alerts` ADD CONSTRAINT `admin_alerts_matched_by_users_id_fk` FOREIGN KEY (`matched_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_alerts` ADD CONSTRAINT `admin_alerts_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_alerts` ADD CONSTRAINT `admin_alerts_resolved_by_users_id_fk` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_tasks` ADD CONSTRAINT `admin_tasks_assigned_to_users_id_fk` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_tasks` ADD CONSTRAINT `admin_tasks_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_tasks` ADD CONSTRAINT `admin_tasks_artist_id_users_id_fk` FOREIGN KEY (`artist_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_tasks` ADD CONSTRAINT `admin_tasks_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_assigned_to_users_id_fk` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artists` ADD CONSTRAINT `artists_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_song_id_songs_id_fk` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_track_id_tracks_id_fk` FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_artist_id_users_id_fk` FOREIGN KEY (`artist_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_manager_id_users_id_fk` FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_matched_by_users_id_fk` FOREIGN KEY (`matched_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_artist_id_users_id_fk` FOREIGN KEY (`artist_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_flagged_by_users_id_fk` FOREIGN KEY (`flagged_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_managed_by_users_id_fk` FOREIGN KEY (`managed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tracks` ADD CONSTRAINT `tracks_song_id_songs_id_fk` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `artist_profiles_artist_idx` ON `artist_profiles` (`artist_id`);--> statement-breakpoint
CREATE INDEX `artist_profiles_public_idx` ON `artist_profiles` (`is_public`);--> statement-breakpoint
CREATE INDEX `artist_profiles_featured_idx` ON `artist_profiles` (`is_featured`);--> statement-breakpoint
CREATE INDEX `admin_alerts_status_idx` ON `admin_alerts` (`status`);--> statement-breakpoint
CREATE INDEX `admin_alerts_type_idx` ON `admin_alerts` (`type`);--> statement-breakpoint
CREATE INDEX `admin_tasks_assigned_idx` ON `admin_tasks` (`assigned_to`);--> statement-breakpoint
CREATE INDEX `admin_tasks_status_idx` ON `admin_tasks` (`status`);--> statement-breakpoint
CREATE INDEX `admin_tasks_priority_idx` ON `admin_tasks` (`priority`);--> statement-breakpoint
CREATE INDEX `api_keys_user_idx` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE INDEX `api_keys_key_idx` ON `api_keys` (`key`);--> statement-breakpoint
CREATE INDEX `artists_user_idx` ON `artists` (`user_id`);--> statement-breakpoint
CREATE INDEX `artists_slug_idx` ON `artists` (`slug`);--> statement-breakpoint
CREATE INDEX `artists_name_idx` ON `artists` (`artist_name`);--> statement-breakpoint
CREATE INDEX `royalties_period_idx` ON `royalties` (`period`);--> statement-breakpoint
CREATE INDEX `royalties_artist_idx` ON `royalties` (`artist_id`);--> statement-breakpoint
CREATE INDEX `royalties_status_idx` ON `royalties` (`payment_status`);--> statement-breakpoint
CREATE INDEX `royalties_upc_idx` ON `royalties` (`upc`);--> statement-breakpoint
CREATE INDEX `royalties_isrc_idx` ON `royalties` (`isrc`);--> statement-breakpoint
CREATE INDEX `songs_artist_idx` ON `songs` (`artist_id`);--> statement-breakpoint
CREATE INDEX `songs_status_idx` ON `songs` (`status`);--> statement-breakpoint
CREATE INDEX `songs_type_idx` ON `songs` (`type`);--> statement-breakpoint
CREATE INDEX `songs_featured_idx` ON `songs` (`is_featured`);--> statement-breakpoint
CREATE INDEX `tracks_song_idx` ON `tracks` (`song_id`);--> statement-breakpoint
CREATE INDEX `tracks_isrc_idx` ON `tracks` (`isrc`);--> statement-breakpoint
CREATE INDEX `tracks_track_number_idx` ON `tracks` (`track_number`);--> statement-breakpoint
CREATE INDEX `uploads_user_idx` ON `uploads` (`user_id`);--> statement-breakpoint
CREATE INDEX `uploads_status_idx` ON `uploads` (`status`);--> statement-breakpoint
CREATE INDEX `user_profiles_username_idx` ON `user_profiles` (`username`);
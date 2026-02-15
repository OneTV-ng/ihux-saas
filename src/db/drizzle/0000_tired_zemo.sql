CREATE TABLE `account` (
	`id` varchar(100) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_alerts` (
	`id` varchar(100) NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`entity_type` varchar(50),
	`entity_id` varchar(36),
	`status` varchar(32) DEFAULT 'open',
	`severity` varchar(20) DEFAULT 'info',
	`matched_by` varchar(100),
	`approved_by` varchar(100),
	`resolved_by` varchar(100),
	`resolved_at` timestamp,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_tasks` (
	`id` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` varchar(20) DEFAULT 'medium',
	`status` varchar(32) NOT NULL DEFAULT 'todo',
	`assigned_to` varchar(100),
	`created_by` varchar(100) NOT NULL,
	`due_date` timestamp,
	`completed_at` timestamp,
	`metadata` json,
	`artist_id` varchar(100),
	`user_id` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin` (
	`id` varchar(100) NOT NULL,
	`user_id` varchar(100),
	`to` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`status` varchar(50) NOT NULL,
	`error` text,
	`sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_profiles` (
	`id` varchar(100) NOT NULL,
	`artist_id` varchar(100) NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`picture` text,
	`thumbnails` json,
	`gallery` json,
	`media_platform` json,
	`social_media` json,
	`fan_news` json,
	`press` json,
	`team` json,
	`producer` varchar(255),
	`songwriter` varchar(255),
	`studio` varchar(255),
	`record_label` varchar(255),
	`genre` varchar(100),
	`sub_genre` varchar(100),
	`country` varchar(100),
	`city` varchar(100),
	`is_public` boolean NOT NULL DEFAULT true,
	`is_verified` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
	`total_songs` int NOT NULL DEFAULT 0,
	`total_plays` int NOT NULL DEFAULT 0,
	`total_followers` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` varchar(100) NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`artist_name` varchar(255) NOT NULL,
	`display_name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`bio` text,
	`city` varchar(100),
	`country` varchar(100),
	`birthday` timestamp,
	`gender` varchar(50),
	`genre` varchar(100),
	`record_label` varchar(255),
	`contact` json,
	`legal_id` varchar(255),
	`contract` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artists_id` PRIMARY KEY(`id`),
	CONSTRAINT `artists_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `artists_name_unique` UNIQUE(`artist_name`)
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` varchar(100) NOT NULL,
	`user_id` varchar(100),
	`to` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`status` varchar(50) NOT NULL,
	`error` text,
	`sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL DEFAULT '',
	`user_id` varchar(100) NOT NULL,
	`artist_id` varchar(100) NOT NULL,
	`artist_name` varchar(255) NOT NULL DEFAULT '',
	`type` varchar(50) NOT NULL,
	`genre` varchar(100) DEFAULT 'Pop',
	`release_date` timestamp DEFAULT (now()),
	`producer` text,
	`writer` text,
	`record_label` varchar(255),
	`featured` text,
	`language` varchar(50) DEFAULT 'English',
	`upc` varchar(50),
	`cover` text,
	`number_of_tracks` int DEFAULT 0,
	`is_featured` boolean NOT NULL DEFAULT false,
	`plays` int DEFAULT 0,
	`status` varchar(32) NOT NULL DEFAULT 'new',
	`duration` int,
	`flag_type` varchar(32),
	`flag_reason` text,
	`flagged_at` timestamp,
	`flagged_by` varchar(100),
	`approved_by` varchar(100),
	`approved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `songs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` varchar(100) NOT NULL,
	`song_id` varchar(100) NOT NULL,
	`track_number` int DEFAULT 1,
	`title` varchar(255) NOT NULL,
	`isrc` varchar(32),
	`mp3` text NOT NULL,
	`explicit` varchar(10) DEFAULT 'no',
	`lyrics` text,
	`lead_vocal` varchar(255),
	`featured` text,
	`producer` text,
	`writer` text,
	`duration` int DEFAULT 0,
	`links` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` varchar(100) NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`username` varchar(255),
	`firstname` varchar(100),
	`lastname` varchar(100),
	`bio` text,
	`platform` varchar(50) DEFAULT 'web',
	`socials` json,
	`preferences` json,
	`metadata` json,
	`selected_artist_id` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(100) NOT NULL,
	`username` varchar(255) DEFAULT '',
	`email` varchar(255) NOT NULL,
	`name` varchar(255),
	`email_verified` boolean NOT NULL DEFAULT false,
	`password_hash` text NOT NULL DEFAULT (''),
	`image` text,
	`thumbnail` text,
	`profile_picture` text,
	`header_background` text,
	`phone` varchar(20),
	`whatsapp` varchar(20),
	`date_of_birth` varchar(10),
	`address` text,
	`record_label` varchar(255),
	`social_media` json,
	`bank_details` json,
	`settings` json,
	`role` varchar(50) NOT NULL DEFAULT 'user',
	`banned` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `royalties` (
	`id` varchar(100) NOT NULL,
	`period` varchar(32) NOT NULL,
	`period_type` varchar(20) NOT NULL,
	`upc` varchar(50),
	`isrc` varchar(32),
	`track_name` varchar(255) NOT NULL,
	`song_title` varchar(255) NOT NULL,
	`artist_name` varchar(255) NOT NULL,
	`record_label` varchar(255),
	`gross_amount_usd` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`deductions_percent` decimal(5,2) DEFAULT '0.00',
	`deductions_usd` decimal(12,4) DEFAULT '0.0000',
	`net_amount_usd` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`user_id` varchar(100) NOT NULL,
	`song_id` varchar(100),
	`track_id` varchar(36),
	`artist_id` varchar(100),
	`manager_id` varchar(36),
	`match_status` varchar(32) DEFAULT 'pending',
	`matched_by` varchar(36),
	`matched_at` timestamp,
	`approved_by` varchar(100),
	`approved_at` timestamp,
	`paid_at` timestamp,
	`payment_status` varchar(32) DEFAULT 'unpaid',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `royalties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` varchar(100) NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`filename` varchar(255) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`size` bigint NOT NULL,
	`path` text,
	`url` text,
	`checksum` varchar(64),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`progress` int DEFAULT 0,
	`chunk_size` int,
	`total_chunks` int,
	`uploaded_chunks` int DEFAULT 0,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completed_at` timestamp,
	CONSTRAINT `uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(100) NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'unread',
	`read` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(100) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` text,
	`impersonated_at` timestamp,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user_verification` (
	`id` varchar(100) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`status` text NOT NULL,
	`submitted_at` timestamp,
	`processed_at` timestamp,
	`verified_at` timestamp,
	`remark` text,
	`rejection_reason` text,
	`flag_reason` text,
	`reviewed_by` varchar(36),
	`government_id_url` text,
	`signature_url` text,
	`completion_percentage` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `user_verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(100) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp,
	`updated_at` timestamp,
	`type` text,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin_alerts` ADD CONSTRAINT `admin_alerts_matched_by_users_id_fk` FOREIGN KEY (`matched_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_alerts` ADD CONSTRAINT `admin_alerts_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_alerts` ADD CONSTRAINT `admin_alerts_resolved_by_users_id_fk` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_tasks` ADD CONSTRAINT `admin_tasks_assigned_to_users_id_fk` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_tasks` ADD CONSTRAINT `admin_tasks_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_tasks` ADD CONSTRAINT `admin_tasks_artist_id_artists_id_fk` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_tasks` ADD CONSTRAINT `admin_tasks_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD CONSTRAINT `artist_profiles_artist_id_artists_id_fk` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD CONSTRAINT `artist_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artists` ADD CONSTRAINT `artists_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_artist_id_artists_id_fk` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_flagged_by_users_id_fk` FOREIGN KEY (`flagged_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tracks` ADD CONSTRAINT `tracks_song_id_songs_id_fk` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_song_id_songs_id_fk` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_track_id_tracks_id_fk` FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_manager_id_users_id_fk` FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_matched_by_users_id_fk` FOREIGN KEY (`matched_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `royalties` ADD CONSTRAINT `royalties_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_verification` ADD CONSTRAINT `user_verification_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_verification` ADD CONSTRAINT `user_verification_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `admin_alerts_type_idx` ON `admin_alerts` (`type`);--> statement-breakpoint
CREATE INDEX `admin_alerts_status_idx` ON `admin_alerts` (`status`);--> statement-breakpoint
CREATE INDEX `admin_alerts_entity_idx` ON `admin_alerts` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `admin_tasks_status_idx` ON `admin_tasks` (`status`);--> statement-breakpoint
CREATE INDEX `admin_tasks_assignee_idx` ON `admin_tasks` (`assigned_to`);--> statement-breakpoint
CREATE INDEX `admin_tasks_priority_idx` ON `admin_tasks` (`priority`);--> statement-breakpoint
CREATE INDEX `email_logs_user_idx` ON `admin` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_logs_status_idx` ON `admin` (`status`);--> statement-breakpoint
CREATE INDEX `email_logs_to_idx` ON `admin` (`to`);--> statement-breakpoint
CREATE INDEX `artist_profiles_artist_idx` ON `artist_profiles` (`artist_id`);--> statement-breakpoint
CREATE INDEX `artist_profiles_public_idx` ON `artist_profiles` (`is_public`);--> statement-breakpoint
CREATE INDEX `artist_profiles_featured_idx` ON `artist_profiles` (`is_featured`);--> statement-breakpoint
CREATE INDEX `artists_user_idx` ON `artists` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_logs_user_idx` ON `email_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_logs_status_idx` ON `email_logs` (`status`);--> statement-breakpoint
CREATE INDEX `email_logs_to_idx` ON `email_logs` (`to`);--> statement-breakpoint
CREATE INDEX `songs_user_idx` ON `songs` (`user_id`);--> statement-breakpoint
CREATE INDEX `songs_artist_idx` ON `songs` (`artist_id`);--> statement-breakpoint
CREATE INDEX `songs_status_idx` ON `songs` (`status`);--> statement-breakpoint
CREATE INDEX `songs_type_idx` ON `songs` (`type`);--> statement-breakpoint
CREATE INDEX `songs_featured_idx` ON `songs` (`is_featured`);--> statement-breakpoint
CREATE INDEX `tracks_song_idx` ON `tracks` (`song_id`);--> statement-breakpoint
CREATE INDEX `tracks_isrc_idx` ON `tracks` (`isrc`);--> statement-breakpoint
CREATE INDEX `user_profiles_username_idx` ON `user_profiles` (`username`);--> statement-breakpoint
CREATE INDEX `royalty_user_period_idx` ON `royalties` (`user_id`,`period`);--> statement-breakpoint
CREATE INDEX `royalty_isrc_idx` ON `royalties` (`isrc`);--> statement-breakpoint
CREATE INDEX `royalty_song_idx` ON `royalties` (`song_id`);--> statement-breakpoint
CREATE INDEX `royalty_payment_status_idx` ON `royalties` (`payment_status`);--> statement-breakpoint
CREATE INDEX `uploads_user_idx` ON `uploads` (`user_id`);--> statement-breakpoint
CREATE INDEX `uploads_status_idx` ON `uploads` (`status`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_status_idx` ON `notifications` (`status`);--> statement-breakpoint
CREATE INDEX `notifications_user_read_idx` ON `notifications` (`user_id`,`read`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_token_idx` ON `sessions` (`token`);
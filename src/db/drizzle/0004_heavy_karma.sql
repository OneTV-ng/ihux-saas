CREATE TABLE `product_code_sequences` (
	`year` int NOT NULL,
	`sequence` int NOT NULL DEFAULT 2001,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_code_sequences_year` PRIMARY KEY(`year`)
);
--> statement-breakpoint
CREATE TABLE `publishing_records` (
	`id` varchar(100) NOT NULL,
	`song_id` varchar(100) NOT NULL,
	`product_code` varchar(50) NOT NULL,
	`published_by` varchar(100) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'processing',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publishing_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `publishing_records_product_code_unique` UNIQUE(`product_code`)
);
--> statement-breakpoint
ALTER TABLE `songs` ADD `product_code` varchar(50);--> statement-breakpoint
ALTER TABLE `songs` ADD `published_by` varchar(100);--> statement-breakpoint
ALTER TABLE `songs` ADD `published_at` timestamp;--> statement-breakpoint
ALTER TABLE `songs` ADD `processing_started_at` timestamp;--> statement-breakpoint
ALTER TABLE `songs` ADD CONSTRAINT `songs_product_code_unique` UNIQUE(`product_code`);--> statement-breakpoint
CREATE INDEX `pub_song_idx` ON `publishing_records` (`song_id`);--> statement-breakpoint
CREATE INDEX `pub_code_idx` ON `publishing_records` (`product_code`);--> statement-breakpoint
CREATE INDEX `pub_by_idx` ON `publishing_records` (`published_by`);--> statement-breakpoint
CREATE INDEX `pub_status_idx` ON `publishing_records` (`status`);--> statement-breakpoint
CREATE INDEX `songs_product_code_idx` ON `songs` (`product_code`);--> statement-breakpoint
CREATE INDEX `songs_published_by_idx` ON `songs` (`published_by`);
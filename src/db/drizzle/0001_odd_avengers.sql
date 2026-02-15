ALTER TABLE `admin_alerts` MODIFY COLUMN `entity_id` varchar(100);--> statement-breakpoint
ALTER TABLE `admin_alerts` MODIFY COLUMN `matched_by` varchar(100);--> statement-breakpoint
ALTER TABLE `admin_alerts` MODIFY COLUMN `resolved_by` varchar(100);--> statement-breakpoint
ALTER TABLE `songs` MODIFY COLUMN `type` varchar(50) NOT NULL DEFAULT 'single';--> statement-breakpoint
ALTER TABLE `royalties` MODIFY COLUMN `track_id` varchar(100);--> statement-breakpoint
ALTER TABLE `royalties` MODIFY COLUMN `manager_id` varchar(100);--> statement-breakpoint
ALTER TABLE `royalties` MODIFY COLUMN `matched_by` varchar(100);--> statement-breakpoint
ALTER TABLE `user_verification` MODIFY COLUMN `user_id` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `user_verification` MODIFY COLUMN `reviewed_by` varchar(100);
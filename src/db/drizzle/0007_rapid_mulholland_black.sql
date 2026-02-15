ALTER TABLE `sessions` RENAME COLUMN `session_token` TO `token`;--> statement-breakpoint
ALTER TABLE `sessions` DROP INDEX `sessions_session_token_unique`;--> statement-breakpoint
DROP INDEX `sessions_token_idx` ON `sessions`;--> statement-breakpoint
ALTER TABLE `sessions` ADD `ip_address` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `user_agent` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `impersonated_by` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `impersonated_at` timestamp;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_token_unique` UNIQUE(`token`);--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `sessions_token_idx` ON `sessions` (`token`);
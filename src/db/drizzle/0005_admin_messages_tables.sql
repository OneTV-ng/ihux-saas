CREATE TABLE `admin_messages` (
	`id` varchar(100) NOT NULL,
	`sender_id` varchar(100) NOT NULL,
	`recipient_type` varchar(20) NOT NULL,
	`recipient_filter` json,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`sent_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message_recipients` (
	`id` varchar(100) NOT NULL,
	`message_id` varchar(100) NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `admin_msg_sender_idx` ON `admin_messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `admin_msg_sent_idx` ON `admin_messages` (`sent_at`);--> statement-breakpoint
CREATE INDEX `msg_recipient_message_idx` ON `message_recipients` (`message_id`);--> statement-breakpoint
CREATE INDEX `msg_recipient_user_idx` ON `message_recipients` (`user_id`);--> statement-breakpoint
CREATE INDEX `msg_recipient_read_idx` ON `message_recipients` (`read`);
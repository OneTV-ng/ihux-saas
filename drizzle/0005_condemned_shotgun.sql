CREATE TABLE "user_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL,
	"submitted_at" timestamp,
	"processed_at" timestamp,
	"verified_at" timestamp,
	"remark" text,
	"rejection_reason" text,
	"flag_reason" text,
	"reviewed_by" text,
	"government_id_url" text,
	"signature_url" text,
	"completion_percentage" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "banned" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "thumbnail" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "profile_picture" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "header_background" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "settings" json;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "api_class" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_verification" ADD CONSTRAINT "user_verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verification" ADD CONSTRAINT "user_verification_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
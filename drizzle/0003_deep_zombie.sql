CREATE TABLE "admin_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"severity" text DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'pending' NOT NULL,
	"assigned_to" text,
	"created_by" text NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"api_class" integer DEFAULT 5 NOT NULL,
	"rate_limit" integer DEFAULT 60 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "royalties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period" text NOT NULL,
	"period_type" text NOT NULL,
	"upc" text,
	"isrc" text,
	"track_name" text NOT NULL,
	"song_title" text NOT NULL,
	"artist_name" text NOT NULL,
	"record_label" text,
	"gross_amount_usd" numeric(10, 2) NOT NULL,
	"deductions_percent" numeric(5, 2) DEFAULT '0',
	"deductions_usd" numeric(10, 2) DEFAULT '0',
	"net_amount_usd" numeric(10, 2) NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"song_id" uuid,
	"track_id" uuid,
	"artist_id" text,
	"user_id" text,
	"manager_id" text,
	"match_status" text DEFAULT 'unmatched',
	"matched_by" text,
	"matched_at" timestamp,
	"approved_by" text,
	"approved_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"artist_id" text NOT NULL,
	"artist_name" text NOT NULL,
	"type" text NOT NULL,
	"genre" text,
	"language" text DEFAULT 'en',
	"upc" text,
	"cover" text,
	"number_of_tracks" integer DEFAULT 1,
	"status" text DEFAULT 'new' NOT NULL,
	"flag_type" text,
	"flag_reason" text,
	"flagged_at" timestamp,
	"flagged_by" text,
	"approved_by" text,
	"approved_at" timestamp,
	"created_by" text NOT NULL,
	"managed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"song_id" uuid NOT NULL,
	"track_number" integer NOT NULL,
	"title" text NOT NULL,
	"isrc" text,
	"mp3" text NOT NULL,
	"explicit" text DEFAULT 'no',
	"lyrics" text,
	"lead_vocal" text,
	"producer" text,
	"writer" text,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"status" text DEFAULT 'loading' NOT NULL,
	"path" text,
	"url" text,
	"checksum" text,
	"chunk_size" integer DEFAULT 1048576,
	"total_chunks" integer,
	"uploaded_chunks" integer DEFAULT 0,
	"progress" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"username" text,
	"firstname" text,
	"lastname" text,
	"bio" text,
	"language" text DEFAULT 'en',
	"platform" text DEFAULT 'web',
	"socials" jsonb,
	"preferences" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "admin_alerts" ADD CONSTRAINT "admin_alerts_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_tasks" ADD CONSTRAINT "admin_tasks_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_tasks" ADD CONSTRAINT "admin_tasks_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "royalties" ADD CONSTRAINT "royalties_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "royalties" ADD CONSTRAINT "royalties_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "royalties" ADD CONSTRAINT "royalties_artist_id_user_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "royalties" ADD CONSTRAINT "royalties_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "royalties" ADD CONSTRAINT "royalties_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "royalties" ADD CONSTRAINT "royalties_matched_by_user_id_fk" FOREIGN KEY ("matched_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "royalties" ADD CONSTRAINT "royalties_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_artist_id_user_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_flagged_by_user_id_fk" FOREIGN KEY ("flagged_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_managed_by_user_id_fk" FOREIGN KEY ("managed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_alerts_status_idx" ON "admin_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "admin_alerts_type_idx" ON "admin_alerts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "admin_alerts_severity_idx" ON "admin_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "admin_tasks_assigned_idx" ON "admin_tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "admin_tasks_status_idx" ON "admin_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "admin_tasks_priority_idx" ON "admin_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "api_keys_user_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_key_idx" ON "api_keys" USING btree ("key");--> statement-breakpoint
CREATE INDEX "royalties_period_idx" ON "royalties" USING btree ("period");--> statement-breakpoint
CREATE INDEX "royalties_artist_idx" ON "royalties" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "royalties_status_idx" ON "royalties" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "royalties_upc_idx" ON "royalties" USING btree ("upc");--> statement-breakpoint
CREATE INDEX "royalties_isrc_idx" ON "royalties" USING btree ("isrc");--> statement-breakpoint
CREATE INDEX "songs_artist_idx" ON "songs" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "songs_status_idx" ON "songs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "songs_type_idx" ON "songs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tracks_song_idx" ON "tracks" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX "tracks_isrc_idx" ON "tracks" USING btree ("isrc");--> statement-breakpoint
CREATE INDEX "uploads_user_idx" ON "uploads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "uploads_status_idx" ON "uploads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_profiles_username_idx" ON "user_profiles" USING btree ("username");
ALTER TABLE "users_table" ADD COLUMN "phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD CONSTRAINT "users_table_phone_unique" UNIQUE("phone");
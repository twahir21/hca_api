ALTER TABLE "users_table" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD CONSTRAINT "users_table_password_unique" UNIQUE("password");
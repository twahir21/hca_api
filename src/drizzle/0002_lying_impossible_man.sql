CREATE TABLE "users_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text DEFAULT 'parent' NOT NULL,
	"username" text NOT NULL,
	CONSTRAINT "users_table_username_unique" UNIQUE("username")
);

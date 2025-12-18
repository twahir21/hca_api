ALTER TABLE "user_role" DROP CONSTRAINT "pk_user_roles";--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "pk_user_role" PRIMARY KEY("role_id","user_id","school_id");--> statement-breakpoint
ALTER TABLE "school" ADD COLUMN "last_activity" timestamp DEFAULT now();
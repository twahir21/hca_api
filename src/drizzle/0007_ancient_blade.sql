ALTER TABLE "user_role" DROP CONSTRAINT "pk_user_role";
--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "pk_user_role" PRIMARY KEY("role_id","user_id");
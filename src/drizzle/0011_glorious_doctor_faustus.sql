DROP INDEX "idx_school_user_role_only";--> statement-breakpoint
DROP INDEX "idx_school_user_role";--> statement-breakpoint
ALTER TABLE "user_role" DROP CONSTRAINT "pk_user_role";--> statement-breakpoint
CREATE INDEX "idx_user_role_user_school" ON "user_role" USING btree ("user_id","school_id");--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "uniq_user_role_scope" UNIQUE("user_id","role_id","school_id");
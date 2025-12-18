ALTER TABLE "user_role" ALTER COLUMN "school_id" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_school_user_role_only" ON "user_role" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_school_user_role" ON "user_role" USING btree ("user_id","school_id");--> statement-breakpoint
ALTER TABLE "user_role" DROP CONSTRAINT "pk_user_role";
--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "pk_user_role" PRIMARY KEY("role_id","user_id","school_id");
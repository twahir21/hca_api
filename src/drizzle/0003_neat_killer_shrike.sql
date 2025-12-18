ALTER TABLE "roles" DROP CONSTRAINT "roles_school_id_school_id_fk";
--> statement-breakpoint
DROP INDEX "idx_roles_school";--> statement-breakpoint
ALTER TABLE "roles" DROP COLUMN "school_id";
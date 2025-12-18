ALTER TABLE "classes" DROP CONSTRAINT "classes_level_id_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE set null ON UPDATE no action;
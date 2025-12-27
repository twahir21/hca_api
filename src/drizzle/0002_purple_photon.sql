ALTER TYPE "public"."gender" ADD VALUE 'prefer not say';--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "gender" SET DEFAULT 'prefer not say';--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "gender" SET NOT NULL;
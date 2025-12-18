ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_phone_email_unique";--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_email_unique" UNIQUE("email");
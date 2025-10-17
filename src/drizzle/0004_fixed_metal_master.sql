ALTER TABLE "recent_messages" DROP CONSTRAINT "recent_messages_contact_id_contacts_table_id_fk";
--> statement-breakpoint
ALTER TABLE "recent_messages" DROP COLUMN "user_role";--> statement-breakpoint
ALTER TABLE "recent_messages" DROP COLUMN "contact_id";
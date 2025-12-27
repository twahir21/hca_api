ALTER TABLE "contacts_table" DROP CONSTRAINT "contacts_table_phone_school_id_unique";--> statement-breakpoint
ALTER TABLE "contacts_table" DROP CONSTRAINT "contacts_table_school_id_school_id_fk";
--> statement-breakpoint
DROP INDEX "contact_indx";--> statement-breakpoint
ALTER TABLE "contacts_table" DROP COLUMN "school_id";
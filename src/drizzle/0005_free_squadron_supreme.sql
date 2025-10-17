ALTER TABLE "recent_messages" RENAME COLUMN "group_id" TO "group_name";--> statement-breakpoint
ALTER TABLE "recent_messages" DROP CONSTRAINT "recent_messages_group_id_groups_table_id_fk";

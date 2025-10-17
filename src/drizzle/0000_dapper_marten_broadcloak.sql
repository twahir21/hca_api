CREATE TABLE "contacts_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contacts_table_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "group_contacts_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "groups_table_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "recent_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"group_id" uuid,
	"contact_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "group_contacts_table" ADD CONSTRAINT "group_contacts_table_group_id_groups_table_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_contacts_table" ADD CONSTRAINT "group_contacts_table_contact_id_contacts_table_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recent_messages" ADD CONSTRAINT "recent_messages_group_id_groups_table_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recent_messages" ADD CONSTRAINT "recent_messages_contact_id_contacts_table_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts_table"("id") ON DELETE cascade ON UPDATE no action;
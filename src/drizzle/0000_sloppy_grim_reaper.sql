CREATE TABLE "classes_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"level" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "classes_table_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "subjects_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_table_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "teacher_subject_class_table" (
	"teacher_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	CONSTRAINT "teacher_subject_class_table_teacher_id_subject_id_class_id_pk" PRIMARY KEY("teacher_id","subject_id","class_id")
);
--> statement-breakpoint
CREATE TABLE "teachers_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "teachers_table_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
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
	"group_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sent_sms_count" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"count" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"phone" text NOT NULL,
	CONSTRAINT "users_table_username_unique" UNIQUE("username"),
	CONSTRAINT "users_table_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "teacher_subject_class_table" ADD CONSTRAINT "teacher_subject_class_table_teacher_id_teachers_table_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_class_table" ADD CONSTRAINT "teacher_subject_class_table_subject_id_subjects_table_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_class_table" ADD CONSTRAINT "teacher_subject_class_table_class_id_classes_table_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_contacts_table" ADD CONSTRAINT "group_contacts_table_group_id_groups_table_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_contacts_table" ADD CONSTRAINT "group_contacts_table_contact_id_contacts_table_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_group_contact" ON "group_contacts_table" USING btree ("group_id","contact_id");
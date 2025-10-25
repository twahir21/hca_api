CREATE TABLE "teacher_subjects_table" (
	"teacher_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	CONSTRAINT "teacher_subjects_table_teacher_id_subject_id_pk" PRIMARY KEY("teacher_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "teachers_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"class" text NOT NULL,
	CONSTRAINT "teachers_table_name_unique" UNIQUE("name"),
	CONSTRAINT "teachers_table_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "teacher_subjects_table" ADD CONSTRAINT "teacher_subjects_table_teacher_id_teachers_table_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects_table" ADD CONSTRAINT "teacher_subjects_table_subject_id_subjects_table_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects_table"("id") ON DELETE no action ON UPDATE no action;
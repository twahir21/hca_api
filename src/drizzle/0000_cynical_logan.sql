CREATE TYPE "public"."status" AS ENUM('present', 'absent', 'permitted');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."period" AS ENUM('pre-morning', 'morning', 'afternoon', 'evening', 'night');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super-admin', 'school-admin', 'principal', 'bursar', 'dorm-master', 'matron', 'patron', 'transport-officer', 'driver', 'store-keeper', 'class-teacher', 'academic-master', 'displinary-officer', 'HOD', 'ict-officer', 'librarian', 'meal-officer', 'nurse', 'parent', 'student', 'registrar', 'teacher', 'sports-master', 'lab-technician', 'cleaning-officer', 'election-officer', 'debate-manager', 'trips-officer', 'maintainance-officer', 'counselor');--> statement-breakpoint
CREATE TYPE "public"."school_status" AS ENUM('approved', 'inactive', 'suspended', 'expired', 'pending');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('Starter', 'Growth', 'Enterprice');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended', 'pending');--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"school_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"level_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "classes_name_school_id_unique" UNIQUE("name","school_id")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(20),
	"school_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "subjects_name_school_id_unique" UNIQUE("name","school_id")
);
--> statement-breakpoint
CREATE TABLE "levels_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" "level" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subject_class_levels" (
	"subject_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	CONSTRAINT "pk_subject_class" PRIMARY KEY("subject_id","class_id")
);
--> statement-breakpoint
CREATE TABLE "subject_levels" (
	"subject_id" uuid NOT NULL,
	"level_id" uuid NOT NULL,
	CONSTRAINT "subject_levels_subject_id_level_id_pk" PRIMARY KEY("subject_id","level_id")
);
--> statement-breakpoint
CREATE TABLE "teacher_subject_class" (
	"teacher_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"academic_year_id" uuid,
	CONSTRAINT "pk_teacher_subject_class" PRIMARY KEY("school_id","subject_id","class_id","teacher_id")
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "teachers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "academic_year" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(20) NOT NULL,
	"term_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"school_id" uuid NOT NULL,
	"is_current" boolean DEFAULT false,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "academic_year_school_id_name_unique" UNIQUE("school_id","name"),
	CONSTRAINT "check_dates" CHECK ("end_date" > "start_date")
);
--> statement-breakpoint
CREATE TABLE "assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"subject_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"due_date" timestamp,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"school_id" uuid NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "assignment_school_id_title_unique" UNIQUE("school_id","title")
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"subject_id" uuid,
	"date" timestamp DEFAULT now() NOT NULL,
	"period" "period" DEFAULT 'morning',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" "status" DEFAULT 'present' NOT NULL,
	"description" text,
	"teacher_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"academic_year_id" uuid,
	"term_id" uuid,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"ip_address" text,
	"device_info" text,
	"description" text,
	"action_type" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"school_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_teacher_year" (
	"teacher_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	CONSTRAINT "pk_class_teacher_year" PRIMARY KEY("teacher_id","class_id","academic_year_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "dormitories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"gender" "gender" NOT NULL,
	"capacity" integer,
	"matron_id" uuid,
	"patron_id" uuid,
	"school_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "dormitories_school_id_name_unique" UNIQUE("school_id","name"),
	CONSTRAINT "manager_xor_check" CHECK (("matron_id" IS NOT NULL AND "patron_id" IS NULL) OR ("matron_id" IS NULL AND "patron_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "exam_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"marks" integer NOT NULL,
	"grade" varchar(5),
	"school_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "exam_results_exam_id_school_id_student_id_unique" UNIQUE("exam_id","school_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "exam_subject_class" (
	"exam_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	CONSTRAINT "pkexam_subject_class" PRIMARY KEY("exam_id","subject_id","class_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"term_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"teacher_id" uuid,
	"total_marks" integer DEFAULT 100,
	"academic_year_id" uuid,
	"date" timestamp NOT NULL,
	"school_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "exams_school_id_name_class_id_unique" UNIQUE("school_id","name","class_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"objectives" text NOT NULL,
	"is_approved" boolean DEFAULT false,
	"approval_date" timestamp,
	"school_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "lesson_plan_school_id_topic_unique" UNIQUE("school_id","topic")
);
--> statement-breakpoint
CREATE TABLE "parent_schools" (
	"parent_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	CONSTRAINT "pk_parent_school" PRIMARY KEY("parent_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "parents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"address" text NOT NULL,
	"profile_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role" NOT NULL,
	"description" text,
	"rank" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"address" text NOT NULL,
	"bulk_sms_name" text,
	"phone" varchar(20) NOT NULL,
	"subscription_plan" "subscription_plan" DEFAULT 'Enterprice' NOT NULL,
	"school_status" "school_status" DEFAULT 'pending' NOT NULL,
	"email" text NOT NULL,
	"expired_at" timestamp,
	"last_activity" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "school_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "student_dorm_year" (
	"student_id" uuid NOT NULL,
	"dorm_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"reason" text,
	CONSTRAINT "pk_student_dorm_year" PRIMARY KEY("student_id","dorm_id","academic_year_id")
);
--> statement-breakpoint
CREATE TABLE "student_exam_subject" (
	"exam_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"marks" integer NOT NULL,
	"grade" varchar(5),
	"school_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_std_exam_subj" PRIMARY KEY("exam_id","subject_id","student_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "student_parents" (
	"student_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"relation" varchar(20),
	CONSTRAINT "pk_student_parent" PRIMARY KEY("parent_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "student_subject_class" (
	"student_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"academic_year_id" uuid,
	"term_id" uuid,
	"enrolled_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_std_subj_class" PRIMARY KEY("student_id","subject_id","class_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "students_class_year" (
	"student_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"is_current" boolean DEFAULT true,
	CONSTRAINT "pk_students_class_year" PRIMARY KEY("class_id","student_id","academic_year_id")
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(50) NOT NULL,
	"admission_no" text NOT NULL,
	"gender" "gender" NOT NULL,
	"dob" timestamp NOT NULL,
	"address" text,
	"school_id" uuid NOT NULL,
	"dorm_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "student_admission_no_school_id_unique" UNIQUE("admission_no","school_id"),
	CONSTRAINT "check_dob" CHECK ("dob" <= now())
);
--> statement-breakpoint
CREATE TABLE "term" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term" varchar(20) NOT NULL,
	"school_id" uuid NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "term_school_id_term_unique" UNIQUE("school_id","term")
);
--> statement-breakpoint
CREATE TABLE "token_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"school_id" text NOT NULL,
	"role" "role" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"address" text,
	"gender" "gender",
	"dob" timestamp,
	"profile_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_profiles_phone_unique" UNIQUE("phone"),
	CONSTRAINT "user_profiles_email_unique" UNIQUE("email"),
	CONSTRAINT "user_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"school_id" uuid,
	CONSTRAINT "uniq_user_role_scope" UNIQUE("user_id","role_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"last_login" timestamp,
	"user_status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "contacts_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"school_id" uuid NOT NULL,
	CONSTRAINT "contacts_table_phone_school_id_unique" UNIQUE("phone","school_id")
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
	"school_id" uuid NOT NULL,
	CONSTRAINT "groups_table_school_id_name_unique" UNIQUE("school_id","name")
);
--> statement-breakpoint
CREATE TABLE "recent_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"group_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"school_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sent_sms_count" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"count" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	CONSTRAINT "sent_sms_count_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_level_id_levels_table_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels_table"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_class_levels" ADD CONSTRAINT "subject_class_levels_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_class_levels" ADD CONSTRAINT "subject_class_levels_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_levels" ADD CONSTRAINT "subject_levels_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_levels" ADD CONSTRAINT "subject_levels_level_id_levels_table_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_class" ADD CONSTRAINT "teacher_subject_class_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_class" ADD CONSTRAINT "teacher_subject_class_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_class" ADD CONSTRAINT "teacher_subject_class_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_class" ADD CONSTRAINT "teacher_subject_class_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_class" ADD CONSTRAINT "teacher_subject_class_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_year" ADD CONSTRAINT "academic_year_term_id_term_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."term"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_year" ADD CONSTRAINT "academic_year_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_year" ADD CONSTRAINT "academic_year_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_year" ADD CONSTRAINT "academic_year_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_term_id_term_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."term"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teacher_year" ADD CONSTRAINT "class_teacher_year_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teacher_year" ADD CONSTRAINT "class_teacher_year_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teacher_year" ADD CONSTRAINT "class_teacher_year_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teacher_year" ADD CONSTRAINT "class_teacher_year_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dormitories" ADD CONSTRAINT "dormitories_matron_id_teachers_id_fk" FOREIGN KEY ("matron_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dormitories" ADD CONSTRAINT "dormitories_patron_id_teachers_id_fk" FOREIGN KEY ("patron_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dormitories" ADD CONSTRAINT "dormitories_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dormitories" ADD CONSTRAINT "dormitories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dormitories" ADD CONSTRAINT "dormitories_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_subject_class" ADD CONSTRAINT "exam_subject_class_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_subject_class" ADD CONSTRAINT "exam_subject_class_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_subject_class" ADD CONSTRAINT "exam_subject_class_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_subject_class" ADD CONSTRAINT "exam_subject_class_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_term_id_term_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."term"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_schools" ADD CONSTRAINT "parent_schools_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_schools" ADD CONSTRAINT "parent_schools_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_dorm_year" ADD CONSTRAINT "student_dorm_year_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_dorm_year" ADD CONSTRAINT "student_dorm_year_dorm_id_dormitories_id_fk" FOREIGN KEY ("dorm_id") REFERENCES "public"."dormitories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_dorm_year" ADD CONSTRAINT "student_dorm_year_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_exam_subject" ADD CONSTRAINT "student_exam_subject_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_exam_subject" ADD CONSTRAINT "student_exam_subject_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_exam_subject" ADD CONSTRAINT "student_exam_subject_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_exam_subject" ADD CONSTRAINT "student_exam_subject_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subject_class" ADD CONSTRAINT "student_subject_class_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subject_class" ADD CONSTRAINT "student_subject_class_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subject_class" ADD CONSTRAINT "student_subject_class_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subject_class" ADD CONSTRAINT "student_subject_class_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subject_class" ADD CONSTRAINT "student_subject_class_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subject_class" ADD CONSTRAINT "student_subject_class_term_id_term_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."term"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students_class_year" ADD CONSTRAINT "students_class_year_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students_class_year" ADD CONSTRAINT "students_class_year_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students_class_year" ADD CONSTRAINT "students_class_year_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_dorm_id_dormitories_id_fk" FOREIGN KEY ("dorm_id") REFERENCES "public"."dormitories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "term" ADD CONSTRAINT "term_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "term" ADD CONSTRAINT "term_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "term" ADD CONSTRAINT "term_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts_table" ADD CONSTRAINT "contacts_table_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_contacts_table" ADD CONSTRAINT "group_contacts_table_group_id_groups_table_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_contacts_table" ADD CONSTRAINT "group_contacts_table_contact_id_contacts_table_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups_table" ADD CONSTRAINT "groups_table_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recent_messages" ADD CONSTRAINT "recent_messages_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sent_sms_count" ADD CONSTRAINT "sent_sms_count_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sent_sms_count" ADD CONSTRAINT "sent_sms_count_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_class_school" ON "classes" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_subj_school" ON "subjects" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_teacher_school_userId" ON "teachers" USING btree ("school_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_assignment_school" ON "assignment" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_school_class_date" ON "attendance" USING btree ("school_id","class_id","date");--> statement-breakpoint
CREATE INDEX "idx_attendace_school" ON "attendance" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "school_id_idx" ON "audit_logs" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_user" ON "audit_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_dorm_school" ON "dormitories" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_exam_student" ON "exam_results" USING btree ("exam_id","student_id");--> statement-breakpoint
CREATE INDEX "idx_exam_subj_class_school" ON "exam_subject_class" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_exam_school" ON "exams" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_school" ON "lesson_plan" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_userId" ON "parents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_code_school" ON "school" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_student_exam" ON "student_exam_subject" USING btree ("student_id","exam_id");--> statement-breakpoint
CREATE INDEX "idx_student" ON "student_parents" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_student_subject" ON "student_subject_class" USING btree ("student_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_std_subj_class_school" ON "student_subject_class" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "std_class_indx" ON "students_class_year" USING btree ("student_id","is_current");--> statement-breakpoint
CREATE INDEX "idx_std_school" ON "student" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_admission_school" ON "student" USING btree ("admission_no","school_id");--> statement-breakpoint
CREATE INDEX "idx_dorm_school_student" ON "student" USING btree ("dorm_id","school_id");--> statement-breakpoint
CREATE INDEX "idx_user_role_user_school" ON "user_role" USING btree ("user_id","school_id");--> statement-breakpoint
CREATE INDEX "idx_school_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "contact_indx" ON "contacts_table" USING btree ("school_id","phone");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_group_contact" ON "group_contacts_table" USING btree ("group_id","contact_id");--> statement-breakpoint
CREATE INDEX "group_indx" ON "groups_table" USING btree ("school_id","name");
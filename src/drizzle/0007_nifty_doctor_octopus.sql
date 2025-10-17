CREATE TABLE "sent_sms_count" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"count" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

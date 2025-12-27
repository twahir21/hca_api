ALTER TABLE "contacts_table" ADD COLUMN "school_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts_table" ADD CONSTRAINT "contacts_table_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_indx" ON "contacts_table" USING btree ("school_id","phone");--> statement-breakpoint
ALTER TABLE "contacts_table" ADD CONSTRAINT "contacts_table_phone_school_id_unique" UNIQUE("phone","school_id");
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "schools_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "status" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" varchar(255) NOT NULL,
	CONSTRAINT "status_status_unique" UNIQUE("status")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) DEFAULT null,
	"lastname" varchar(255) DEFAULT null,
	"birthdate" varchar DEFAULT null,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"url_image" varchar(255) DEFAULT null,
	"school_id" integer DEFAULT null,
	"status" integer DEFAULT null,
	"roles_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_status_status_id_fk" FOREIGN KEY ("status") REFERENCES "public"."status"("id") ON DELETE no action ON UPDATE no action;
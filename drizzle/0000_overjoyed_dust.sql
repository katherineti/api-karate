CREATE TABLE "karate_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(255) NOT NULL,
	CONSTRAINT "karate_categories_category_unique" UNIQUE("category")
);
--> statement-breakpoint
CREATE TABLE "karate_belts" (
	"id" serial PRIMARY KEY NOT NULL,
	"belt" varchar(255) NOT NULL,
	CONSTRAINT "karate_belts_belt_unique" UNIQUE("belt")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	CONSTRAINT "schools_name_unique" UNIQUE("name"),
	CONSTRAINT "schools_slug_unique" UNIQUE("slug")
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
	"document_type" varchar(1) DEFAULT null,
	"document_number" varchar(255) DEFAULT null,
	"birthdate" date DEFAULT null,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"profile_picture" varchar(255) DEFAULT null,
	"school_id" integer DEFAULT null,
	"representative_id" integer DEFAULT null,
	"status" integer DEFAULT null,
	"roles_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category" integer DEFAULT null,
	"belt" integer DEFAULT null,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "document_unique" UNIQUE("document_type","document_number")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_status_status_id_fk" FOREIGN KEY ("status") REFERENCES "public"."status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_category_karate_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."karate_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_belt_karate_belts_id_fk" FOREIGN KEY ("belt") REFERENCES "public"."karate_belts"("id") ON DELETE no action ON UPDATE no action;
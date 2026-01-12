CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"date" date NOT NULL,
	"location" varchar(255),
	"type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'Programado' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "karate_belts" (
	"id" serial PRIMARY KEY NOT NULL,
	"belt" varchar(255) NOT NULL,
	CONSTRAINT "karate_belts_belt_unique" UNIQUE("belt")
);
--> statement-breakpoint
CREATE TABLE "karate_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(255) NOT NULL,
	"age_range" varchar(100) NOT NULL,
	CONSTRAINT "karate_categories_category_unique" UNIQUE("category"),
	CONSTRAINT "karate_categories_age_range_unique" UNIQUE("age_range")
);
--> statement-breakpoint
CREATE TABLE "kata_performances" (
	"id" serial PRIMARY KEY NOT NULL,
	"scoring_division_id" integer NOT NULL,
	"athlete_id" integer NOT NULL,
	"kata_name" varchar(255),
	"round_number" integer DEFAULT 1 NOT NULL,
	"final_score" integer DEFAULT null,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modalities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "modalities_name_unique" UNIQUE("name")
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
CREATE TABLE "scoring_divisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"karate_category_id" integer NOT NULL,
	"modality_id" integer NOT NULL,
	"phase" varchar(100) DEFAULT 'Clasificación' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_modality_per_event" UNIQUE("event_id","karate_category_id","modality_id")
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
	"representative_id" jsonb DEFAULT '[]'::jsonb,
	"status" integer DEFAULT null,
	"roles_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category_id" integer DEFAULT null,
	"belt_id" integer DEFAULT null,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "document_unique" UNIQUE("document_type","document_number")
);
--> statement-breakpoint
ALTER TABLE "kata_performances" ADD CONSTRAINT "kata_performances_scoring_division_id_scoring_divisions_id_fk" FOREIGN KEY ("scoring_division_id") REFERENCES "public"."scoring_divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kata_performances" ADD CONSTRAINT "kata_performances_athlete_id_users_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scoring_divisions" ADD CONSTRAINT "scoring_divisions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scoring_divisions" ADD CONSTRAINT "scoring_divisions_karate_category_id_karate_categories_id_fk" FOREIGN KEY ("karate_category_id") REFERENCES "public"."karate_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scoring_divisions" ADD CONSTRAINT "scoring_divisions_modality_id_modalities_id_fk" FOREIGN KEY ("modality_id") REFERENCES "public"."modalities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_status_status_id_fk" FOREIGN KEY ("status") REFERENCES "public"."status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_category_id_karate_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."karate_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_belt_id_karate_belts_id_fk" FOREIGN KEY ("belt_id") REFERENCES "public"."karate_belts"("id") ON DELETE no action ON UPDATE no action;
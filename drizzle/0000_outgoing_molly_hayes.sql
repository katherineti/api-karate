CREATE TYPE "public"."judge_role" AS ENUM('juez_central / arbitro', 'juez_linea / juez_esquina', 'anotador', 'juez_suplente');--> statement-breakpoint
CREATE TYPE "public"."participant_requests_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "division_judges" (
	"id" serial PRIMARY KEY NOT NULL,
	"division_id" integer,
	"judge_id" integer,
	"role_in_pool" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_division_judge" UNIQUE("division_id","judge_id")
);
--> statement-breakpoint
CREATE TABLE "event_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_event_category" UNIQUE("event_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "event_divisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_category_id" integer NOT NULL,
	"modality_id" integer NOT NULL,
	"max_evaluation_score" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_event_cat_modality" UNIQUE("event_category_id","modality_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"date" date NOT NULL,
	"location" varchar(255),
	"subtype_id" integer NOT NULL,
	"status_id" integer DEFAULT 4 NOT NULL,
	"max_evaluation_score" integer DEFAULT 0 NOT NULL,
	"max_participants" integer DEFAULT null,
	"created_by" integer,
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
	"allowed_belts" integer[],
	CONSTRAINT "unique_category_age" UNIQUE("category","age_range")
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
	"type" varchar(50) NOT NULL,
	CONSTRAINT "modalities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer,
	"recipient_id" integer,
	"event_id" integer,
	"participant_requests_id" integer,
	"title" varchar(255) NOT NULL,
	"message" varchar(1000),
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "participant_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"master_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"num_participants_requested" integer NOT NULL,
	"status" "participant_requests_status" DEFAULT 'pending' NOT NULL,
	"message" varchar(500),
	"created_at" timestamp DEFAULT now()
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
	"address" varchar(500),
	"base_score" integer DEFAULT 0 NOT NULL,
	"logo_url" varchar(500) DEFAULT null,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
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
CREATE TABLE "subtypes_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"type_id" integer NOT NULL,
	"subtype" varchar(50),
	CONSTRAINT "unique_subtype_per_type" UNIQUE("type_id","subtype")
);
--> statement-breakpoint
CREATE TABLE "tournament_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete_id" integer,
	"division_id" integer,
	"registration_date" timestamp DEFAULT now(),
	"status" varchar(50) DEFAULT 'pendiente',
	CONSTRAINT "unique_registration" UNIQUE("athlete_id","division_id")
);
--> statement-breakpoint
CREATE TABLE "types_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	CONSTRAINT "types_events_type_unique" UNIQUE("type")
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
ALTER TABLE "division_judges" ADD CONSTRAINT "division_judges_division_id_event_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."event_divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "division_judges" ADD CONSTRAINT "division_judges_judge_id_users_id_fk" FOREIGN KEY ("judge_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_category_id_karate_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."karate_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_divisions" ADD CONSTRAINT "event_divisions_event_category_id_event_categories_id_fk" FOREIGN KEY ("event_category_id") REFERENCES "public"."event_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_divisions" ADD CONSTRAINT "event_divisions_modality_id_modalities_id_fk" FOREIGN KEY ("modality_id") REFERENCES "public"."modalities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_subtype_id_subtypes_events_id_fk" FOREIGN KEY ("subtype_id") REFERENCES "public"."subtypes_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_status_id_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kata_performances" ADD CONSTRAINT "kata_performances_scoring_division_id_event_divisions_id_fk" FOREIGN KEY ("scoring_division_id") REFERENCES "public"."event_divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kata_performances" ADD CONSTRAINT "kata_performances_athlete_id_users_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_participant_requests_id_participant_requests_id_fk" FOREIGN KEY ("participant_requests_id") REFERENCES "public"."participant_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_requests" ADD CONSTRAINT "participant_requests_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_requests" ADD CONSTRAINT "participant_requests_master_id_users_id_fk" FOREIGN KEY ("master_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_requests" ADD CONSTRAINT "participant_requests_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtypes_events" ADD CONSTRAINT "subtypes_events_type_id_types_events_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."types_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_athlete_id_users_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_division_id_event_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."event_divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_status_status_id_fk" FOREIGN KEY ("status") REFERENCES "public"."status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_category_id_karate_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."karate_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_belt_id_karate_belts_id_fk" FOREIGN KEY ("belt_id") REFERENCES "public"."karate_belts"("id") ON DELETE no action ON UPDATE no action;
CREATE TYPE "public"."disaster_status" AS ENUM('active', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."emergency_type" AS ENUM('medical', 'flood', 'fire', 'earthquake', 'other');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'assigned', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."resource_status" AS ENUM('available', 'deployed', 'depleted');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('food', 'water', 'medical_supplies', 'shelter_kit', 'other');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."volunteer_status" AS ENUM('available', 'on_mission', 'unavailable');--> statement-breakpoint
CREATE TABLE "disaster_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"radius_km" double precision DEFAULT 5 NOT NULL,
	"severity" "severity" DEFAULT 'medium' NOT NULL,
	"type" "emergency_type" DEFAULT 'other' NOT NULL,
	"status" "disaster_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "help_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"disaster_zone_id" uuid,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"emergency_type" "emergency_type" NOT NULL,
	"people_count" integer DEFAULT 1 NOT NULL,
	"description" text,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"priority_score" integer,
	"assigned_volunteer_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "resource_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"status" "resource_status" DEFAULT 'available' NOT NULL,
	"disaster_zone_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"status" "volunteer_status" DEFAULT 'available' NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "volunteers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "help_requests" ADD CONSTRAINT "help_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_requests" ADD CONSTRAINT "help_requests_disaster_zone_id_disaster_zones_id_fk" FOREIGN KEY ("disaster_zone_id") REFERENCES "public"."disaster_zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_requests" ADD CONSTRAINT "help_requests_assigned_volunteer_id_users_id_fk" FOREIGN KEY ("assigned_volunteer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_disaster_zone_id_disaster_zones_id_fk" FOREIGN KEY ("disaster_zone_id") REFERENCES "public"."disaster_zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
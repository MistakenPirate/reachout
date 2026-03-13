import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  doublePrecision,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";

// -- Enums --

export const roleEnum = pgEnum("role", ["victim", "volunteer", "admin"]);

export const severityEnum = pgEnum("severity", ["low", "medium", "high", "critical"]);

export const disasterStatusEnum = pgEnum("disaster_status", ["active", "resolved"]);

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "assigned",
  "in_progress",
  "resolved",
]);

export const emergencyTypeEnum = pgEnum("emergency_type", [
  "medical",
  "flood",
  "fire",
  "earthquake",
  "other",
]);

export const resourceTypeEnum = pgEnum("resource_type", [
  "food",
  "water",
  "medical_supplies",
  "shelter_kit",
  "other",
]);

export const resourceStatusEnum = pgEnum("resource_status", [
  "available",
  "deployed",
  "depleted",
]);

export const volunteerStatusEnum = pgEnum("volunteer_status", [
  "available",
  "on_mission",
  "unavailable",
]);

// -- Tables --

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  role: roleEnum("role").notNull().default("victim"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const disasterZones = pgTable("disaster_zones", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  radiusKm: doublePrecision("radius_km").notNull().default(5),
  severity: severityEnum("severity").notNull().default("medium"),
  type: emergencyTypeEnum("type").notNull().default("other"),
  status: disasterStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const helpRequests = pgTable("help_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  disasterZoneId: uuid("disaster_zone_id").references(() => disasterZones.id),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  emergencyType: emergencyTypeEnum("emergency_type").notNull(),
  peopleCount: integer("people_count").notNull().default(1),
  description: text("description"),
  status: requestStatusEnum("status").notNull().default("pending"),
  priorityScore: integer("priority_score"),
  assignedVolunteerId: uuid("assigned_volunteer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const volunteers = pgTable("volunteers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  skills: text("skills").array().notNull().default([]),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  status: volunteerStatusEnum("status").notNull().default("available"),
  isAvailable: boolean("is_available").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: resourceTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  status: resourceStatusEnum("status").notNull().default("available"),
  disasterZoneId: uuid("disaster_zone_id").references(() => disasterZones.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

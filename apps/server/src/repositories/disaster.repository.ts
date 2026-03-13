import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { disasterZones, helpRequests, volunteers, resources, users } from "../db/schema.js";

export function findAllActiveZones() {
  return db.select().from(disasterZones).where(eq(disasterZones.status, "active"));
}

export function findZoneById(id: string) {
  return db.select().from(disasterZones).where(eq(disasterZones.id, id));
}

export function createZone(data: typeof disasterZones.$inferInsert) {
  return db.insert(disasterZones).values(data).returning();
}

export function findAllHelpRequests() {
  return db
    .select({
      id: helpRequests.id,
      latitude: helpRequests.latitude,
      longitude: helpRequests.longitude,
      emergencyType: helpRequests.emergencyType,
      peopleCount: helpRequests.peopleCount,
      description: helpRequests.description,
      status: helpRequests.status,
      priorityScore: helpRequests.priorityScore,
      createdAt: helpRequests.createdAt,
      userName: users.name,
    })
    .from(helpRequests)
    .leftJoin(users, eq(helpRequests.userId, users.id));
}

export function findAvailableVolunteers() {
  return db
    .select({
      id: volunteers.id,
      userId: volunteers.userId,
      skills: volunteers.skills,
      latitude: volunteers.latitude,
      longitude: volunteers.longitude,
      status: volunteers.status,
      userName: users.name,
    })
    .from(volunteers)
    .leftJoin(users, eq(volunteers.userId, users.id))
    .where(eq(volunteers.isAvailable, true));
}

export function findAllResources() {
  return db.select().from(resources);
}

export function createResource(data: typeof resources.$inferInsert) {
  return db.insert(resources).values(data).returning();
}

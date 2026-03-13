import { eq, and, sql } from "drizzle-orm";
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

// -- Help Requests --

export function createHelpRequest(data: typeof helpRequests.$inferInsert) {
  return db.insert(helpRequests).values(data).returning();
}

export function findHelpRequestsByUser(userId: string) {
  return db.select().from(helpRequests).where(eq(helpRequests.userId, userId));
}

export function findHelpRequestById(id: string) {
  return db.select().from(helpRequests).where(eq(helpRequests.id, id));
}

export function updateHelpRequestStatus(id: string, status: string) {
  return db
    .update(helpRequests)
    .set({ status: status as "pending" | "assigned" | "in_progress" | "resolved", updatedAt: new Date() })
    .where(eq(helpRequests.id, id))
    .returning();
}

// -- Volunteers --

export function findVolunteerByUserId(userId: string) {
  return db.select().from(volunteers).where(eq(volunteers.userId, userId));
}

export function createVolunteer(data: typeof volunteers.$inferInsert) {
  return db.insert(volunteers).values(data).returning();
}

export function updateVolunteer(
  userId: string,
  data: Partial<Pick<typeof volunteers.$inferInsert, "skills" | "latitude" | "longitude" | "isAvailable" | "status">>,
) {
  return db
    .update(volunteers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(volunteers.userId, userId))
    .returning();
}

// -- Assignment --

export function assignVolunteerToRequest(requestId: string, volunteerId: string) {
  return db
    .update(helpRequests)
    .set({ assignedVolunteerId: volunteerId, status: "assigned", updatedAt: new Date() })
    .where(eq(helpRequests.id, requestId))
    .returning();
}

export function setVolunteerOnMission(userId: string) {
  return db
    .update(volunteers)
    .set({ status: "on_mission", isAvailable: false, updatedAt: new Date() })
    .where(eq(volunteers.userId, userId))
    .returning();
}

export function findAllAvailableVolunteersWithLocation() {
  return db
    .select({
      id: volunteers.id,
      userId: volunteers.userId,
      skills: volunteers.skills,
      latitude: volunteers.latitude,
      longitude: volunteers.longitude,
      userName: users.name,
    })
    .from(volunteers)
    .leftJoin(users, eq(volunteers.userId, users.id))
    .where(and(eq(volunteers.isAvailable, true), eq(volunteers.status, "available")));
}

// -- Resources (update) --

export function findResourceById(id: string) {
  return db.select().from(resources).where(eq(resources.id, id));
}

export function updateResource(id: string, data: Partial<typeof resources.$inferInsert>) {
  return db.update(resources).set(data).where(eq(resources.id, id)).returning();
}

export function decrementResourceQuantity(id: string, amount: number) {
  return db
    .update(resources)
    .set({ quantity: sql`${resources.quantity} - ${amount}` })
    .where(and(eq(resources.id, id)))
    .returning();
}

// -- All data queries for admin dashboard --

export function findAllHelpRequestsFull() {
  return db
    .select({
      id: helpRequests.id,
      userId: helpRequests.userId,
      latitude: helpRequests.latitude,
      longitude: helpRequests.longitude,
      emergencyType: helpRequests.emergencyType,
      peopleCount: helpRequests.peopleCount,
      description: helpRequests.description,
      status: helpRequests.status,
      priorityScore: helpRequests.priorityScore,
      assignedVolunteerId: helpRequests.assignedVolunteerId,
      createdAt: helpRequests.createdAt,
      updatedAt: helpRequests.updatedAt,
      userName: users.name,
    })
    .from(helpRequests)
    .leftJoin(users, eq(helpRequests.userId, users.id));
}

export function findAllVolunteers() {
  return db
    .select({
      id: volunteers.id,
      userId: volunteers.userId,
      skills: volunteers.skills,
      latitude: volunteers.latitude,
      longitude: volunteers.longitude,
      status: volunteers.status,
      isAvailable: volunteers.isAvailable,
      userName: users.name,
    })
    .from(volunteers)
    .leftJoin(users, eq(volunteers.userId, users.id));
}

// -- Rescue tracking for victim --

export function findHelpRequestWithVolunteer(requestId: string) {
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
      updatedAt: helpRequests.updatedAt,
      assignedVolunteerId: helpRequests.assignedVolunteerId,
    })
    .from(helpRequests)
    .where(eq(helpRequests.id, requestId));
}

export function findUserById(userId: string) {
  return db
    .select({ id: users.id, name: users.name, phone: users.phone })
    .from(users)
    .where(eq(users.id, userId));
}

export function updateHelpRequestPriority(id: string, score: number) {
  return db
    .update(helpRequests)
    .set({ priorityScore: score, updatedAt: new Date() })
    .where(eq(helpRequests.id, id))
    .returning();
}

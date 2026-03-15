import bcrypt from "bcrypt";
import { db } from "./index.js";
import * as schema from "./schema.js";

export async function clearDatabase() {
  await db.delete(schema.resources);
  await db.delete(schema.helpRequests);
  await db.delete(schema.volunteers);
  await db.delete(schema.disasterZones);
  await db.delete(schema.users);
}

export async function seedDatabase() {
  const password = await bcrypt.hash("password123", 10);

  await db
    .insert(schema.users)
    .values([
      { name: "Admin User", email: "admin@reachout.io", password, phone: "+919876543210", role: "admin" },
    ])
    .returning();

  const [victim1, victim2, victim3, victim4] = await db
    .insert(schema.users)
    .values([
      { name: "Priya Sharma", email: "priya@example.com", password, phone: "+919812345001", role: "victim" },
      { name: "Rahul Verma", email: "rahul@example.com", password, phone: "+919812345002", role: "victim" },
      { name: "Anita Desai", email: "anita@example.com", password, phone: "+919812345003", role: "victim" },
      { name: "Karan Mehta", email: "karan@example.com", password, phone: "+919812345004", role: "victim" },
    ])
    .returning();

  const [vol1, vol2, vol3] = await db
    .insert(schema.users)
    .values([
      { name: "Amit Patel", email: "amit@example.com", password, phone: "+919812345101", role: "volunteer" },
      { name: "Sneha Nair", email: "sneha@example.com", password, phone: "+919812345102", role: "volunteer" },
      { name: "Vikram Singh", email: "vikram@example.com", password, phone: "+919812345103", role: "volunteer" },
    ])
    .returning();

  const [zone1, zone2, zone3] = await db
    .insert(schema.disasterZones)
    .values([
      {
        name: "Chennai Flood Zone",
        description: "Severe flooding in low-lying areas of Chennai due to heavy monsoon rainfall. Multiple neighborhoods submerged.",
        latitude: 13.0827,
        longitude: 80.2707,
        radiusKm: 12,
        severity: "critical",
        type: "flood",
        status: "active",
      },
      {
        name: "Mumbai Landslide Area",
        description: "Landslide and structural collapses in western suburbs after 48h continuous rain.",
        latitude: 19.076,
        longitude: 72.8777,
        radiusKm: 5,
        severity: "high",
        type: "earthquake",
        status: "active",
      },
      {
        name: "Delhi Industrial Fire",
        description: "Factory fire in Bawana industrial area. Nearby residences being evacuated.",
        latitude: 28.7041,
        longitude: 77.1025,
        radiusKm: 3,
        severity: "high",
        type: "fire",
        status: "active",
      },
    ])
    .returning();

  await db.insert(schema.volunteers).values([
    {
      userId: vol1!.id,
      skills: ["medical", "search_rescue"],
      latitude: 13.05,
      longitude: 80.25,
      status: "on_mission",
      isAvailable: false,
    },
    {
      userId: vol2!.id,
      skills: ["medical", "food", "shelter"],
      latitude: 13.1,
      longitude: 80.29,
      status: "available",
      isAvailable: true,
    },
    {
      userId: vol3!.id,
      skills: ["transport", "search_rescue"],
      latitude: 28.72,
      longitude: 77.11,
      status: "available",
      isAvailable: true,
    },
  ]);

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000);

  await db.insert(schema.helpRequests).values([
    {
      userId: victim1!.id,
      disasterZoneId: zone1!.id,
      latitude: 13.06,
      longitude: 80.26,
      emergencyType: "flood",
      peopleCount: 4,
      description: "Water level rising in ground floor. Two elderly members unable to move. Need evacuation urgently.",
      status: "in_progress",
      priorityScore: 9,
      assignedVolunteerId: vol1!.id,
      createdAt: hoursAgo(6),
      updatedAt: hoursAgo(4),
    },
    {
      userId: victim2!.id,
      disasterZoneId: zone1!.id,
      latitude: 13.09,
      longitude: 80.28,
      emergencyType: "medical",
      peopleCount: 2,
      description: "Diabetic patient running out of insulin. Need medical supplies delivered.",
      status: "assigned",
      priorityScore: 8,
      assignedVolunteerId: vol2!.id,
      createdAt: hoursAgo(3),
      updatedAt: hoursAgo(2),
    },
    {
      userId: victim3!.id,
      disasterZoneId: zone2!.id,
      latitude: 19.08,
      longitude: 72.88,
      emergencyType: "earthquake",
      peopleCount: 6,
      description: "Building partially collapsed. Family trapped on 3rd floor. Can hear them responding.",
      status: "pending",
      priorityScore: null,
      createdAt: hoursAgo(1),
      updatedAt: hoursAgo(1),
    },
    {
      userId: victim4!.id,
      disasterZoneId: zone3!.id,
      latitude: 28.71,
      longitude: 77.1,
      emergencyType: "fire",
      peopleCount: 3,
      description: "Smoke inhalation. Family evacuated but one child has breathing difficulty.",
      status: "pending",
      priorityScore: null,
      createdAt: hoursAgo(0.5),
      updatedAt: hoursAgo(0.5),
    },
    {
      userId: victim1!.id,
      disasterZoneId: zone1!.id,
      latitude: 13.07,
      longitude: 80.27,
      emergencyType: "flood",
      peopleCount: 1,
      description: "Food and water needed. Stranded on rooftop for 12 hours.",
      status: "pending",
      priorityScore: null,
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2),
    },
  ]);

  await db.insert(schema.resources).values([
    {
      type: "food",
      name: "Emergency Ration Packs",
      quantity: 500,
      latitude: 13.0,
      longitude: 80.22,
      status: "available",
      disasterZoneId: zone1!.id,
    },
    {
      type: "water",
      name: "Drinking Water (20L cans)",
      quantity: 200,
      latitude: 13.04,
      longitude: 80.24,
      status: "available",
      disasterZoneId: zone1!.id,
    },
    {
      type: "medical_supplies",
      name: "First Aid Kits",
      quantity: 80,
      latitude: 13.08,
      longitude: 80.27,
      status: "deployed",
      disasterZoneId: zone1!.id,
    },
    {
      type: "shelter_kit",
      name: "Emergency Tents",
      quantity: 30,
      latitude: 19.07,
      longitude: 72.87,
      status: "available",
      disasterZoneId: zone2!.id,
    },
    {
      type: "medical_supplies",
      name: "Burn Treatment Kits",
      quantity: 50,
      latitude: 28.7,
      longitude: 77.1,
      status: "available",
      disasterZoneId: zone3!.id,
    },
    {
      type: "water",
      name: "Water Purification Tablets",
      quantity: 1000,
      latitude: 28.71,
      longitude: 77.11,
      status: "available",
      disasterZoneId: zone3!.id,
    },
  ]);
}

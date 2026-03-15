import { z } from "zod";

export const severitySchema = z.enum(["low", "medium", "high", "critical"]);
export const disasterStatusSchema = z.enum(["active", "resolved"]);
export const emergencyTypeSchema = z.enum([
	"medical",
	"flood",
	"fire",
	"earthquake",
	"other",
]);
export const requestStatusSchema = z.enum([
	"pending",
	"assigned",
	"in_progress",
	"resolved",
]);
export const resourceTypeSchema = z.enum([
	"food",
	"water",
	"medical_supplies",
	"shelter_kit",
	"other",
]);
export const resourceStatusSchema = z.enum([
	"available",
	"deployed",
	"depleted",
]);
export const volunteerStatusSchema = z.enum([
	"available",
	"on_mission",
	"unavailable",
]);

export const createDisasterZoneSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	radiusKm: z.number().positive().default(5),
	severity: severitySchema.default("medium"),
	type: emergencyTypeSchema.default("other"),
});

export const createHelpRequestSchema = z.object({
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	emergencyType: emergencyTypeSchema,
	peopleCount: z.number().int().positive().default(1),
	description: z.string().optional(),
	disasterZoneId: z.string().uuid().optional(),
});

export const createResourceSchema = z.object({
	type: resourceTypeSchema,
	name: z.string().min(1, "Name is required"),
	quantity: z.number().int().nonnegative(),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	disasterZoneId: z.string().uuid().optional(),
});

export const updateVolunteerProfileSchema = z.object({
	skills: z.array(z.string()).optional(),
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
	isAvailable: z.boolean().optional(),
});

// WebSocket message types
export const wsMessageSchema = z.object({
	type: z.enum([
		"new_request",
		"request_updated",
		"volunteer_assigned",
		"resource_allocated",
		"disaster_zone_created",
		"disaster_zone_updated",
	]),
	payload: z.record(z.unknown()),
});

export type Severity = z.infer<typeof severitySchema>;
export type DisasterStatus = z.infer<typeof disasterStatusSchema>;
export type EmergencyType = z.infer<typeof emergencyTypeSchema>;
export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type ResourceType = z.infer<typeof resourceTypeSchema>;
export type ResourceStatus = z.infer<typeof resourceStatusSchema>;
export type VolunteerStatus = z.infer<typeof volunteerStatusSchema>;
export type CreateDisasterZoneInput = z.infer<typeof createDisasterZoneSchema>;
export type CreateHelpRequestInput = z.infer<typeof createHelpRequestSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateVolunteerProfileInput = z.infer<
	typeof updateVolunteerProfileSchema
>;
export type WsMessage = z.infer<typeof wsMessageSchema>;

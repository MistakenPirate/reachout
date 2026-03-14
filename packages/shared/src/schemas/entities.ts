import { z } from "zod";
import {
  severitySchema,
  emergencyTypeSchema,
  disasterStatusSchema,
  requestStatusSchema,
  resourceTypeSchema,
  resourceStatusSchema,
  volunteerStatusSchema,
} from "./disaster.js";
import { roleSchema } from "./auth.js";

// ── User ──
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: roleSchema,
});
export type User = z.infer<typeof userSchema>;

// ── Disaster Zone ──
export const disasterZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  radiusKm: z.number(),
  severity: severitySchema,
  type: emergencyTypeSchema,
  status: disasterStatusSchema,
});
export type DisasterZone = z.infer<typeof disasterZoneSchema>;

// ── Help Request ──
export const helpRequestSchema = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  emergencyType: emergencyTypeSchema,
  peopleCount: z.number(),
  description: z.string().nullable(),
  status: requestStatusSchema,
  priorityScore: z.number().nullable(),
  createdAt: z.string(),
  userName: z.string().nullable(),
});
export type HelpRequest = z.infer<typeof helpRequestSchema>;

// ── Volunteer ──
export const volunteerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  skills: z.array(z.string()),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  status: volunteerStatusSchema,
  userName: z.string().nullable(),
});
export type Volunteer = z.infer<typeof volunteerSchema>;

// ── Resource ──
export const resourceSchema = z.object({
  id: z.string(),
  type: resourceTypeSchema,
  name: z.string(),
  quantity: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  status: resourceStatusSchema,
});
export type Resource = z.infer<typeof resourceSchema>;

// ── Map Data ──
export const mapDataSchema = z.object({
  zones: z.array(disasterZoneSchema),
  helpRequests: z.array(helpRequestSchema),
  volunteers: z.array(volunteerSchema),
  resources: z.array(resourceSchema),
});
export type MapData = z.infer<typeof mapDataSchema>;

// ── Volunteer Profile ──
export const volunteerProfileSchema = z.object({
  id: z.string(),
  skills: z.array(z.string()),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  status: volunteerStatusSchema,
  isAvailable: z.boolean(),
});
export type VolunteerProfile = z.infer<typeof volunteerProfileSchema>;

// ── Pending Request (alias for HelpRequest) ──
export type PendingRequest = HelpRequest;

// ── Suggested Volunteer ──
export const suggestedVolunteerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  skills: z.array(z.string()),
  latitude: z.number(),
  longitude: z.number(),
  userName: z.string().nullable(),
  distance: z.number(),
});
export type SuggestedVolunteer = z.infer<typeof suggestedVolunteerSchema>;

// ── Dashboard Types ──
export const dashboardSummarySchema = z.object({
  totalActiveDisasters: z.number(),
  pendingRequests: z.number(),
  assignedRequests: z.number(),
  inProgressRequests: z.number(),
  resolvedRequests: z.number(),
  availableVolunteers: z.number(),
  onMissionVolunteers: z.number(),
  totalResources: z.number(),
});
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

export const dashboardRequestSchema = helpRequestSchema.extend({
  userId: z.string(),
  assignedVolunteerId: z.string().nullable(),
  updatedAt: z.string(),
});
export type DashboardRequest = z.infer<typeof dashboardRequestSchema>;

export const dashboardVolunteerSchema = volunteerSchema.extend({
  isAvailable: z.boolean(),
});
export type DashboardVolunteer = z.infer<typeof dashboardVolunteerSchema>;

export const dashboardResourceSchema = resourceSchema;
export type DashboardResource = z.infer<typeof dashboardResourceSchema>;

export const dashboardZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  severity: severitySchema,
  type: emergencyTypeSchema,
  status: disasterStatusSchema,
});
export type DashboardZone = z.infer<typeof dashboardZoneSchema>;

export const dashboardDataSchema = z.object({
  summary: dashboardSummarySchema,
  zones: z.array(dashboardZoneSchema),
  requests: z.array(dashboardRequestSchema),
  volunteers: z.array(dashboardVolunteerSchema),
  resources: z.array(dashboardResourceSchema),
});
export type DashboardData = z.infer<typeof dashboardDataSchema>;

// ── Rescue Status ──
export const rescueStatusSchema = z.object({
  id: z.string(),
  emergencyType: emergencyTypeSchema,
  peopleCount: z.number(),
  description: z.string().nullable(),
  status: requestStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  volunteer: z
    .object({
      name: z.string(),
      phone: z.string(),
      distance: z.number().nullable(),
    })
    .nullable(),
});
export type RescueStatus = z.infer<typeof rescueStatusSchema>;

// ── AI Types ──
export const priorityResultSchema = z.object({
  requestId: z.string(),
  score: z.number(),
  reasoning: z.string(),
});
export type PriorityResult = z.infer<typeof priorityResultSchema>;

export const damageSummarySchema = z.object({
  affectedAreas: z.array(z.string()),
  estimatedDamageLevel: z.string(),
  keyNeeds: z.array(z.string()),
  sentiment: z.string(),
  summary: z.string(),
  sources: z.array(z.object({ snippet: z.string(), url: z.string() })).optional(),
});
export type DamageSummary = z.infer<typeof damageSummarySchema>;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

import type { RequestHandler } from "express";
import { createDisasterZoneSchema, createResourceSchema } from "@repo/shared/schemas";
import * as adminService from "../services/admin.service.js";
import * as disasterService from "../services/disaster.service.js";
import { ServiceError } from "../services/auth.service.js";
import { broadcast } from "../ws.js";

function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(0, parseInt(query.page as string) || 0);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 5));
  return { page, limit };
}

export const getZones: RequestHandler = async (req, res) => {
  const { page, limit } = parsePagination(req.query as Record<string, unknown>);
  const result = await disasterService.getZonesPaginated(page, limit);
  res.json(result);
};

export const getResources: RequestHandler = async (req, res) => {
  const { page, limit } = parsePagination(req.query as Record<string, unknown>);
  const result = await disasterService.getResourcesPaginated(page, limit);
  res.json(result);
};

export const getPendingRequests: RequestHandler = async (_req, res) => {
  const requests = await adminService.getAllPendingRequests();
  res.json(requests);
};

export const getSuggestedVolunteers: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  try {
    const volunteers = await adminService.getSuggestedVolunteers(id);
    res.json(volunteers);
  } catch (err) {
    if (err instanceof ServiceError) { res.status(err.status).json({ error: err.message }); return; }
    throw err;
  }
};

export const assignVolunteer: RequestHandler = async (req, res) => {
  const requestId = req.params.id as string;
  const { volunteerUserId } = req.body;

  if (!volunteerUserId) {
    res.status(400).json({ error: "volunteerUserId is required" });
    return;
  }

  try {
    const updated = await adminService.assignVolunteer(requestId, volunteerUserId);
    broadcast({ type: "volunteer_assigned", payload: updated });
    broadcast({ type: "request_updated", payload: updated });
    res.json(updated);
  } catch (err) {
    if (err instanceof ServiceError) { res.status(err.status).json({ error: err.message }); return; }
    throw err;
  }
};

export const createZone: RequestHandler = async (req, res) => {
  const parsed = createDisasterZoneSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const zone = await disasterService.createDisasterZone(parsed.data);
  broadcast({ type: "disaster_zone_created", payload: zone });
  res.status(201).json(zone);
};

export const createResource: RequestHandler = async (req, res) => {
  const parsed = createResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const resource = await disasterService.createResource(parsed.data);
  broadcast({ type: "resource_allocated", payload: resource });
  res.status(201).json(resource);
};

export const deleteZone: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  try {
    const zone = await disasterService.deleteDisasterZone(id);
    broadcast({ type: "disaster_zone_updated", payload: zone });
    res.json(zone);
  } catch (err) {
    if (err instanceof Error && err.message === "Zone not found") {
      res.status(404).json({ error: "Zone not found" });
      return;
    }
    throw err;
  }
};

export const deleteResource: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  try {
    const resource = await disasterService.deleteResource(id);
    broadcast({ type: "resource_allocated", payload: resource });
    res.json(resource);
  } catch (err) {
    if (err instanceof Error && err.message === "Resource not found") {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    throw err;
  }
};

export const allocateResource: RequestHandler = async (req, res) => {
  const resourceId = req.params.id as string;
  const { amount, disasterZoneId } = req.body;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "amount must be a positive number" });
    return;
  }

  try {
    const updated = await adminService.allocateResource(resourceId, amount, disasterZoneId);
    broadcast({ type: "resource_allocated", payload: updated });
    res.json(updated);
  } catch (err) {
    if (err instanceof ServiceError) { res.status(err.status).json({ error: err.message }); return; }
    throw err;
  }
};

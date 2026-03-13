import type { RequestHandler } from "express";
import { updateVolunteerProfileSchema } from "@repo/shared/schemas";
import * as volunteerService from "../services/volunteer.service.js";
import * as disasterRepo from "../repositories/disaster.repository.js";
import { ServiceError } from "../services/auth.service.js";

export const getProfile: RequestHandler = async (req, res) => {
  if (!req.user) { res.status(401).json({ error: "Not authenticated" }); return; }

  try {
    const profile = await volunteerService.getOrCreateProfile(req.user.userId);
    res.json(profile);
  } catch (err) {
    if (err instanceof ServiceError) { res.status(err.status).json({ error: err.message }); return; }
    throw err;
  }
};

export const updateProfile: RequestHandler = async (req, res) => {
  if (!req.user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const parsed = updateVolunteerProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const profile = await volunteerService.updateProfile(req.user.userId, parsed.data);
    res.json(profile);
  } catch (err) {
    if (err instanceof ServiceError) { res.status(err.status).json({ error: err.message }); return; }
    throw err;
  }
};

export const getMyMissions: RequestHandler = async (req, res) => {
  if (!req.user) { res.status(401).json({ error: "Not authenticated" }); return; }
  const missions = await disasterRepo.findHelpRequestsAssignedToVolunteer(req.user.userId);
  res.json(missions);
};

export const updateMissionStatus: RequestHandler = async (req, res) => {
  if (!req.user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const id = req.params.id as string;
  const { status } = req.body;

  if (!["in_progress", "resolved"].includes(status)) {
    res.status(400).json({ error: "Status must be in_progress or resolved" });
    return;
  }

  // Verify this mission is assigned to this volunteer
  const missions = await disasterRepo.findHelpRequestsAssignedToVolunteer(req.user.userId);
  if (!missions.find((m) => m.id === id)) {
    res.status(403).json({ error: "Not your mission" });
    return;
  }

  const [updated] = await disasterRepo.updateHelpRequestStatus(id, status);
  if (!updated) { res.status(404).json({ error: "Request not found" }); return; }

  // If resolved, set volunteer back to available
  if (status === "resolved") {
    await disasterRepo.updateVolunteer(req.user.userId, { status: "available", isAvailable: true });
  }

  res.json(updated);
};

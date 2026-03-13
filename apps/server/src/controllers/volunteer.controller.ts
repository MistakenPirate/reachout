import type { RequestHandler } from "express";
import { updateVolunteerProfileSchema } from "@repo/shared/schemas";
import * as volunteerService from "../services/volunteer.service.js";
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

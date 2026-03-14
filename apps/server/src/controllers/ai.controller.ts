import type { RequestHandler } from "express";
import * as aiService from "../services/ai.service.js";
import * as disasterRepo from "../repositories/disaster.repository.js";
import * as adminService from "../services/admin.service.js";

export const prioritizeRequests: RequestHandler = async (_req, res) => {
  try {
    const pending = await adminService.getAllPendingRequests();

    if (pending.length === 0) {
      res.json([]);
      return;
    }

    const results = await aiService.prioritizeRequests(pending);

    // Update scores in DB
    await Promise.all(
      results.map((r) => disasterRepo.updateHelpRequestPriority(r.requestId, r.score)),
    );

    res.json(results);
  } catch (err) {
    console.error("[AI prioritize] error:", err);
    res.status(500).json({ error: "Failed to prioritize requests" });
  }
};

export const summarizeSocialMedia: RequestHandler = async (req, res) => {
  const { keyword, timeRange } = req.body;
  if (!keyword || typeof keyword !== "string") {
    res.status(400).json({ error: "keyword is required" });
    return;
  }

  try {
    const summary = await aiService.summarizeSocialMedia(keyword, timeRange || "w");
    res.json(summary);
  } catch (err) {
    console.error("[AI summarize] error:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function buildVictimContext(userId: string): Promise<string> {
  const requests = await disasterRepo.findHelpRequestsByUser(userId);
  if (requests.length === 0) return "The victim has no active help requests.";

  const lines: string[] = ["VICTIM'S HELP REQUESTS:"];
  for (const req of requests) {
    lines.push(`- Request: ${req.emergencyType}, ${req.peopleCount} people, status: ${req.status}, location: (${req.latitude}, ${req.longitude})`);
    if (req.description) lines.push(`  Description: ${req.description}`);

    if (req.assignedVolunteerId) {
      const [vol] = await disasterRepo.findVolunteerByUserId(req.assignedVolunteerId);
      const [volUser] = await disasterRepo.findUserById(req.assignedVolunteerId);
      if (vol && volUser) {
        const dist = vol.latitude != null && vol.longitude != null
          ? haversineDistance(req.latitude, req.longitude, vol.latitude, vol.longitude).toFixed(1)
          : "unknown";
        lines.push(`  Assigned volunteer: ${volUser.name}, phone: ${volUser.phone}, status: ${vol.status}, distance: ${dist} km, available: ${vol.isAvailable}`);
      }
    } else {
      lines.push("  No volunteer assigned yet.");
    }
  }
  return lines.join("\n");
}

async function buildVolunteerContext(userId: string): Promise<string> {
  const missions = await disasterRepo.findHelpRequestsAssignedToVolunteer(userId);
  const [profile] = await disasterRepo.findVolunteerByUserId(userId);

  const lines: string[] = [];
  if (profile) {
    lines.push(`YOUR PROFILE: skills: ${profile.skills.join(", ") || "none"}, status: ${profile.status}, available: ${profile.isAvailable}, location: ${profile.latitude != null ? `(${profile.latitude}, ${profile.longitude})` : "not set"}`);
  }

  if (missions.length === 0) {
    lines.push("\nNo missions currently assigned.");
  } else {
    lines.push("\nASSIGNED MISSIONS:");
    for (const m of missions) {
      const dist = profile?.latitude != null && profile?.longitude != null
        ? haversineDistance(profile.latitude, profile.longitude, m.latitude, m.longitude).toFixed(1)
        : "unknown";
      lines.push(`- ${m.emergencyType} emergency, ${m.peopleCount} people, status: ${m.status}, victim location: (${m.latitude}, ${m.longitude}), distance: ${dist} km`);
      if (m.userName) lines.push(`  Victim: ${m.userName}${m.userPhone ? `, phone: ${m.userPhone}` : ""}`);
      if (m.description) lines.push(`  Description: ${m.description}`);
    }
  }
  return lines.join("\n");
}

export const chat: RequestHandler = async (req, res) => {
  const { messages, emergencyType } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }
  if (!req.user) { res.status(401).json({ error: "Not authenticated" }); return; }

  try {
    const context = req.user.role === "victim"
      ? await buildVictimContext(req.user.userId)
      : await buildVolunteerContext(req.user.userId);

    const reply = await aiService.chat(messages, req.user.role, context, emergencyType);
    res.json({ role: "assistant", content: reply });
  } catch (err) {
    console.error("[AI chat] error:", err);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};

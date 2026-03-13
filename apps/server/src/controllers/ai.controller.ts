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
  const { keyword } = req.body;
  if (!keyword || typeof keyword !== "string") {
    res.status(400).json({ error: "keyword is required" });
    return;
  }

  try {
    const summary = await aiService.summarizeSocialMedia(keyword);
    res.json(summary);
  } catch (err) {
    console.error("[AI summarize] error:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};

export const chat: RequestHandler = async (req, res) => {
  const { messages, emergencyType } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  try {
    const reply = await aiService.chatWithVictim(messages, emergencyType);
    res.json({ role: "assistant", content: reply });
  } catch (err) {
    console.error("[AI chat] error:", err);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};

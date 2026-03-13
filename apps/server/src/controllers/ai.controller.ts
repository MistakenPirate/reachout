import type { RequestHandler } from "express";
import * as aiService from "../services/ai.service.js";
import * as disasterRepo from "../repositories/disaster.repository.js";

export const prioritizeRequests: RequestHandler = async (_req, res) => {
  const allRequests = await disasterRepo.findAllHelpRequestsFull();
  const pending = allRequests.filter((r) => r.status === "pending");

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
};

export const summarizeSocialMedia: RequestHandler = async (req, res) => {
  const { keyword } = req.body;
  if (!keyword || typeof keyword !== "string") {
    res.status(400).json({ error: "keyword is required" });
    return;
  }

  const summary = await aiService.summarizeSocialMedia(keyword);
  res.json(summary);
};

export const chat: RequestHandler = async (req, res) => {
  const { messages, emergencyType } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const reply = await aiService.chatWithVictim(messages, emergencyType);
  res.json({ role: "assistant", content: reply });
};

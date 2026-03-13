import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = Router();

// AI prioritization (admin only)
router.post("/prioritize", authenticate, authorize("admin"), aiController.prioritizeRequests);

// AI social media summary (admin only)
router.post("/summarize", authenticate, authorize("admin"), aiController.summarizeSocialMedia);

// AI chatbot (victims & volunteers)
router.post("/chat", authenticate, authorize("victim", "volunteer"), aiController.chat);

export default router;

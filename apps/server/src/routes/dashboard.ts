import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = Router();

// Admin coordination dashboard
router.get(
	"/admin",
	authenticate,
	authorize("admin"),
	dashboardController.getDashboardData,
);

// Victim rescue tracking
router.get(
	"/rescue-status",
	authenticate,
	authorize("victim"),
	dashboardController.getRescueStatus,
);

export default router;

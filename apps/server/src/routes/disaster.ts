import { Router } from "express";
import * as disasterController from "../controllers/disaster.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = Router();

router.get("/map", disasterController.getMapData);
router.post(
	"/zones",
	authenticate,
	authorize("admin"),
	disasterController.createDisasterZone,
);
router.post(
	"/resources",
	authenticate,
	authorize("admin"),
	disasterController.createResource,
);

export default router;

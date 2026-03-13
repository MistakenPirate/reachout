import { Router } from "express";
import * as volunteerController from "../controllers/volunteer.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = Router();

router.get("/profile", authenticate, authorize("volunteer"), volunteerController.getProfile);
router.patch("/profile", authenticate, authorize("volunteer"), volunteerController.updateProfile);

export default router;

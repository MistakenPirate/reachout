import { Router } from "express";
import * as helpRequestController from "../controllers/helpRequest.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = Router();

router.post("/", authenticate, authorize("victim"), helpRequestController.create);
router.get("/mine", authenticate, authorize("victim"), helpRequestController.getMyRequests);
router.patch("/:id/resolve", authenticate, authorize("victim"), helpRequestController.resolve);

export default router;

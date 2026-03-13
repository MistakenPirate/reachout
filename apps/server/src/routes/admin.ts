import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = Router();

// All admin routes require admin role
router.use(authenticate, authorize("admin"));

// Help request management
router.get("/requests/pending", adminController.getPendingRequests);
router.get("/requests/:id/volunteers", adminController.getSuggestedVolunteers);
router.post("/requests/:id/assign", adminController.assignVolunteer);

// Disaster zones
router.post("/zones", adminController.createZone);

// Resources
router.post("/resources", adminController.createResource);
router.post("/resources/:id/allocate", adminController.allocateResource);

export default router;

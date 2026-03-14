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
router.get("/zones", adminController.getZones);
router.post("/zones", adminController.createZone);
router.delete("/zones/:id", adminController.deleteZone);

// Resources
router.get("/resources", adminController.getResources);
router.post("/resources", adminController.createResource);
router.delete("/resources/:id", adminController.deleteResource);
router.post("/resources/:id/allocate", adminController.allocateResource);

export default router;

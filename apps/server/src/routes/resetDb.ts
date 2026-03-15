import { type Router as RouterType, Router } from "express";
import { clearDatabase, seedDatabase } from "../db/reset.js";

const router: RouterType = Router();

router.post("/", async (_req, res) => {
  try {
    await clearDatabase();
    await seedDatabase();
    res.json({ status: "ok", message: "Database cleared and reseeded" });
  } catch (err) {
    console.error("Reset failed:", err);
    res.status(500).json({ status: "error", message: "Database reset failed" });
  }
});

export default router;

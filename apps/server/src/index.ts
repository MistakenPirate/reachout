import "dotenv/config";
import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import disasterRoutes from "./routes/disaster.js";
import helpRequestRoutes from "./routes/helpRequest.js";
import volunteerRoutes from "./routes/volunteer.js";
import adminRoutes from "./routes/admin.js";
import aiRoutes from "./routes/ai.js";
import dashboardRoutes from "./routes/dashboard.js";
import { initWebSocket } from "./ws.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/disaster", disasterRoutes);
app.use("/api/help-requests", helpRequestRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);

const server = createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

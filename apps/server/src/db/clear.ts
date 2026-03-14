import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function clear() {
  console.log("Clearing all data...");

  await db.delete(schema.resources);
  console.log("  Cleared resources");

  await db.delete(schema.helpRequests);
  console.log("  Cleared help_requests");

  await db.delete(schema.volunteers);
  console.log("  Cleared volunteers");

  await db.delete(schema.disasterZones);
  console.log("  Cleared disaster_zones");

  await db.delete(schema.users);
  console.log("  Cleared users");

  console.log("\nAll data cleared!");
  await sql.end();
}

clear().catch((err) => {
  console.error("Clear failed:", err);
  process.exit(1);
});

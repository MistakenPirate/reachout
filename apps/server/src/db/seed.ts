import "dotenv/config";
import postgres from "postgres";
import { seedDatabase } from "./reset.js";

const sql = postgres(process.env.DATABASE_URL!);

seedDatabase()
  .then(() => {
    console.log("Seed complete!");
    return sql.end();
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });

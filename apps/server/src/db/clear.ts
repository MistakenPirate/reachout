import "dotenv/config";
import postgres from "postgres";
import { clearDatabase } from "./reset.js";

const sql = postgres(process.env.DATABASE_URL!);

clearDatabase()
  .then(() => {
    console.log("All data cleared!");
    return sql.end();
  })
  .catch((err) => {
    console.error("Clear failed:", err);
    process.exit(1);
  });

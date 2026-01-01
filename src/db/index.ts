import { env } from "@/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const pool = new Pool({ connectionString: env.DB_URL });

export const db = drizzle(pool, {
  schema,
});

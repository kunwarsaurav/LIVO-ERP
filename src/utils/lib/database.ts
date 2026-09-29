// lib/db.ts
import { Pool } from "pg";

const DATABASE_URL = process.env.POSTGRE_SQL_URI || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("POSTGRE_SQL_URI / DATABASE_URL is not defined in environment variables");
}

declare global {
  var pgPool: Pool | undefined;
}

export const db: Pool =
  global.pgPool ??
  (global.pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
  }));


// scripts/apply-schema.mjs
// Apply schema.sql directly via Postgres connection
// Requires DB connection string in DATABASE_URL or parsed from env.
//
// Usage: SUPABASE_DB_HOST=... SUPABASE_DB_PASSWORD=... node scripts/apply-schema.mjs
// Or set DATABASE_URL=postgresql://postgres:PWD@db.PROJECT.supabase.co:5432/postgres
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";
import { config as loadEnv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "..", ".env.local") });

const PROJECT_HOST = process.env.SUPABASE_DB_HOST;
const PROJECT_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const PROJECT_REF =
  process.env.SUPABASE_DB_REF ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];

let connStr = process.env.DATABASE_URL;
if (!connStr) {
  if (!PROJECT_PASSWORD) {
    console.error("Set DATABASE_URL or SUPABASE_DB_PASSWORD");
    process.exit(1);
  }
  if (!PROJECT_HOST && PROJECT_REF) {
    connStr = `postgresql://postgres:${encodeURIComponent(
      PROJECT_PASSWORD
    )}@db.${PROJECT_REF}.supabase.co:5432/postgres`;
  } else if (PROJECT_HOST) {
    connStr = `postgresql://postgres:${encodeURIComponent(
      PROJECT_PASSWORD
    )}@${PROJECT_HOST}:5432/postgres`;
  }
}

const sql = readFileSync(
  path.resolve(__dirname, "..", "supabase", "schema.sql"),
  "utf8"
);

const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log("Connected. Applying schema.sql…");
await client.query(sql);
await client.end();
console.log("Schema applied successfully.");
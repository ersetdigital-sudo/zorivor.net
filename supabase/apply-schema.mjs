// scripts/apply-schema.mjs
// Apply schema.sql directly via Supavisor session mode (IPv4 friendly).
//
// Connects via the Shared Pooler in session mode (port 5432 on aws-0-*.pooler.supabase.com)
// which works on IPv4-only networks. The username format is postgres.<PROJECT_REF>.
//
// Required env:
//   SUPABASE_DB_PASSWORD
// Optional:
//   SUPABASE_DB_POOLER_HOST (default: aws-0-ap-northeast-1.pooler.supabase.com for Tokyo)
//   SUPABASE_DB_USER (default: postgres.<ref>)
//   SUPABASE_DB_PORT (default: 5432 for session mode)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";
import { config as loadEnv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "..", ".env.local") });

const PROJECT_REF =
  process.env.SUPABASE_DB_REF ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const PROJECT_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const POOLER_HOST =
  process.env.SUPABASE_DB_POOLER_HOST ||
  "aws-0-ap-northeast-1.pooler.supabase.com";
const DB_PORT = Number(process.env.SUPABASE_DB_PORT || 5432);
const DB_USER =
  process.env.SUPABASE_DB_USER || (PROJECT_REF ? `postgres.${PROJECT_REF}` : "postgres");

if (!PROJECT_REF || !PROJECT_PASSWORD) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_DB_REF) and SUPABASE_DB_PASSWORD in .env.local"
  );
  process.exit(1);
}

const sql = readFileSync(
  path.resolve(__dirname, "..", "supabase", "schema.sql"),
  "utf8"
);

const client = new pg.Client({
  user: DB_USER,
  password: PROJECT_PASSWORD,
  host: POOLER_HOST,
  port: DB_PORT,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

console.log(`Connecting to ${POOLER_HOST}:${DB_PORT} as ${DB_USER}…`);
await client.connect();
console.log("Connected. Applying schema.sql…");
await client.query(sql);
await client.end();
console.log("Schema applied successfully.");
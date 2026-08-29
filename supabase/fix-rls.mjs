// scripts/fix-rls.mjs — apply RLS fix via Supavisor session mode
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";
import { config as loadEnv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "..", ".env.local") });

const ref =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const password = process.env.SUPABASE_DB_PASSWORD;
const host = process.env.SUPABASE_DB_POOLER_HOST || "aws-0-ap-northeast-1.pooler.supabase.com";

if (!ref || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD");
  process.exit(1);
}

const sql = readFileSync(path.resolve(__dirname, "fix-rls-recursion.sql"), "utf8");

const client = new pg.Client({
  user: `postgres.${ref}`,
  password,
  host,
  port: 5432,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

console.log(`Connecting to ${host}:5432 as postgres.${ref}…`);
await client.connect();
await client.query(sql);
await client.end();
console.log("RLS fix applied.");
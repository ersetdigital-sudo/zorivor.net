import pg from "pg";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

const ref = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)/)[1];
const password = process.env.SUPABASE_DB_PASSWORD;
const host = process.env.SUPABASE_DB_POOLER_HOST || "aws-0-ap-northeast-1.pooler.supabase.com";

const client = new pg.Client({
  user: `postgres.${ref}`,
  password,
  host,
  port: 5432,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

// Add columns
await client.query("ALTER TABLE public.games ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false");
await client.query("ALTER TABLE public.games ADD COLUMN IF NOT EXISTS is_hot boolean DEFAULT false");
console.log("Columns added");

// Mark popular games
await client.query("UPDATE public.games SET is_popular = true WHERE name IN ('Mobile Legends', 'Free Fire', 'PUBG Mobile', 'Genshin Impact', 'Magic Chess: Go Go') AND is_popular = false");
console.log("Popular games marked");

// Verify
const r = await client.query("SELECT name, is_popular, is_hot FROM public.games ORDER BY sort_order");
console.table(r.rows);

await client.end();
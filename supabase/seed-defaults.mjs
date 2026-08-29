// scripts/seed-defaults.mjs
// Idempotent: insert site_settings keys only if they don't exist
import pg from "pg";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

const ref = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)/)[1];
const c = new pg.Client({
  user: `postgres.${ref}`,
  password: process.env.SUPABASE_DB_PASSWORD,
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const seeds = [
  { key: "support_whatsapp", value: "6281234567890" },
];

for (const s of seeds) {
  await c.query(
    `insert into public.site_settings (key, value)
     values ($1, to_jsonb($2::text))
     on conflict (key) do nothing`,
    [s.key, s.value]
  );
  console.log("seeded (or kept):", s.key, "=", s.value);
}
await c.end();
// scripts/bootstrap-admin.mjs
// One-off script to:
//  1. Create the admin auth user in Supabase
//  2. Insert the admin role so the dashboard recognises them
//
// Usage (from D:\zorivor\web):
//   node supabase/bootstrap-admin.mjs
//
// Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
// Will be DELETED after admin is bootstrapped.

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "..", ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !key || !email || !password) {
  console.error("Missing env vars (URL / SERVICE_ROLE / ADMIN_EMAIL / ADMIN_PASSWORD)");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function ensureUser() {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = list.users.find((u) => u.email === email);
  if (existing) {
    console.log("User exists:", existing.id, existing.email);
    return existing;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  console.log("Created user:", data.user.id);
  return data.user;
}

async function ensureRole(userId) {
  const { data, error } = await admin
    .from("admin_roles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code === "PGRST205") {
    console.error("\n⚠ Table 'admin_roles' belum ada.");
    console.error("Buka Supabase Dashboard → SQL Editor → jalankan isi file:");
    console.error("  supabase/schema.sql\n");
    console.error("Lalu jalankan ulang script ini.");
    process.exit(2);
  }

  if (data) {
    console.log("admin_roles row exists");
    return;
  }
  const { error: insErr } = await admin.from("admin_roles").insert({
    user_id: userId,
    email,
    is_super_admin: true,
  });
  if (insErr) throw insErr;
  console.log("admin_roles row inserted");
}

const user = await ensureUser();
await ensureRole(user.id);
console.log("\nDone. Now login at https://zorivor.net/admin/login");
console.log("Email:   ", email);
console.log("Password:", password);
# Zorivor — Next.js + Supabase

Top-up game web app (zorivor.net) — Next.js 14 App Router + Supabase (Postgres + Auth + RLS).

## Stack

- Next.js 14 (App Router, Server Components, Server Actions)
- Supabase (Postgres, Auth, RLS)
- Tailwind CSS v4
- TypeScript

## Setup

### 1. Install deps

```bash
npm install
```

### 2. Configure env

Copy `.env.example` → `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_PASSWORD` (the Postgres password set when the project was created — used to apply schema + verify)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`

### 3. Apply database schema (one-time)

```bash
node supabase/apply-schema.mjs
```

This connects via Supavisor session mode (`aws-0-<region>.pooler.supabase.com:5432`, IPv4-friendly) and applies `supabase/schema.sql` — creates tables (`admin_roles`, `products`, `orders`, `site_settings`), RLS policies, and seed data.

### 4. Bootstrap admin user

```bash
node supabase/bootstrap-admin.mjs
```

Creates the auth user (via service role) and inserts the `admin_roles` row.

### 5. Run

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## Admin dashboard

`/admin` — overview stats, 7-day chart, recent orders, status counts.

`/admin/orders` — full order list with status filter + search, status transitions, internal notes.

`/admin/products` — CRUD for game catalog (ML/FF/PUBG/Genshin/Valorant etc.).

`/admin/settings` — view `site_settings` key-value config (cashback %, payment methods, hero copy).

## Security model

- Public can: read active products, create orders, lookup their own invoice.
- Authenticated admins can: manage everything (RLS via `admin_roles` table).
- Service role key is server-only — never exposed to the browser.

## Wiring summary

| Public action | Where |
|---|---|
| Browse / search products | `app/page.tsx` (server-rendered from `products` table via Supabase) |
| Submit top-up form | `app/topup/page.tsx` → `app/actions.ts:createOrder` |
| Lookup invoice | `app/transactions/page.tsx` → `app/actions.ts:lookupOrder` |
| Confirm order | `app/topup/success/page.tsx` (uses `?invoice=`) |

| Admin action | Where |
|---|---|
| Sign in | `app/admin/login/page.tsx` |
| Auth gate | `middleware.ts` |
| Status transitions | `app/admin/actions.ts:updateOrderStatus` |
| Product CRUD | `app/admin/products/ProductRow.tsx` |

## Deploy

Recommended: Vercel.

1. Push to GitHub (this repo).
2. Import project in Vercel.
3. Copy values from `.env.vercel` (gitignored, contains the prod keys) into Vercel Project Settings → Environment Variables.
4. Apply schema (already done — see Setup steps above) before first request.
5. Bootstrap admin (already done — see Setup steps above).
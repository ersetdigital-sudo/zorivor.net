-- =============================================================
-- Zorivor Schema
-- Run this in Supabase SQL Editor (Project -> SQL Editor -> New query)
-- =============================================================

-- 1. Admin roles table (links Supabase auth.users -> admin flag)
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  is_super_admin boolean default false,
  created_at timestamptz default now()
);

alter table public.admin_roles enable row level security;

-- Helper function: bypass RLS to check admin status without recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
  );
$$;

drop policy if exists "authenticated can read admin_roles" on public.admin_roles;
create policy "authenticated can read admin_roles"
  on public.admin_roles for select
  to authenticated
  using (true);

-- 2. Products / game catalog
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  game text not null,
  category text not null,
  denomination text not null,
  price_idr integer not null,
  base_price_idr integer,
  cashback_pct numeric default 0,
  stock integer default 999,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_game on public.products(game);
create index if not exists idx_products_active on public.products(is_active);

alter table public.products enable row level security;

drop policy if exists "public can read active products" on public.products;
create policy "public can read active products"
  on public.products for select using (is_active = true);

drop policy if exists "admins can manage products" on public.products;
create policy "admins can manage products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Orders / Top-up transactions
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  invoice text unique not null,
  product_id uuid references public.products(id),
  game text not null,
  denomination text not null,
  game_user_id text not null,
  game_server_id text,
  whatsapp text,
  payment_method text,
  amount_idr integer not null,
  cashback_idr integer default 0,
  status text default 'pending'
    check (status in ('pending','paid','processing','success','failed','refunded')),
  paid_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_invoice on public.orders(invoice);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);

alter table public.orders enable row level security;

drop policy if exists "anyone can insert orders" on public.orders;
create policy "anyone can insert orders"
  on public.orders for insert with check (true);

drop policy if exists "public can read their invoice" on public.orders;
create policy "public can read their invoice"
  on public.orders for select using (true);

drop policy if exists "admins can update orders" on public.orders;
create policy "admins can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin());

-- 4. Site settings (key-value config editable from admin)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "public can read site_settings" on public.site_settings;
create policy "public can read site_settings"
  on public.site_settings for select using (true);

drop policy if exists "admins can manage site_settings" on public.site_settings;
create policy "admins can manage site_settings"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated
  before update on public.orders
  for each row execute function public.set_updated_at();

-- 6. Seed: default site settings
insert into public.site_settings (key, value) values
  ('site_name', '"Zorivor"'::jsonb),
  ('cashback_global_pct', '5'::jsonb),
  ('payment_methods', '["QRIS","OVO","DANA","GoPay","ShopeePay","BCA","BNI","BRI","Mandiri","DANA Bisnis"]'::jsonb),
  ('hero_title', '"Top Up Game Termurah, Tanpa Biaya Admin"'::jsonb)
on conflict (key) do nothing;

-- 7. Seed: sample products
insert into public.products (slug, game, category, denomination, price_idr, base_price_idr, cashback_pct, sort_order) values
  ('ml-5', 'Mobile Legends', 'Diamond', '5 Diamond', 1500, 1700, 4, 1),
  ('ml-12', 'Mobile Legends', 'Diamond', '12 Diamond', 3400, 3700, 4, 2),
  ('ml-28', 'Mobile Legends', 'Diamond', '28 Diamond', 7900, 8500, 4, 3),
  ('ml-86', 'Mobile Legends', 'Diamond', '86 Diamond', 23000, 25000, 5, 4),
  ('ml-172', 'Mobile Legends', 'Diamond', '172 Diamond', 46000, 49000, 5, 5),
  ('ml-257', 'Mobile Legends', 'Diamond', '257 Diamond', 68500, 72000, 6, 6),
  ('ml-706', 'Mobile Legends', 'Diamond', '706 Diamond', 184000, 192000, 7, 7),
  ('ml-1412', 'Mobile Legends', 'Diamond', '1412 Diamond', 362000, 378000, 7, 8),
  ('ml-2195', 'Mobile Legends', 'Diamond', '2195 Diamond', 540000, 565000, 8, 9),
  ('ml-weekly', 'Mobile Legends', 'Paket', 'Weekly Pass', 27500, 29500, 4, 10),
  ('ml-twilight', 'Mobile Legends', 'Paket', 'Twilight Pass', 145000, 152000, 6, 11),
  ('ml-starlight', 'Mobile Legends', 'Paket', 'Starlight', 149000, 156000, 6, 12)
on conflict (slug) do nothing;
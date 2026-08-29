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

-- 2. Games (parent catalog — covers + publisher info)
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  publisher text,
  category text default 'topup',
  cover_public_id text,
  cover_url text,
  description text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_games_active on public.games(is_active);

alter table public.games enable row level security;

drop policy if exists "public can read active games" on public.games;
create policy "public can read active games"
  on public.games for select using (is_active = true);

drop policy if exists "admins can manage games" on public.games;
create policy "admins can manage games"
  on public.games for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists trg_games_updated on public.games;
create trigger trg_games_updated
  before update on public.games
  for each row execute function public.set_updated_at();

-- 3. Products (game-specific denominations)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  game_id uuid references public.games(id) on delete set null,
  game text not null,
  category text not null,
  denomination text not null,
  price_idr integer not null,
  base_price_idr integer,
  cashback_pct numeric default 0,
  stock integer default 999,
  is_active boolean default true,
  sort_order integer default 0,
  icon_public_id text,
  icon_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Migrations for existing prod table (idempotent)
alter table public.products add column if not exists game_id uuid references public.games(id) on delete set null;
alter table public.products add column if not exists icon_public_id text;
alter table public.products add column if not exists icon_url text;

create index if not exists idx_products_game on public.products(game);
create index if not exists idx_products_game_id on public.products(game_id);
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

drop policy if exists "admins can delete orders" on public.orders;
create policy "admins can delete orders"
  on public.orders for delete
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

-- 4b. Payment methods (per-method config: name, group, fee, enabled, icon, image)
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text not null,
  group_label text not null,
  fee_idr integer default 0,
  sub_label text,
  is_enabled boolean default true,
  sort_order integer default 0,
  icon_color text default '#7C5CFF',
  image_public_id text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Idempotent migration for existing prod table
alter table public.payment_methods
  add column if not exists image_public_id text,
  add column if not exists image_url text;

alter table public.payment_methods enable row level security;

drop policy if exists "public can read enabled payment_methods" on public.payment_methods;
create policy "public can read enabled payment_methods"
  on public.payment_methods for select using (is_enabled = true);

drop policy if exists "admins can manage payment_methods" on public.payment_methods;
create policy "admins can manage payment_methods"
  on public.payment_methods for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4c. QRIS images (Cloudinary-backed uploads — stores metadata + URL)
create table if not exists public.qris_uploads (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  cloudinary_public_id text not null,
  cloudinary_url text not null,
  width integer,
  height integer,
  bytes integer,
  is_active boolean default true,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.qris_uploads enable row level security;

drop policy if exists "public can read active qris" on public.qris_uploads;
create policy "public can read active qris"
  on public.qris_uploads for select using (is_active = true);

drop policy if exists "admins can manage qris" on public.qris_uploads;
create policy "admins can manage qris"
  on public.qris_uploads for all
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

drop trigger if exists trg_payment_methods_updated on public.payment_methods;
create trigger trg_payment_methods_updated
  before update on public.payment_methods
  for each row execute function public.set_updated_at();

-- 6. Seed: default site settings
insert into public.site_settings (key, value) values
  ('site_name', '"Zorivor"'::jsonb),
  ('cashback_global_pct', '5'::jsonb),
  ('payment_methods', '["QRIS","OVO","DANA","GoPay","ShopeePay","BCA","BNI","BRI","Mandiri","DANA Bisnis"]'::jsonb),
  ('hero_title', '"Top Up Game Termurah, Tanpa Biaya Admin"'::jsonb)
on conflict (key) do nothing;

-- 7. Seed: games
insert into public.games (slug, name, publisher, category, cover_url, description, sort_order) values
  ('mobile-legends', 'Mobile Legends', 'Moonton', 'populer',
    '/images/73f2aa19-ccb6-481f-85c5-3f867e3b2a1f.png',
    'Top up diamond Mobile Legends harga termurah.', 1),
  ('free-fire', 'Free Fire', 'Garena', 'populer',
    '/images/9b0ee7e6-306d-4168-83f4-93b4c6e5aee5.webp',
    'Top up diamond Free Fire proses instan.', 2),
  ('pubg-mobile', 'PUBG Mobile', 'Tencent', 'populer',
    '/images/a14f845b-125a-4af4-bca2-1de3d469f6fd.png',
    'Top up UC PUBG Mobile aman dan cepat.', 3),
  ('genshin-impact', 'Genshin Impact', 'HoYoverse', 'populer',
    '/images/22a5de62-a708-4599-9068-13a7300bfefb.png',
    'Top up Genesis Crystal Genshin Impact original.', 4),
  ('magic-chess', 'Magic Chess: Go Go', 'Moonton', 'populer',
    '/images/aad53178-087b-4d6c-8ad1-daebad3f6cf0.png',
    'Top up Magic Chess Go Go chip.', 5),
  ('valorant', 'Valorant', 'Riot Games', 'topup', null, 'Valorant Points.', 6)
on conflict (slug) do nothing;

-- 8. Backfill: link any products whose game_id is NULL to their game by name
update public.products p
set game_id = g.id
from public.games g
where p.game_id is null and p.game = g.name;

-- 9. Seed: products (use game slug → join via subquery)
insert into public.products (slug, game_id, game, category, denomination, price_idr, base_price_idr, cashback_pct, sort_order)
values
  ('ml-5',     (select id from public.games where slug='mobile-legends'), 'Mobile Legends', 'Diamond', '5 Diamond',    1500,   1700,  4, 1),
  ('ml-12',    (select id from public.games where slug='mobile-legends'), 'Mobile Legends', 'Diamond', '12 Diamond',   3400,   3700,  4, 2),
  ('ml-28',    (select id from public.games where slug='mobile-legends'), 'Mobile Legends', 'Diamond', '28 Diamond',   7900,   8500,  4, 3),
  ('ml-86',    (select id from public.games where slug='mobile-legends'), 'Mobile Legends', 'Diamond', '86 Diamond',  23000,  25000,  5, 4),
  ('ml-172',   (select id from public.games where slug='mobile-legends'), 'Mobile Legends', 'Diamond', '172 Diamond', 46000,  49000,  5, 5),
  ('ml-257',   (select id from public.games where slug='mobile-legends'), 'Mobile Legends', 'Diamond', '257 Diamond', 68500,  72000,  6, 6),
  ('ml-706',   (select id from public.games where slug='mobile-legends'), 'Mobile Legends', 'Diamond', '706 Diamond',184000, 192000,  7, 7),
  ('ml-1412',  (select id from public.games where slug='mobile-legends'), 'Mobile Legends', 'Diamond', '1412 Diamond',362000,378000, 7, 8),
  ('ml-2195',  (select id from public.games where slug='mobile-legends'), 'Mobile Legends', 'Diamond', '2195 Diamond',540000,565000, 8, 9),
  ('ml-weekly',(select id from public.games where slug='mobile-legends'), 'Mobile Legends', 'Paket',   'Weekly Pass', 27500, 29500, 4, 10),
  ('ml-twilight',(select id from public.games where slug='mobile-legends'),'Mobile Legends','Paket','Twilight Pass',145000,152000,6,11),
  ('ml-starlight',(select id from public.games where slug='mobile-legends'),'Mobile Legends','Paket','Starlight',   149000,156000,6,12),
  ('ff-70',    (select id from public.games where slug='free-fire'),     'Free Fire',      'Diamond', '70 Diamond',  10000,  11000,  5, 13),
  ('ff-355',   (select id from public.games where slug='free-fire'),     'Free Fire',      'Diamond', '355 Diamond', 50000,  53000,  6, 14),
  ('ff-720',   (select id from public.games where slug='free-fire'),     'Free Fire',      'Diamond', '720 Diamond',100000, 105000,  7, 15),
  ('pubg-60',  (select id from public.games where slug='pubg-mobile'),   'PUBG Mobile',    'UC',      '60 UC',       14000,  15000,  5, 16),
  ('pubg-325', (select id from public.games where slug='pubg-mobile'),   'PUBG Mobile',    'UC',      '325 UC',      75000,  80000,  6, 17),
  ('pubg-660', (select id from public.games where slug='pubg-mobile'),   'PUBG Mobile',    'UC',      '660 UC',     150000, 158000,  7, 18),
  ('gi-60',    (select id from public.games where slug='genshin-impact'),'Genshin Impact', 'Genesis', '60 Genesis',  16000,  17500,  5, 19),
  ('gi-300',   (select id from public.games where slug='genshin-impact'),'Genshin Impact', 'Genesis', '300 Genesis', 78000,  82000,  6, 20),
  ('gi-980',   (select id from public.games where slug='genshin-impact'),'Genshin Impact', 'Genesis', '980 Genesis',245000, 258000,  7, 21),
  ('val-125',  (select id from public.games where slug='valorant'),      'Valorant',       'Points',  '125 Points',  15000,  16500,  5, 22),
  ('val-700',  (select id from public.games where slug='valorant'),      'Valorant',       'Points',  '700 Points',  80000,  85000,  6, 23)
on conflict (slug) do nothing;

-- 8. Seed: payment methods (used by /topup)
insert into public.payment_methods (code, label, group_label, fee_idr, sub_label, is_enabled, sort_order, icon_color) values
  ('qris', 'QRIS', 'QRIS', 0, 'Semua e-wallet & m-banking', true, 1, '#22E1C4'),
  ('dana', 'DANA', 'E-Wallet', 0, 'Instan', true, 2, '#1E4FFF'),
  ('gopay', 'GoPay', 'E-Wallet', 0, 'Instan', true, 3, '#00AA13'),
  ('ovo', 'OVO', 'E-Wallet', 0, 'Instan', true, 4, '#4F2D7F'),
  ('shopeepay', 'ShopeePay', 'E-Wallet', 0, 'Instan', true, 5, '#EE4D2D'),
  ('bca_va', 'BCA VA', 'Virtual Account', 4000, null, true, 6, '#003D7A'),
  ('bri_va', 'BRI VA', 'Virtual Account', 4000, null, true, 7, '#005E9E'),
  ('mandiri_va', 'Mandiri VA', 'Virtual Account', 4000, null, true, 8, '#FFB300'),
  ('bni_va', 'BNI VA', 'Virtual Account', 4000, null, true, 9, '#F08200'),
  ('alfamart', 'Alfamart', 'Gerai Retail', 5000, null, true, 10, '#E11A1A'),
  ('indomaret', 'Indomaret', 'Gerai Retail', 5000, null, true, 11, '#E11A1A')
on conflict (code) do nothing;
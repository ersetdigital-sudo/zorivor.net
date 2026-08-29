-- Fix infinite recursion in admin_roles RLS policy
-- Run in Supabase SQL Editor

-- Drop the recursive policies
drop policy if exists "admins can read admin_roles" on public.admin_roles;
drop policy if exists "admins can manage products" on public.products;
drop policy if exists "admins can update orders" on public.orders;
drop policy if exists "admins can manage site_settings" on public.site_settings;

-- Helper function: check if current user is admin (bypasses RLS to avoid recursion)
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

-- admin_roles: allow read to anyone authenticated, write only via service role
drop policy if exists "authenticated can read admin_roles" on public.admin_roles;
create policy "authenticated can read admin_roles"
  on public.admin_roles for select
  to authenticated
  using (true);

-- Products: admins can manage (using helper function)
create policy "admins can manage products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Orders: admins can update
create policy "admins can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin());

-- site_settings: admins can manage
create policy "admins can manage site_settings"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
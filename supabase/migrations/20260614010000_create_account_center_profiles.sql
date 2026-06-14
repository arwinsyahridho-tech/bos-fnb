-- Account Center BIYA: tabel profile, ownership RLS, dan hak akses authenticated.
-- Migration ini idempotent dan juga memperbaiki tabel yang sudah terbuat sebagian.

begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.account_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text default 'Owner',
  plan text default 'Free Plan',
  plan_name text default 'Free Plan',
  account_status text default 'Active',
  subscription_status text default 'Active',
  subscription_start timestamptz,
  subscription_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.account_profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists role text default 'Owner',
  add column if not exists plan text default 'Free Plan',
  add column if not exists plan_name text default 'Free Plan',
  add column if not exists account_status text default 'Active',
  add column if not exists subscription_status text default 'Active',
  add column if not exists subscription_start timestamptz,
  add column if not exists subscription_end timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text,
  business_type text,
  owner_name text,
  phone text,
  email text,
  address text,
  city text,
  province text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.business_profiles
  add column if not exists business_name text,
  add column if not exists business_type text,
  add column if not exists owner_name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists province text,
  add column if not exists description text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.account_profiles enable row level security;
alter table public.business_profiles enable row level security;

drop policy if exists "BIYA users can view own account profile" on public.account_profiles;
drop policy if exists "BIYA users can insert own account profile" on public.account_profiles;
drop policy if exists "BIYA users can update own account profile" on public.account_profiles;

create policy "BIYA users can view own account profile"
on public.account_profiles for select to authenticated
using (auth.uid() = user_id);

create policy "BIYA users can insert own account profile"
on public.account_profiles for insert to authenticated
with check (auth.uid() = user_id);

create policy "BIYA users can update own account profile"
on public.account_profiles for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "BIYA users can view own business profile" on public.business_profiles;
drop policy if exists "BIYA users can insert own business profile" on public.business_profiles;
drop policy if exists "BIYA users can update own business profile" on public.business_profiles;

create policy "BIYA users can view own business profile"
on public.business_profiles for select to authenticated
using (auth.uid() = user_id);

create policy "BIYA users can insert own business profile"
on public.business_profiles for insert to authenticated
with check (auth.uid() = user_id);

create policy "BIYA users can update own business profile"
on public.business_profiles for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update on public.account_profiles to authenticated;
grant select, insert, update on public.business_profiles to authenticated;

commit;

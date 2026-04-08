-- ============================================================
-- MACO App — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  family_members text,
  role        text not null default 'member' check (role in ('member', 'admin', 'super_admin')),
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Subscriptions ─────────────────────────────────────────────
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id      text,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  status                  text not null default 'inactive' check (status in ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  plan_type               text default 'family_yearly',
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ── Noticeboard Posts ────────────────────────────────────────
create table public.noticeboard_posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  author_id   uuid references public.profiles(id) on delete set null,
  author_name text,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Events ───────────────────────────────────────────────────
create table public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  date         date not null,
  time         text,
  end_time     text,
  type         text default 'Service',
  members_only boolean not null default false,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Venue Bookings ────────────────────────────────────────────
create table public.venue_bookings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  family_name  text not null,
  date         date not null,
  start_time   text not null,
  end_time     text not null,
  purpose      text,
  notes        text,
  status       text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  amount       numeric(8,2),
  is_member    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles        enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.noticeboard_posts enable row level security;
alter table public.events          enable row level security;
alter table public.venue_bookings  enable row level security;

-- Helper: check role
create or replace function public.get_my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── profiles RLS ─────────────────────────────────────────────
-- Members can read their own profile
create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid());

-- Members can update their own profile (not role)
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can read all profiles
create policy "profiles: admins read all" on public.profiles
  for select using (public.get_my_role() in ('admin', 'super_admin'));

-- Super admins can update roles
create policy "profiles: super_admin update role" on public.profiles
  for update using (public.get_my_role() = 'super_admin');

-- ── subscriptions RLS ────────────────────────────────────────
create policy "subscriptions: read own" on public.subscriptions
  for select using (user_id = auth.uid());

create policy "subscriptions: admins read all" on public.subscriptions
  for select using (public.get_my_role() in ('admin', 'super_admin'));

-- Service role (Stripe webhook) can insert/update
create policy "subscriptions: service role manage" on public.subscriptions
  for all using (auth.role() = 'service_role');

-- ── noticeboard_posts RLS ────────────────────────────────────
-- All authenticated users can read
create policy "notices: authenticated read" on public.noticeboard_posts
  for select using (auth.uid() is not null);

-- Admins can insert/update/delete
create policy "notices: admins write" on public.noticeboard_posts
  for all using (public.get_my_role() in ('admin', 'super_admin'));

-- ── events RLS ───────────────────────────────────────────────
-- Public events are readable by everyone; members_only requires auth
create policy "events: public read" on public.events
  for select using (not members_only);

create policy "events: members read all" on public.events
  for select using (auth.uid() is not null);

-- Admins can write events
create policy "events: admins write" on public.events
  for all using (public.get_my_role() in ('admin', 'super_admin'));

-- ── venue_bookings RLS ───────────────────────────────────────
-- Members can read and create their own bookings
create policy "bookings: read own" on public.venue_bookings
  for select using (user_id = auth.uid());

create policy "bookings: insert own" on public.venue_bookings
  for insert with check (user_id = auth.uid());

-- Admins can read and manage all bookings
create policy "bookings: admins manage" on public.venue_bookings
  for all using (public.get_my_role() in ('admin', 'super_admin'));

-- ============================================================
-- Seed: set first super_admin by email
-- Replace with your actual email before running.
-- ============================================================
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your@email.com';

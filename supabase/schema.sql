-- ===========================================================================
-- Bhairavi Bhajans — Supabase Database Schema
-- Run this in the Supabase Dashboard -> SQL Editor (New query).
-- It creates the tables, triggers, and Row Level Security policies.
-- ===========================================================================

-- ------------------------------------------------------------------
-- Helpers
-- ------------------------------------------------------------------

create extension if not exists pgcrypto;

-- Auto-updates updated_at on any row change.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------------
-- Admin users table
-- After creating your admin via Supabase Auth (Dashboard -> Authentication
-- -> Users -> Add user), insert their email here to grant admin rights:
--   insert into public.admin_users (email) values ('you@example.com');
-- ------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Programs
-- ------------------------------------------------------------------
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  program_type text check (program_type in ('temple_festival','wedding','concert','religious','corporate','private','other')),
  date date not null,
  start_time text,   -- HH:mm (24h)
  end_time text,     -- HH:mm (24h)
  location text,
  status text not null default 'booked' check (status in ('booked','confirmed','completed','cancelled')),
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists programs_date_idx on public.programs (date);
create trigger programs_updated_at
  before update on public.programs
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------
-- Availability (manually blocked / marked-available dates)
-- ------------------------------------------------------------------
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  status text not null check (status in ('available','blocked')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger availability_updated_at
  before update on public.availability
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------
-- Enquiries / CRM leads
-- ------------------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  event_type text,
  event_date date,
  event_location text,
  message text,
  source text,
  status text not null default 'New' check (status in ('New','Contacted','Interested','Negotiating','Confirmed','Completed','Cancelled','Lost')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enquiries_status_idx on public.enquiries (status);
create index if not exists enquiries_created_at_idx on public.enquiries (created_at);
create trigger enquiries_updated_at
  before update on public.enquiries
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------
-- WhatsApp click tracking
-- ------------------------------------------------------------------
create table if not exists public.whatsapp_clicks (
  id uuid primary key default gen_random_uuid(),
  page text,
  program_id uuid references public.programs(id) on delete set null,
  visitor_id text,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_clicks_created_at_idx on public.whatsapp_clicks (created_at);

-- ------------------------------------------------------------------
-- Visitor analytics (custom page-view tracking)
-- ------------------------------------------------------------------
create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  path text not null,
  referrer text,
  user_agent text,
  device_type text,
  created_at timestamptz not null default now()
);

create index if not exists visitor_events_created_at_idx on public.visitor_events (created_at);
create index if not exists visitor_events_path_idx on public.visitor_events (path);

-- ===========================================================================
-- Row Level Security
-- Public users can read public program/availability info and submit enquiries.
-- Only admin users can manage/crm/analytics data.
-- ===========================================================================

alter table public.programs enable row level security;
alter table public.availability enable row level security;
alter table public.enquiries enable row level security;
alter table public.whatsapp_clicks enable row level security;
alter table public.visitor_events enable row level security;
alter table public.admin_users enable row level security;

-- Helper predicate used in admin policies below.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admin_users au
    where au.email = auth.jwt() ->> 'email'
  );
$$;

-- ------------------------- PROGRAMS --------------------------------
create policy "programs are readable by everyone"
  on public.programs for select
  using (true);

create policy "programs are manageable by admins"
  on public.programs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------- AVAILABILITY ------------------------------
create policy "availability is readable by everyone"
  on public.availability for select
  using (true);

create policy "availability is manageable by admins"
  on public.availability for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------- ENQUIRIES --------------------------------
-- Anyone can submit an enquiry (insert), but only admins can read/update/delete.
create policy "anyone can submit an enquiry"
  on public.enquiries for insert
  to anon, authenticated
  with check (true);

create policy "enquiries are manageable by admins"
  on public.enquiries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------- WHATSAPP CLICKS --------------------------
-- Anyone can record a click; only admins can read/delete.
create policy "anyone can record a whatsapp click"
  on public.whatsapp_clicks for insert
  to anon, authenticated
  with check (true);

create policy "whatsapp clicks are readable by admins"
  on public.whatsapp_clicks for select
  to authenticated
  using (public.is_admin());

create policy "whatsapp clicks are deleteable by admins"
  on public.whatsapp_clicks for delete
  to authenticated
  using (public.is_admin());

-- ------------------------- VISITOR EVENTS ---------------------------
-- Anyone can record a page view; only admins can read/delete.
create policy "anyone can record a visitor event"
  on public.visitor_events for insert
  to anon, authenticated
  with check (true);

create policy "visitor events are readable by admins"
  on public.visitor_events for select
  to authenticated
  using (public.is_admin());

create policy "visitor events are deleteable by admins"
  on public.visitor_events for delete
  to authenticated
  using (public.is_admin());

-- ------------------------- ADMIN USERS ------------------------------
create policy "admin users are selectable by admins"
  on public.admin_users for select
  to authenticated
  using (public.is_admin());
-- CITYAGENT 0001_core — Supabase Free (Postgres + PostGIS + pg_trgm)
-- Apply: supabase db push (or psql). Requires auth.users (Supabase Auth).
-- Local plain Postgres (infra/docker-compose.yml) lacks auth schema: create a stub
--   CREATE SCHEMA IF NOT EXISTS auth; CREATE TABLE IF NOT EXISTS auth.users(id uuid PRIMARY KEY);
-- before applying, for syntax check only.

create extension if not exists "pgcrypto";
create extension if not exists "postgis";
create extension if not exists "pg_trgm";

-- ---------- user profiles (1:1 with auth.users) ----------
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'seeker'
    check (role in ('seeker','owner','hotel','agent','admin')),
  display_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- locations (approx public, exact private) ----------
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  country text not null default 'Nigeria',
  state text not null,
  city text not null,
  lga text,
  district text,
  neighborhood text,
  landmark text,
  geom geography(Point, 4326),          -- exact, RLS-hidden from public
  approx_geom geography(Point, 4326),   -- rounded, publicly served
  created_at timestamptz not null default now()
);
create index if not exists locations_geom_idx on public.locations using gist ((geom::geometry));
create index if not exists locations_city_trgm on public.locations using gin (city gin_trgm_ops);

-- ---------- properties ----------
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.user_profiles(id) on delete cascade,
  lister_kind text not null default 'owner'
    check (lister_kind in ('owner','agent','hotel','manager')),
  title text not null,
  description text not null,
  property_type text not null
    check (property_type in ('apartment','self_contained','room','duplex','house','serviced','hotel','guest_house','short_let')),
  bedrooms int not null default 1 check (bedrooms >= 0),
  bathrooms int not null default 1 check (bathrooms >= 0),
  toilets int not null default 1 check (toilets >= 0),
  furnished boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft','submitted','in_review','verified','published','viewing','rented','expired','rejected')),
  price numeric(14,2) not null check (price >= 0),
  payment_frequency text not null default 'yearly'
    check (payment_frequency in ('nightly','monthly','yearly')),
  deposit numeric(14,2) not null default 0,
  service_charge numeric(14,2) not null default 0,
  agency_fee numeric(14,2) not null default 0,
  agreement_fee numeric(14,2) not null default 0,
  location_id uuid references public.locations(id) on delete set null,
  verification_level text not null default 'L1'
    check (verification_level in ('L1','L2','L3','L4')),
  featured boolean not null default false,
  search tsvector generated always as (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(property_type,''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_price_idx on public.properties (price);
create index if not exists properties_search_idx on public.properties using gin (search);
create index if not exists properties_owner_idx on public.properties (owner_id);

-- ---------- media ----------
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  sort int not null default 0,
  caption text,
  created_at timestamptz not null default now()
);
create index if not exists property_images_prop_idx on public.property_images (property_id, sort);

create table if not exists public.property_videos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

-- ---------- verification (Submit → Review → Verify → Approve → Publish) ----------
create table if not exists public.verification_records (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  level text not null check (level in ('L1','L2','L3','L4')),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','hold')),
  notes text,
  reviewer_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists verification_prop_idx on public.verification_records (property_id, status);

-- ---------- ownership docs (PRIVATE — never public) ----------
create table if not exists public.ownership_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  file_path text not null,   -- supabase private-docs bucket path
  doc_type text not null,
  created_at timestamptz not null default now()
);

-- ---------- favorites ----------
create table if not exists public.favorites (
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- ---------- chat ----------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  seeker_id uuid not null references public.user_profiles(id) on delete cascade,
  owner_id uuid not null references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.user_profiles(id) on delete cascade,
  body text not null,
  image_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_conv_idx on public.messages (conversation_id, created_at);

-- ---------- viewings ----------
create table if not exists public.viewing_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  seeker_id uuid not null references public.user_profiles(id) on delete cascade,
  owner_id uuid not null references public.user_profiles(id) on delete cascade,
  slot timestamptz not null,
  status text not null default 'requested'
    check (status in ('requested','accepted','rejected','countered','completed','cancelled')),
  counter_slot timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- reports (§25 taxonomy) ----------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  reporter_id uuid references public.user_profiles(id) on delete set null,
  reason text not null
    check (reason in ('fake','wrong_price','rented','fake_owner','misleading_photos','fraud','duplicate','wrong_location','harassment','other')),
  details text,
  status text not null default 'open'
    check (status in ('open','triaging','actioned','dismissed')),
  created_at timestamptz not null default now()
);
create index if not exists reports_prop_idx on public.reports (property_id, status);

-- ---------- reviews (moderated) ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  reviewer_id uuid not null references public.user_profiles(id) on delete cascade,
  accuracy smallint check (accuracy between 1 and 5),
  cleanliness smallint check (cleanliness between 1 and 5),
  communication smallint check (communication between 1 and 5),
  value smallint check (value between 1 and 5),
  overall smallint not null check (overall between 1 and 5),
  comment text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- ---------- notifications ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, read_at);

-- ---------- audit ----------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------- RLS (Supabase) ----------
alter table public.user_profiles enable row level security;
alter table public.locations enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_videos enable row level security;
alter table public.verification_records enable row level security;
alter table public.ownership_documents enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.viewing_requests enable row level security;
alter table public.reports enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Public can read published properties + media + approx locations only.
create policy "public published props" on public.properties
  for select using (status = 'published');
create policy "public prop media" on public.property_images
  for select using (exists (
    select 1 from public.properties p where p.id = property_id and p.status = 'published'));
create policy "public prop videos" on public.property_videos
  for select using (exists (
    select 1 from public.properties p where p.id = property_id and p.status = 'published'));

-- Owners manage own drafts; tighten per-endpoint in API (service role for admin queue).
create policy "owner read own" on public.properties
  for select using (auth.uid() = owner_id);
create policy "owner insert own" on public.properties
  for insert with check (auth.uid() = owner_id);
create policy "owner update own draft" on public.properties
  for update using (auth.uid() = owner_id and status in ('draft','rejected','expired'));

-- updated_at trigger
create or replace function public.touch_updated() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_props_touch on public.properties;
create trigger trg_props_touch before update on public.properties
  for each row execute function public.touch_updated();
drop trigger if exists trg_profiles_touch on public.user_profiles;
create trigger trg_profiles_touch before update on public.user_profiles
  for each row execute function public.touch_updated();

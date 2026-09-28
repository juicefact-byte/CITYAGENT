-- CITYAGENT 0001_core — free-tier Supabase Postgres (PostGIS + pg_trgm)
-- Apply: supabase db push (or psql). Buckets + Auth configured per supabase/README.md.

create extension if not exists postgis;
create extension if not exists pg_trgm;

-- Profiles mirror auth.users (id = auth.users.id). No FK to auth schema (managed by Supabase).
create table profiles (
  id uuid primary key,
  role text not null default 'seeker'
    check (role in ('guest','seeker','owner','hotel','agent','admin')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  lister_kind text not null default 'owner'
    check (lister_kind in ('owner','agent','hotel','manager')),
  title text not null,
  description text not null default '',
  property_type text not null default 'apartment'
    check (property_type in ('apartment','self_contained','room','duplex','house','serviced','hotel','guest_house','short_let')),
  bedrooms int not null default 1 check (bedrooms >= 0),
  bathrooms int not null default 1 check (bathrooms >= 0),
  furnished boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft','submitted','in_review','verified','published','viewing','rented','expired','rejected')),
  verification_level text not null default 'L1'
    check (verification_level in ('L1','L2','L3','L4')),
  rent_amount numeric(14,2) not null default 0,
  rent_period text not null default 'year' check (rent_period in ('night','month','year')),
  deposit numeric(14,2) not null default 0,
  service_charge numeric(14,2) not null default 0,
  other_fees numeric(14,2) not null default 0,
  agency_fee numeric(14,2) not null default 0,
  country text not null default 'Nigeria',
  state text not null default '',
  city text not null default '',
  area text not null default '',
  landmark text not null default '',
  geom geography(Point,4326),          -- exact, private until viewing accepted
  approx_geom geography(Point,4326),   -- rounded public location
  features text[] not null default '{}',
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index properties_geom_idx on properties using gist (geom);
create index properties_status_idx on properties (status);
create index properties_city_price_idx on properties (city, rent_amount);
create index properties_title_trgm on properties using gin (title gin_trgm_ops);

create table property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,          -- supabase bucket public-listings/...
  caption text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index property_images_prop_idx on property_images (property_id, sort);

create table verification_records (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  level text not null check (level in ('L1','L2','L3','L4')),
  result text not null default 'pending' check (result in ('pending','passed','failed')),
  reviewer_notes text not null default '',
  created_at timestamptz not null default now()
);

-- Private docs live in storage bucket private-docs/; table holds metadata only.
create table ownership_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,
  doc_type text not null default 'title' check (doc_type in ('title','id','photo','video','other')),
  created_at timestamptz not null default now()
);

create table favorites (
  profile_id uuid not null references profiles(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, property_id)
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  seeker_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index messages_conv_idx on messages (conversation_id, created_at);

create table viewing_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  seeker_id uuid not null references profiles(id) on delete cascade,
  slot timestamptz not null,
  status text not null default 'requested'
    check (status in ('requested','accepted','rejected','countered','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  reporter_id uuid references profiles(id) on delete set null,
  reason text not null check (reason in ('fake','wrong_price','rented','fake_owner','misleading_photos','fraud','duplicate','wrong_location','harassment','other')),
  details text not null default '',
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text not null default '',
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_profile_idx on notifications (profile_id, created_at desc);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  target text not null default '',
  created_at timestamptz not null default now()
);

-- RLS: pilot-open. Public reads published listings; owners manage own rows.
-- Harden before scale (admin policies via service role / custom claims).
alter table profiles enable row level security;
alter table properties enable row level security;
alter table property_images enable row level security;
alter table verification_records enable row level security;
alter table ownership_documents enable row level security;
alter table favorites enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table viewing_requests enable row level security;
alter table reports enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

create policy "public read published" on properties for select using (status = 'published');
create policy "owners insert own" on properties for insert with check (auth.uid() = owner_id);
create policy "owners update own" on properties for update using (auth.uid() = owner_id);
create policy "public read listing images" on property_images for select using (true);
create policy "owners manage own images" on property_images for all using (
  exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid())
);
create policy "public read reviews" on reviews for select using (true);
create policy "users insert own reviews" on reviews for insert with check (auth.uid() = author_id);
create policy "users manage own favorites" on favorites for all using (auth.uid() = profile_id);
create policy "members read own conversations" on conversations for select using (auth.uid() = seeker_id);
create policy "members read own messages" on messages for select using (
  exists (select 1 from conversations c where c.id = conversation_id and c.seeker_id = auth.uid())
);

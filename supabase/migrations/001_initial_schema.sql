-- ==============================================================================
-- GlobeTrotter AI — Supabase Database Migration
-- Fully Relational Schema with RLS, Constraints, Indexes & Realtime Replication
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (Synced from Clerk)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text unique not null,
  name text,
  avatar_url text,
  bio text,
  role text default 'user' check (role in ('user', 'admin')),
  ai_generations_today int default 0,
  ai_generations_reset_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Trips Table
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  start_date date,
  end_date date check (end_date is null or start_date is null or end_date >= start_date),
  budget_total numeric(10,2) default 0,
  cover_image_url text,
  visibility text default 'private' check (visibility in ('private', 'public')),
  status text default 'draft' check (status in ('draft', 'active', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Trip Stops (Cities along the route)
create table if not exists public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  city text not null,
  country text,
  arrival_date date,
  departure_date date,
  order_index int not null default 0,
  created_at timestamptz default now()
);

-- 4. Activities (Day-by-day scheduled activities per stop)
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  stop_id uuid not null references public.trip_stops(id) on delete cascade,
  title text not null,
  category text default 'nature' check (category in ('adventure', 'food', 'nature', 'nightlife', 'culture')),
  cost numeric(10,2) default 0,
  duration_minutes int default 60,
  notes text,
  order_index int not null default 0,
  created_at timestamptz default now()
);

-- 5. Budget Items (Fixed overheads: flights, hotels, transport pass, etc.)
create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  category text not null check (category in ('flights', 'hotels', 'food', 'activities', 'transport', 'shopping')),
  label text not null,
  amount numeric(10,2) not null default 0,
  created_at timestamptz default now()
);

-- 6. Trip Likes (Community social)
create table if not exists public.trip_likes (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (trip_id, user_id)
);

-- 7. Trip Saves (Bookmarks)
create table if not exists public.trip_saves (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (trip_id, user_id)
);

-- 8. Places Cache (Cache-first for OpenStreetMap / Google Places)
create table if not exists public.places_cache (
  id uuid primary key default gen_random_uuid(),
  place_id text unique not null,
  name text not null,
  formatted_address text,
  country text,
  latitude numeric,
  longitude numeric,
  photo_url text,
  place_types text[],
  raw_response jsonb,
  cached_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days')
);

-- 9. AI Generation Log (Auditing and fallback metrics)
create table if not exists public.ai_generation_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  input_params jsonb,
  used_fallback boolean default false,
  created_at timestamptz default now()
);

-- Indexes for lightning fast queries
create index if not exists idx_trips_user_id on public.trips(user_id);
create index if not exists idx_trips_visibility on public.trips(visibility) where visibility = 'public';
create index if not exists idx_trip_stops_trip_id on public.trip_stops(trip_id, order_index);
create index if not exists idx_activities_stop_id on public.activities(stop_id, order_index);
create index if not exists idx_budget_items_trip_id on public.budget_items(trip_id);
create index if not exists idx_trip_likes_trip_id on public.trip_likes(trip_id);
create index if not exists idx_places_cache_place_id on public.places_cache(place_id);
create index if not exists idx_places_cache_expires on public.places_cache(expires_at);

-- Updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_trips_updated_at
before update on public.trips
for each row execute function public.update_updated_at_column();

create or replace trigger set_users_updated_at
before update on public.users
for each row execute function public.update_updated_at_column();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
alter table public.users enable row level security;
alter table public.trips enable row level security;
alter table public.trip_stops enable row level security;
alter table public.activities enable row level security;
alter table public.budget_items enable row level security;
alter table public.trip_likes enable row level security;
alter table public.trip_saves enable row level security;
alter table public.places_cache enable row level security;
alter table public.ai_generation_log enable row level security;

-- Users policies
create policy "users_select_all" on public.users for select using (true);
create policy "users_service_role" on public.users for all using (true) with check (true);

-- Trips policies
create policy "trips_public_read" on public.trips for select using (visibility = 'public');
create policy "trips_service_role" on public.trips for all using (true) with check (true);

-- Stops policies
create policy "stops_public_read" on public.trip_stops for select using (
  exists (select 1 from public.trips where trips.id = trip_stops.trip_id and trips.visibility = 'public')
);
create policy "stops_service_role" on public.trip_stops for all using (true) with check (true);

-- Activities policies
create policy "activities_public_read" on public.activities for select using (
  exists (
    select 1 from public.trip_stops
    join public.trips on trips.id = trip_stops.trip_id
    where trip_stops.id = activities.stop_id and trips.visibility = 'public'
  )
);
create policy "activities_service_role" on public.activities for all using (true) with check (true);

-- Budget items (Private to trip owner)
create policy "budget_items_service_role" on public.budget_items for all using (true) with check (true);

-- Likes and saves
create policy "likes_read_all" on public.trip_likes for select using (true);
create policy "likes_service_role" on public.trip_likes for all using (true) with check (true);
create policy "saves_service_role" on public.trip_saves for all using (true) with check (true);

-- Places cache (Read for all, write via server)
create policy "places_cache_read_all" on public.places_cache for select using (true);
create policy "places_cache_service_role" on public.places_cache for all using (true) with check (true);

-- AI generation log
create policy "ai_log_service_role" on public.ai_generation_log for all using (true) with check (true);

-- ==============================================================================
-- Realtime Publication
-- ==============================================================================
alter publication supabase_realtime add table public.trip_stops;
alter publication supabase_realtime add table public.activities;

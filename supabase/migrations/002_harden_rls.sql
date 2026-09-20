-- GlobeTrotter server-only data access hardening.
-- All data access currently flows through authenticated Next.js Route Handlers
-- using the Supabase service role. Browser clients must not access these tables
-- directly until Clerk-issued JWTs are integrated with Supabase RLS claims.

drop policy if exists "users_select_all" on public.users;
drop policy if exists "users_service_role" on public.users;
drop policy if exists "trips_public_read" on public.trips;
drop policy if exists "trips_service_role" on public.trips;
drop policy if exists "stops_public_read" on public.trip_stops;
drop policy if exists "stops_service_role" on public.trip_stops;
drop policy if exists "activities_public_read" on public.activities;
drop policy if exists "activities_service_role" on public.activities;
drop policy if exists "budget_items_service_role" on public.budget_items;
drop policy if exists "likes_read_all" on public.trip_likes;
drop policy if exists "likes_service_role" on public.trip_likes;
drop policy if exists "saves_service_role" on public.trip_saves;
drop policy if exists "places_cache_read_all" on public.places_cache;
drop policy if exists "places_cache_service_role" on public.places_cache;
drop policy if exists "ai_log_service_role" on public.ai_generation_log;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

alter table public.trips
  add constraint trips_budget_total_nonnegative check (budget_total >= 0) not valid;

alter table public.activities
  add constraint activities_cost_nonnegative check (cost >= 0) not valid;

alter table public.budget_items
  add constraint budget_items_amount_nonnegative check (amount >= 0) not valid;

alter table public.trips validate constraint trips_budget_total_nonnegative;
alter table public.activities validate constraint activities_cost_nonnegative;
alter table public.budget_items validate constraint budget_items_amount_nonnegative;

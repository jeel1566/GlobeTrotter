# GlobeTrotter AI — Database Design

**Doc 3 of 9** · Version 2.0 · Postgres (Supabase)

---

## 1. Entity Relationship Overview

```
users ──< trips ──< trip_stops ──< activities
  │           │
  │           ├──< budget_items
  │           ├──< trip_likes >── users
  │           └──< trip_saves >── users
  │
  └──< ai_generation_log
```

---

## 2. Table Definitions

### 2.1 `users`
Synced from Clerk via webhook. This is the join point between auth and app data.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| clerk_id | text | unique, not null — the Clerk user ID |
| email | text | unique, not null |
| name | text | |
| avatar_url | text | |
| bio | text | |
| role | text | default `'user'`, check in `('user','admin')` |
| ai_generations_today | int | default 0 — reset via cron/scheduled function, caps daily AI usage (TRD §5) |
| ai_generations_reset_at | timestamptz | |
| created_at | timestamptz | default `now()` |

### 2.2 `trips`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → `users.id`, not null, `on delete cascade` |
| title | text | not null |
| description | text | |
| start_date | date | |
| end_date | date | check `end_date >= start_date` |
| budget_total | numeric(10,2) | default 0 |
| cover_image_url | text | points to Supabase Storage object |
| visibility | text | default `'private'`, check in `('private','public')` |
| status | text | default `'draft'`, check in `('draft','active','completed')` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()`, updated via trigger |

### 2.3 `trip_stops`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| trip_id | uuid | FK → `trips.id`, `on delete cascade` |
| city | text | not null |
| country | text | |
| arrival_date | date | |
| departure_date | date | |
| order_index | int | not null — drives reorder + Realtime diffing |
| created_at | timestamptz | default `now()` |

### 2.4 `activities`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| stop_id | uuid | FK → `trip_stops.id`, `on delete cascade` |
| title | text | not null |
| category | text | check in `('adventure','food','nature','nightlife','culture')` |
| cost | numeric(10,2) | default 0 |
| duration_minutes | int | |
| notes | text | |
| order_index | int | not null |
| created_at | timestamptz | default `now()` |

### 2.5 `budget_items`
Explicit, manually-entered budget line items (separate from activity costs — see §5 for how they combine).

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| trip_id | uuid | FK → `trips.id`, `on delete cascade` |
| category | text | check in `('flights','hotels','food','activities','transport','shopping')` |
| label | text | e.g. "Flight to Goa" |
| amount | numeric(10,2) | not null |
| created_at | timestamptz | default `now()` |

### 2.6 `trip_likes`
| Column | Type | Notes |
|---|---|---|
| trip_id | uuid | FK → `trips.id`, `on delete cascade` |
| user_id | uuid | FK → `users.id`, `on delete cascade` |
| created_at | timestamptz | default `now()` |
| | | **PK** `(trip_id, user_id)` — prevents duplicate likes at the DB level |

### 2.7 `trip_saves`
Same shape as `trip_likes`, composite PK `(trip_id, user_id)`.

### 2.8 `places_cache`
Caches Google Places API results so repeated searches for the same city/place don't re-hit the API (TRD §4.3). This is what makes "dynamic, works for any city" also cheap and fast.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| google_place_id | text | unique, not null — Google's own place identifier |
| name | text | not null |
| formatted_address | text | |
| country | text | |
| latitude | numeric | |
| longitude | numeric | |
| photo_url | text | first photo reference, resolved to a usable URL |
| place_types | text[] | e.g. `{tourist_attraction, point_of_interest}` |
| raw_response | jsonb | full API response, for fields we might need later without re-fetching |
| cached_at | timestamptz | default `now()` |
| expires_at | timestamptz | default `now() + interval '30 days'` — matches Google's caching terms |

**Lookup logic**: on a place search, query `places_cache` first (`where google_place_id = ? and expires_at > now()`); on miss or expiry, call Google Places API, upsert the result, then return it. This table has no RLS restriction — it's shared reference data, not user data, so it's readable by anyone (writable only via the server using the service-role key).

### 2.9 `ai_generation_log` (optional but recommended)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → `users.id` |
| trip_id | uuid | nullable — may generate before trip is saved |
| input_params | jsonb | destination/days/budget/interests |
| used_fallback | boolean | default false — lets you show judges "X% used live AI, Y% fell back" if asked |
| created_at | timestamptz | default `now()` |

---

## 3. Indexes

```sql
create index idx_trips_user_id on trips(user_id);
create index idx_trips_visibility on trips(visibility) where visibility = 'public';
create index idx_trip_stops_trip_id on trip_stops(trip_id, order_index);
create index idx_activities_stop_id on activities(stop_id, order_index);
create index idx_budget_items_trip_id on budget_items(trip_id);
create index idx_trip_likes_trip_id on trip_likes(trip_id);
create index idx_places_cache_google_id on places_cache(google_place_id);
create index idx_places_cache_expires on places_cache(expires_at);
```

---

## 4. Row Level Security Policies

RLS is **on for every table** from the first migration (TRD §4.2). Key policies:

```sql
alter table trips enable row level security;

-- Owners can do everything with their own trips
create policy "owners full access"
  on trips for all
  using (user_id = (select id from users where clerk_id = auth.jwt()->>'sub'));

-- Anyone (including anon) can read public trips
create policy "public trips readable"
  on trips for select
  using (visibility = 'public');

-- trip_stops / activities: readable/writable if the parent trip is owned or public
alter table trip_stops enable row level security;

create policy "stops follow trip visibility"
  on trip_stops for select
  using (
    exists (
      select 1 from trips
      where trips.id = trip_stops.trip_id
      and (trips.visibility = 'public'
           or trips.user_id = (select id from users where clerk_id = auth.jwt()->>'sub'))
    )
  );

create policy "stops editable by trip owner"
  on trip_stops for all
  using (
    exists (
      select 1 from trips
      where trips.id = trip_stops.trip_id
      and trips.user_id = (select id from users where clerk_id = auth.jwt()->>'sub')
    )
  );

-- (Same pattern repeats for activities, budget_items — budget_items should NOT
-- be readable even if the trip is public, since budget is personal. Only owner access there.)
alter table budget_items enable row level security;

create policy "budget owner only"
  on budget_items for all
  using (
    exists (
      select 1 from trips
      where trips.id = budget_items.trip_id
      and trips.user_id = (select id from users where clerk_id = auth.jwt()->>'sub')
    )
  );
```

**Important flag**: the `users` table row for the Clerk webhook upsert must be written using the `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS intentionally), because at that point there's no Supabase session yet — only a Clerk webhook event. This is the one deliberate RLS bypass in the system; document it clearly in code comments so nobody "fixes" it into a bug.

---

## 5. Budget Calculation Logic (resolves PRD open question)

- **Planned Cost** = `sum(activities.cost for all activities in trip)` + `sum(budget_items.amount for trip)`
- **Remaining** = `trips.budget_total − Planned Cost`
- Activities represent *itinerary-driven* costs (things you added to the plan); `budget_items` represent *manually tracked* costs (flights booked, hotel deposits, etc.) that don't map to a specific activity. Keeping them separate but summed avoids double-counting while letting users log real expenses that aren't "activities."

---

## 6. Copy Trip — Data Behavior (resolves PRD open question)

On "Copy Trip": clone `trips` row (new `id`, `user_id` = copier, `visibility = 'private'`, `status = 'draft'`) → clone all `trip_stops` (new `trip_id`) → clone all `activities` (new `stop_id`, strip personal `notes`) → clone `budget_items` **only if** original owner opted in (add a `budget_items_public boolean` flag on `trips` if you want this configurable; default: budget_items are NOT copied, since costs are personal/regional and rarely transferable).

---

## 7. Realtime Configuration

```sql
alter publication supabase_realtime add table trip_stops;
alter publication supabase_realtime add table activities;
```

Client subscribes per `trip_id` via a Postgres Changes channel filtered on `trip_id=eq.<id>`, scoped to `trip_stops` and `activities` only, per TRD §5 constraint.

---

## 8. Place Data & Cost Estimation Strategy

This resolves "where does data for Tokyo, Russia, or any arbitrary city come from" — the app is not pre-loaded with world data, it fetches dynamically:

| Need | Source | Notes |
|---|---|---|
| City/place search, name, address, photo | Google Places API → `places_cache` | Works for any place globally, first-search-caches-it-forever(ish) pattern |
| Activity cost estimate | OpenAI, generated on request | Not stored as "ground truth" — always labeled "Estimated" in the UI (System Design/UI-UX already require this); optionally cached per (city, activity-type) pair for 7 days to avoid re-asking the AI the same estimate repeatedly, using a simple `cost_estimate_cache` table (same shape as `places_cache`, key = `city + activity_category` instead of `google_place_id`) if time permits — otherwise it's fine to just call it fresh each time given hackathon traffic volume (System Design §2) |
| AI itinerary fallback templates | Hand-curated, 5 cities only | Exists purely as demo insurance against OpenAI downtime (PRD §7) — **not** the general data source |

*Next document: **04-Architecture** — high-level system architecture diagram and component responsibilities.*

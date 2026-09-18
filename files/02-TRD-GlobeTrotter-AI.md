# GlobeTrotter AI — Technical Requirements Document (TRD)

**Doc 2 of 9** · Version 2.0

---

## 1. Purpose

This document defines *how* the PRD gets built: stack choices and justification, environment setup, third-party service configuration, coding standards, testing strategy, and technical constraints. Every engineer on the team should be able to set up a working local environment from this doc alone.

---

## 2. Technology Stack & Justification

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | Server Components reduce client JS; Route Handlers double as our API layer; native Vercel deploy |
| Language | TypeScript (strict mode) | Catches integration bugs across a 4+ person team before runtime |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent UI without hand-rolling a design system under time pressure |
| Auth | Clerk | Prebuilt UI components (login/signup/forgot-password) save days vs. rolling our own; webhook support for DB sync |
| Database | Supabase (Postgres) | Relational integrity for trip/city/activity relationships + built-in RLS + Realtime in one service |
| Realtime | Supabase Realtime (Postgres logical replication channels) | No separate WebSocket infra needed; subscribes directly to table changes |
| File storage | Supabase Storage | Same project as DB, avoids a third vendor for cover images |
| AI | OpenAI API (`gpt-4o-mini` for cost/speed, function-calling for structured JSON output) | Reliable structured output via function calling; low latency acceptable for demo |
| Place data | Google Places API (New) — Text Search + Place Details | Gives real, global place/city data (name, address, coords, photos) with zero manual curation — this is what makes the app work for *any* destination, not just pre-loaded ones |
| Charts | Recharts | Composable, works cleanly with React Server/Client Component boundaries |
| Deployment | Vercel | Zero-config Next.js deploys, preview URLs per PR (useful with 4+ people pushing branches) |

**Why not tRPC**: team confirmed comfort with plain REST-style Route Handlers; tRPC adds a learning curve not worth it for this timeline.

**Why not a separate backend (Express/FastAPI)**: unnecessary infra surface for the scope; Next.js Route Handlers run server-side with full Node access, which covers everything here (OpenAI calls, Supabase service-role writes, webhook receivers).

---

## 3. Environment Setup

### 3.1 Prerequisites
- Node.js 20 LTS
- pnpm (faster installs, better monorepo support if we split packages later)
- Supabase CLI (`supabase` — for local DB + migrations)
- Vercel CLI (optional, for local env pull)

### 3.2 Environment Variables (`.env.local`)

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never exposed to client

# OpenAI
OPENAI_API_KEY=

# Google Places
GOOGLE_PLACES_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

**Rule**: `SUPABASE_SERVICE_ROLE_KEY` is used only inside Route Handlers (e.g., the Clerk webhook handler that upserts users, bypassing RLS intentionally for that one write). It must never reach client bundles — enforce via code review, not just convention.

### 3.3 Repo Structure

```
/app
  /(marketing)         → landing page
  /(auth)               → clerk-hosted or embedded auth pages
  /dashboard
  /trips/[tripId]
  /community
  /admin
  /api
    /webhooks/clerk
    /trips
    /trips/[tripId]/stops
    /trips/[tripId]/activities
    /trips/[tripId]/budget
    /ai/generate-itinerary
    /community
/components
/lib
  /supabase            → client + server Supabase instances
  /clerk
  /openai
/types
/supabase
  /migrations
```

---

## 4. Third-Party Service Configuration

### 4.1 Clerk
- Enable Email + Google OAuth providers
- Configure webhook endpoint → `/api/webhooks/clerk` for `user.created` and `user.updated` events, verified with `CLERK_WEBHOOK_SECRET` (svix signature verification — do not skip this or anyone can POST fake user events)

### 4.2 Supabase
- Enable Row Level Security on **every** table from the first migration — do not add it later
- Enable Realtime on `trip_stops`, `activities` tables specifically (Realtime must be explicitly turned on per table in Supabase dashboard or via `ALTER PUBLICATION`)
- Storage bucket `trip-covers` — public read, authenticated write, 5MB file size limit, image MIME types only

### 4.3 Google Places API (New)
- Enable "Places API (New)" in Google Cloud Console, restrict the API key to Text Search + Place Details + Place Photos endpoints only (never ship an unrestricted key)
- Free tier: $200/month credit — more than sufficient for hackathon-scale traffic (System Design §2 caps demo traffic at 20-50 concurrent users)
- **Caching is mandatory, not optional**: Google's terms allow caching most Place Details fields for up to 30 days. Every place lookup checks our own `places_cache` table first (Database Design §2.9); only calls Google on a cache miss. This keeps costs near zero and searches near-instant after the first lookup for any given place.
- Field masking: only request the fields we actually use (`displayName`, `formattedAddress`, `location`, `photos`, `types`) — Places API (New) bills per field requested, so requesting everything wastes budget

### 4.4 OpenAI
- Use function-calling / structured output mode so the itinerary response is guaranteed valid JSON (avoid parsing free-text)
- Set `max_tokens` conservatively (itinerary JSON is bounded) to control latency and cost
- 8-second client-side timeout, matching PRD §7 fallback behavior

---

## 5. Technical Constraints

- **Browser support**: last 2 versions of Chrome, Safari, Firefox, Edge. No IE11.
- **Mobile**: responsive down to 375px width; no native app
- **Realtime scope**: only `trip_stops` add/remove/reorder and `activities` add/remove trigger live updates — not budget or notes (keeps the demo surface area testable)
- **AI cost control**: cap AI generations per user per day (e.g., 10) via a simple counter in the `users` table, to avoid runaway OpenAI cost if the demo link gets shared publicly
- **No payment processing**: budget figures are estimates only, explicitly stated in UI copy

---

## 6. Coding Standards

- TypeScript strict mode; no `any` without a `// eslint-disable` comment explaining why
- ESLint + Prettier, enforced via a pre-commit hook (husky) — with 4+ people, formatting drift wastes review time
- Component naming: PascalCase; hooks: `useX`; Route Handlers: one file per resource, HTTP verbs as named exports (`GET`, `POST`, etc.)
- All Supabase queries go through `/lib/supabase` wrapper functions — no ad-hoc client instantiation scattered across components

---

## 7. Testing Strategy (scoped for hackathon reality)

Given the timeline, full test coverage isn't the goal — **targeted tests on the riskiest paths** are:

| Area | Test type | Why |
|---|---|---|
| RLS policies | Manual + scripted Postgres query tests | A misconfigured policy is a silent security hole, not a visible bug |
| AI fallback trigger | Manual (force a timeout) | Must be verified before demo day, not discovered during it |
| Trip visibility (Private/Public) | Manual cross-account check | Core trust feature |
| Budget calculation | Unit test on the calculation function | Easy to get subtly wrong, easy to unit test |

Everything else: manual QA pass day before submission, using the Demo Script from PRD §11 as the test script.

---

## 8. CI/CD

- GitHub repo, `main` = production (auto-deploys to Vercel), feature branches get Vercel preview URLs
- Branch naming: `feature/<name>`, `fix/<name>`
- PR requires at least 1 review from another team member before merge to `main` (with 4+ people, this catches integration issues early)

---

## 9. Logging & Error Handling

- Route Handlers wrap external calls (OpenAI, Supabase) in try/catch, return structured error JSON: `{ error: string, code: string }`
- Client shows toast notifications on failure, never a raw error or blank screen
- Console-level logging is sufficient for hackathon scope (no need for a dedicated logging service like Sentry, unless time permits as a stretch goal)

---

*Next document: **03-Database-Design** — full schema, relationships, RLS policies, and indexes.*

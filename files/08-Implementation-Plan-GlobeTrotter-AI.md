# GlobeTrotter AI — Implementation Plan

**Doc 8 of 9** · Version 2.0 · Team: 4+ people, multi-day/week timeline

---

## 1. Team Roles (adjust names as needed)

| Role | Owns |
|---|---|
| **Backend/DB Lead** | Supabase schema + migrations, RLS policies, Clerk webhook, `/api/trips`, `/api/trips/:id/stops`, `/api/trips/:id/activities` |
| **AI/Integration Lead** | OpenAI integration, prompt/function-calling design, fallback templates, `/api/ai/generate-itinerary`, `ai_generation_log` |
| **Frontend Lead (Core Flows)** | Landing, Auth pages, Dashboard, Create Trip, Trip Listing, Itinerary Builder UI + drag-reorder + Realtime subscription wiring |
| **Frontend Lead (Budget/Community/Admin)** | Budget screen + charts, Community tab, Profile, Admin dashboard |

With 4+ people, extra hands should pair on the Itinerary Builder (highest complexity screen) or take ownership of polish/testing in later phases.

---

## 2. Phase Breakdown

### Phase 0 — Alignment (Day 0, before any code)
- [ ] Everyone reads PRD, TRD, DB Design, Architecture (this doc set)
- [ ] Confirm role ownership above
- [ ] Set up shared Supabase project + Clerk app + OpenAI key, share via password manager (not Slack/plaintext)
- [ ] Agree on the **feature freeze rule**: no new features added after Phase 4 ends (PRD §9 risk mitigation)

### Phase 1 — Foundation (Day 1)
- [ ] GitHub repo, branch protection on `main`, PR template
- [ ] Next.js + TypeScript + Tailwind + shadcn/ui scaffolded
- [ ] Clerk integrated, middleware protecting `/dashboard`, `/trips/*`, `/admin`
- [ ] Supabase project created, first migration: all tables from DB Design (doc 03), RLS enabled on every table from the start
- [ ] Clerk webhook → `users` sync working and tested (create an account, confirm row appears)
- [ ] Vercel project connected, deploys on push to `main`
- [ ] **Exit criteria**: a logged-in user lands on an empty Dashboard, backed by real auth + DB

### Phase 2 — Core Trip CRUD (Day 2)
- [ ] `/api/trips` full CRUD + RLS verified (try accessing another user's private trip — should fail)
- [ ] Create Trip form + cover image upload to Supabase Storage
- [ ] Trip Listing (grid/list, search, status filter)
- [ ] **Exit criteria**: a user can create, view, edit, delete a trip end-to-end through the UI

### Phase 3 — Itinerary Builder + Realtime (Days 3–4, highest complexity — allocate the most people here)
- [ ] `/api/trips/:id/stops` + `/api/trips/:id/stops/reorder` + activities endpoints
- [ ] Itinerary Builder UI: add/remove/reorder cities, add/remove activities
- [ ] Drag-and-drop (via `@dnd-kit/core`), wired to the reorder endpoint
- [ ] Supabase Realtime subscription on `trip_stops`/`activities`, tested with **two browser windows side by side**
- [ ] Presence indicator (who's viewing)
- [ ] **Exit criteria**: two people editing the same trip in two windows see each other's changes within ~2 seconds
- [ ] **This is your feature freeze checkpoint** — nothing new gets added after this phase closes

### Phase 4 — Budget + Calendar (Day 5)
- [ ] `/api/trips/:id/budget` (calculation logic per DB Design §5) + budget_items CRUD
- [ ] Budget screen with Recharts pie chart
- [ ] Calendar/Timeline view
- [ ] **Exit criteria**: budget numbers update correctly when activities/budget_items change

### Phase 5 — AI Feature (Day 5–6, can run in parallel with Phase 4 since it's a different owner)
- [ ] OpenAI integration with function-calling for structured JSON
- [ ] 8s timeout + fallback template logic (prepare 3–5 templates for popular destinations in advance)
- [ ] Daily generation cap enforcement
- [ ] AI generation UI (the "Analyzing... Building... Estimating..." loading sequence from UI/UX doc)
- [ ] **Exit criteria**: force-fail the OpenAI call (e.g., invalid key temporarily) and confirm the fallback renders cleanly — test this explicitly, don't assume

### Phase 6 — Community (Day 6)
- [ ] Publish trip flow (visibility toggle + status)
- [ ] Community browse, like, save, copy
- [ ] **Exit criteria**: copy trip produces a correct independent clone (verify by editing the copy and confirming the original is unaffected)

### Phase 7 — Admin + Profile (Day 6–7)
- [ ] Admin stats dashboard (role-gated)
- [ ] Profile page

### Phase 8 — Polish, QA, Demo Prep (final 1–2 days — do not skip or compress this)
- [ ] Full manual QA pass using the Demo Script (PRD §11) as the test script
- [ ] Test all empty/loading/error states (UI/UX §6)
- [ ] Test RLS manually: try to access private trips/budget data across two accounts
- [ ] Seed a demo account with a fully-built, good-looking trip as a live-demo fallback in case live creation has issues on stage
- [ ] Rehearse the demo script at least twice, timed
- [ ] Prepare answers for likely judge questions: "What happens if OpenAI is down?", "How do you handle two people editing at once?", "Is private data actually private, or just hidden in the UI?" — you now have good answers to all three from these docs

---

## 3. Dependency Notes

- Phase 3 (Realtime) blocks meaningful testing of Phase 6 (Community copy — copies stops which use the same tables), so don't let Phase 3 slip without adjusting downstream
- AI Lead (Phase 5) can start prompt/template work in parallel with Phase 2–3 since it doesn't depend on the itinerary builder being finished, only on the DB schema (available from Phase 1)
- Budget Lead can start chart/UI work against mock data before Phase 2 finishes, then wire to real endpoints once available

---

## 4. Stretch Goals (only if ahead of schedule after Phase 8)

- Dark mode
- Interactive map (real Mapbox/Leaflet integration instead of simple route visualization)
- Multi-currency support
- Sentry error tracking
- PWA installability

---

*Next document: **09-App-Flow** — consolidated end-to-end flow diagrams tying all previous docs together.*

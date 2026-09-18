# GlobeTrotter AI — System Design

**Doc 5 of 9** · Version 2.0

---

## 1. Scope of This Document

The Architecture doc (04) covers *what talks to what*. This document covers *what happens under stress, at the edges, and at scale* — concurrency conflicts, load characteristics, and failure modes that a component diagram doesn't show.

---

## 2. Capacity Assumptions (Hackathon Reality)

This is not a production system being designed for millions of users — but judging traffic spikes are real (multiple judges opening the same demo link within minutes). Design targets:

| Metric | Target |
|---|---|
| Concurrent users during demo/judging | 20–50 |
| Concurrent editors on one trip | 2–5 (realistic for the live-sync demo) |
| AI generations per minute (worst case, multiple judges trying it) | ~10 |
| Database size | Trivial (<10k rows across all tables) — indexing in DB design is precautionary, not urgent at this scale |

This matters because it tells you *where not to over-engineer*: don't build caching layers or connection pooling tuning for this. Supabase's default connection pooling (pgbouncer, included) is sufficient.

---

## 3. Concurrency & Conflict Handling (Live Sync)

Since PRD/TRD scoped this as **coarse-grained live sync**, not full OT/CRDT collaboration, conflicts are handled with a deliberately simple strategy:

### 3.1 Add operations (new city, new activity)
No conflict possible — each insert is independent. Realtime just broadcasts the new row to all subscribers.

### 3.2 Reorder operations
**Risk**: Two users drag-reorder cities at the same time → `order_index` values collide or produce an inconsistent order.

**Mitigation — last-write-wins with full resequencing**:
- On any reorder action, the client sends the *entire new order* of `order_index` values for that trip's stops in one request, not a delta
- Route Handler writes all `order_index` updates in a single transaction
- If two reorders race, the second write simply overwrites the first — the user who "loses" sees their view snap to the latest order via Realtime within ~1-2s
- This is an accepted tradeoff, documented as such — true operational-transform reordering is out of scope (PRD §4)

### 3.3 Delete operations
**Risk**: User A deletes an activity while User B is editing its notes.
**Mitigation**: Delete wins. User B's edit request will fail with a 404/foreign-key-not-found, client shows "This activity was removed by another collaborator" toast rather than a raw error — this must be explicitly handled in the Route Handler, not assumed away.

### 3.4 Presence Indicator
Implemented via Supabase Realtime's Presence feature (separate from Postgres Changes) — each client broadcasts `{ user_id, name, viewing_trip_id }` on join/leave, giving the "Jeel is viewing" UI without any extra backend code.

---

## 4. Data Flow Under Load

```
Judge opens demo link (spike of ~20 concurrent sessions)
  → Vercel scales Route Handler invocations automatically (serverless, no action needed)
  → Supabase connection pooler (pgbouncer) absorbs concurrent DB connections
  → Realtime channels are per-trip, so a spike of judges on *different* trips
    doesn't create channel contention
```

**Single identified bottleneck**: if many judges hit "Generate AI Itinerary" simultaneously, OpenAI rate limits could trigger broadly. Mitigation: the per-user daily cap (DB design §2.1) plus the fallback path (Architecture §3.3) mean a rate-limit event degrades gracefully to templates rather than failing the demo.

---

## 5. Edge Cases to Explicitly Handle

| Edge Case | Expected Behavior |
|---|---|
| Trip with 0 stops, user opens Budget screen | Show ₹0 planned cost, not a crash/NaN |
| User deletes a trip while someone else is viewing it live | Viewer sees a "This trip is no longer available" state, redirected to dashboard |
| User sets `end_date` before `start_date` | Blocked client-side AND by DB check constraint (defense in depth) |
| Copy Trip on a trip that's since been deleted | Copy endpoint returns 404 gracefully, not a partial copy |
| AI generation requested with 0 days or negative budget | Client-side validation blocks before hitting the API |
| Two people like the same trip in the same second (race) | `trip_likes` composite PK naturally rejects the duplicate insert; handler catches the unique-violation and treats it as a no-op success |
| User's Clerk account exists but webhook hasn't fired yet (race on first login) | Dashboard shows a brief loading/"setting up your account" state, polls or retries `users` lookup once before failing |
| Public trip's owner deletes their account | `trips.user_id` FK `on delete cascade` — cleanly removes their trips rather than leaving orphaned rows |

---

## 6. What We're Deliberately NOT Solving

Being explicit about this is a strength in a judged demo, not a weakness:

- **Horizontal scaling beyond serverless defaults** — Vercel + Supabase handle this transparently at our scale; no custom load balancing needed
- **Multi-region deployment** — single region is fine for a demo audience
- **True collaborative text editing (OT/CRDT)** — explicitly scoped out in PRD; last-write-wins is the honest, correct-for-scope answer
- **Rate limiting at the infra level (e.g., Cloudflare)** — the per-user DB-level cap is sufficient at this scale

---

*Next document: **06-UI-UX** — screen-by-screen UX flow, wireframe descriptions, and design system.*

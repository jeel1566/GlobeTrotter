# GlobeTrotter AI — Product Requirements Document (PRD)

**Doc 1 of 9** · Version 2.0 (Hackathon Engineering Spec) · Team size: 4+ · Timeline: Multi-day/week

---

## 1. Problem Statement

Travel planning today is fragmented across Google Maps, TripAdvisor, Notes apps, Excel, WhatsApp, and Calendar apps. Users struggle to:

- Organize multi-city trips in one place
- Estimate and track trip costs accurately
- Plan activities day-by-day without losing the "shape" of the trip
- Coordinate plans with friends/family in real time
- Visualize the complete journey (route, timeline, budget) at a glance

**GlobeTrotter AI** is a centralized travel planning platform that lets users discover destinations, build itineraries, track budgets, collaborate live with co-travelers, and generate AI-powered day plans.

---

## 2. Product Vision

Make travel planning as enjoyable as the trip itself, by combining:

- Multi-city itinerary building
- Budget tracking with category breakdowns
- Live-synced collaboration for shared trips
- AI-generated itineraries from a few inputs
- A community layer to discover and clone public trips

---

## 3. Target Users & Needs

| Persona | Core Needs |
|---|---|
| **Solo Traveler** | Fast planning, budget tracking, destination discovery |
| **Friend Group** | Shared/live editing, public itineraries, trip collaboration |
| **Family Traveler** | Structured day-by-day schedules, cost visibility, simple management |

---

## 4. MVP Scope

**In scope for hackathon demo:**
- Auth (Clerk) + synced user profiles
- Trip CRUD with visibility (Private/Public)
- Multi-city itinerary builder with drag-reorder
- Activity search/add with categories, cost, duration
- Budget tracking with category breakdown + charts
- Calendar/timeline view of the trip
- **Live sync**: trip changes reflect for all viewers of that trip in near real time (via Supabase Realtime), with a presence indicator ("Jeel is viewing/editing")
- Community tab: publish, browse, like, save, copy trips
- AI Itinerary Generator (OpenAI) with graceful fallback
- Admin dashboard (role-gated) for usage stats

**Explicitly out of scope (call this out to judges proactively — shows maturity):**
- Real payments/booking integration (flights/hotels are cost *estimates*, not bookable)
- Character-level collaborative editing (Google-Docs-style OT/CRDT) — we do coarse-grained live sync instead
- Native mobile apps (responsive web only)
- Multi-language/i18n
- Offline-first support

---

## 5. Primary User Flow

```
Landing Page → Login/Signup → Dashboard → Create Trip → Build Itinerary
→ Add Activities → Budget Planning → Calendar View → Publish Trip
→ Community Sharing
```

---

## 6. Pages & Features

### 6.1 Login & Register
- Email + Google login, signup, forgot password, session management
- **Tech**: Clerk Authentication
- On first login, a Clerk webhook (`user.created`) fires a Route Handler that upserts the user into Supabase `users` table — this is the join point between auth and data. (Detailed in TRD/DB design.)

### 6.2 Landing Page
- Hero, feature highlights, CTA, login button, demo preview, popular destinations

### 6.3 Dashboard
- Welcome message, recent trips, upcoming trips, quick stats, "Create Trip" CTA

### 6.4 Create Trip
- Fields: Title, Description, Start Date, End Date, Budget, Cover Image (upload → Supabase Storage), Visibility (Private/Public)

### 6.5 Trip Listing
- Grid/List toggle, search, edit, delete, status badges (Draft / Active / Completed — derived from dates + explicit flag, see DB design)

### 6.6 Itinerary Builder
- Add/remove/reorder cities (drag-and-drop, persisted via `order_index`)
- Add/remove activities per city-stop, with notes
- **Live sync**: any collaborator with edit access sees additions/reorders update automatically
- Trip-level notes

### 6.7 Activity & City Search
- City search with country info + estimated cost
- Activity search with duration, cost, category (Adventure, Food, Nature, Nightlife, Culture)

### 6.8 Calendar View
- Monthly / Weekly / Daily / Timeline visualizations of the itinerary

### 6.9 Itinerary Review
- Day-by-day plan, city summary, activity summary, route visualization (Ahmedabad → Mumbai → Goa → Bangalore style)

### 6.10 Budget Screen
- Total Budget vs. **Planned Cost** (= sum of all activity costs + explicit budget_items) vs. **Remaining** = Total − Planned
- Category breakdown: Flights, Hotels, Food, Activities, Transport, Shopping
- Pie chart + category bar breakdown (Recharts)

### 6.11 Community Tab
- Browse public trips, like, save, **copy trip** (clones trip_stops + activities + budget_items into the copying user's account, resets visibility to Private, strips original owner's personal notes)

### 6.12 User Profile
- Avatar, name, bio, travel preferences, list of published trips

### 6.13 Admin Panel (role-gated: `users.role = 'admin'`)
- Total users, total trips, popular cities, community engagement metrics

---

## 7. AI Feature — Itinerary Generator (Hackathon Highlight)

**Input**: Destination, number of days, budget, interests (multi-select categories)
**Output**: Structured day-by-day plan (JSON from OpenAI, rendered into the itinerary builder as a pre-filled draft the user can then edit)

**Failure handling (critical for live demo)**:
- 8-second timeout on the OpenAI call
- On timeout/error/rate-limit: fall back to a small set of pre-generated template itineraries for 3–5 popular demo destinations (e.g., Goa, Manali, Jaipur), so the demo never shows a blank error state
- Client shows a subtle "Generated from template" tag if fallback is used — this is a *feature*, not something to hide, and signals engineering maturity to judges

---

## 8. Non-Functional Requirements

- **Performance**: Itinerary builder interactions <200ms perceived latency; AI generation <8s or fallback triggers
- **Security**: Supabase RLS enforced on all tables — private trips are unreadable by non-owners at the database level, not just hidden in the UI
- **Responsiveness**: Fully usable on mobile browser widths (375px+) through desktop
- **Availability for demo**: All core flows must work without live internet dependency where possible (AI fallback covers this for the AI feature specifically)
- **Accessibility**: Semantic HTML, keyboard-navigable forms, sufficient color contrast (shadcn/ui defaults help here)

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| OpenAI rate-limited/down during judging | Template fallback (see §7) |
| Wifi fails during live demo | Pre-seed a demo account with a fully built trip as backup; don't rely on live AI call in the actual demo script |
| Realtime sync bugs under demo pressure | Keep sync scope narrow (stop/activity add & reorder only); test with 2 devices before demo day |
| Scope creep with 4+ people | Hard-freeze feature list after Phase 3 (see Implementation Plan doc); anything new goes on a "stretch" list |
| RLS misconfiguration exposes private trips | Write RLS policy tests as part of Phase 1 setup, not an afterthought |

---

## 10. Success Criteria

A successful submission demonstrates:
- Auth + relational DB usage with proper RLS
- Multi-city trip planning with live collaboration
- Budget tracking with visual breakdown
- Community sharing (publish/browse/like/copy)
- AI-powered itinerary generation with a resilient fallback
- Responsive, accessible UI
- A clean, complete end-to-end demo flow

---

## 11. Demo Script (10 steps, ~3 min)

1. Login (pre-seeded demo account)
2. Show Dashboard with existing trips
3. Create New Trip → enter destination/dates/budget
4. Generate AI Itinerary live (or gracefully show fallback)
5. Add/edit an activity — show it live-sync to a second logged-in browser/device
6. Show Budget breakdown with pie chart
7. Show Calendar/Timeline view
8. Publish trip to Community
9. Browse Community, like + copy someone else's trip
10. Show Admin dashboard analytics

---

*Next document: **02-TRD** (Technical Requirements Document) — covers stack justification, environment setup, third-party service configuration, and technical constraints.*

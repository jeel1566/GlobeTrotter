# GlobeTrotter AI — Backend Schema & API Design

**Doc 7 of 9** · Version 2.0 · Next.js Route Handlers, REST-style

---

## 1. Conventions

- Base path: `/api`
- Auth: Clerk session required on all routes except `GET /api/community` (public browsing) and public trip reads
- All responses: `{ data: T }` on success, `{ error: string, code: string }` on failure
- Dates: ISO 8601 strings
- Money: numbers in smallest display unit's decimal form (e.g., `1500.00`), currency assumed INR app-wide (no multi-currency in MVP)

---

## 2. Auth & Webhooks

### `POST /api/webhooks/clerk`
Receives Clerk lifecycle events. Verifies svix signature using `CLERK_WEBHOOK_SECRET`.

**Handles**: `user.created`, `user.updated`

```json
// Incoming (Clerk event, abbreviated)
{ "type": "user.created", "data": { "id": "user_abc", "email_addresses": [...], "first_name": "..." } }
```

Upserts into `users` (service-role key, bypasses RLS intentionally — see DB design §4).

---

## 3. Trips

### `GET /api/trips`
Returns the authenticated user's trips.
Query params: `?status=draft|active|completed` (optional filter)

```json
{ "data": [ { "id": "uuid", "title": "Goa Trip", "start_date": "2026-10-01", "end_date": "2026-10-05", "budget_total": 20000, "cover_image_url": "...", "visibility": "private", "status": "draft" } ] }
```

### `POST /api/trips`
```json
// Request
{ "title": "Goa Trip", "description": "...", "start_date": "2026-10-01", "end_date": "2026-10-05", "budget_total": 20000, "visibility": "private" }
// Response: 201, { "data": { "id": "uuid", ...full trip } }
```

### `GET /api/trips/:tripId`
Returns trip + nested stops + activities (single call to hydrate the builder screen).
```json
{ "data": { "id": "uuid", "title": "...", "stops": [ { "id": "uuid", "city": "Goa", "order_index": 0, "activities": [ { "id": "uuid", "title": "Beach Visit", "category": "nature", "cost": 0, "order_index": 0 } ] } ] } }
```

### `PATCH /api/trips/:tripId`
Partial update (title, dates, budget, visibility, status). RLS ensures only the owner can succeed.

### `DELETE /api/trips/:tripId`
Cascades to stops/activities/budget_items via DB `on delete cascade`.

---

## 4. Trip Stops

### `POST /api/trips/:tripId/stops`
```json
// Request
{ "city": "Mumbai", "country": "India", "arrival_date": "2026-10-02", "departure_date": "2026-10-03" }
// order_index is server-assigned = current max + 1
// Response: 201, { "data": { "id": "uuid", ...full stop } }
```

### `PATCH /api/trips/:tripId/stops/reorder`
Full resequencing per System Design §3.2 — client sends the complete new order.
```json
// Request
{ "order": [ { "id": "stop-uuid-1", "order_index": 0 }, { "id": "stop-uuid-2", "order_index": 1 } ] }
// Response: 200, { "data": { "updated": 2 } }
```

### `DELETE /api/trips/:tripId/stops/:stopId`
Cascades to activities under that stop.

---

## 5. Activities

### `POST /api/trips/:tripId/stops/:stopId/activities`
```json
// Request
{ "title": "Old Goa Tour", "category": "culture", "cost": 500, "duration_minutes": 180, "notes": "" }
// Response: 201, { "data": { "id": "uuid", ...full activity } }
```

### `PATCH /api/trips/:tripId/activities/:activityId`
Partial update.

### `DELETE /api/trips/:tripId/activities/:activityId`

---

## 6. Budget

### `GET /api/trips/:tripId/budget`
```json
{
  "data": {
    "budget_total": 20000,
    "planned_cost": 14200,
    "remaining": 5800,
    "by_category": { "flights": 6000, "hotels": 4000, "food": 1800, "activities": 2400, "transport": 0, "shopping": 0 },
    "items": [ { "id": "uuid", "category": "flights", "label": "Flight to Goa", "amount": 6000 } ]
  }
}
```
Computed server-side per DB design §5 (activities cost + budget_items amount, grouped by category).

### `POST /api/trips/:tripId/budget/items`
```json
{ "category": "hotels", "label": "Beach resort, 3 nights", "amount": 9000 }
```

### `DELETE /api/trips/:tripId/budget/items/:itemId`

---

## 7. Places (Dynamic City/Activity Search)

### `GET /api/places/search?query=Tokyo`
Checks `places_cache` first; on miss, calls Google Places API and caches the result (Architecture §3.4).
```json
{
  "data": [
    { "google_place_id": "ChIJ...", "name": "Tokyo", "formatted_address": "Tokyo, Japan", "latitude": 35.6762, "longitude": 139.6503, "photo_url": "...", "place_types": ["locality"] }
  ]
}
```

### `GET /api/places/:googlePlaceId`
Full place details, same cache-first pattern.
```json
{ "data": { "google_place_id": "ChIJ...", "name": "Senso-ji Temple", "formatted_address": "...", "photo_url": "...", "place_types": ["tourist_attraction"] } }
```

### `POST /api/ai/estimate-cost`
On-demand cost estimate for an activity in a given city — this is what makes budgets feel "smart" for any destination, not just curated ones.
```json
// Request
{ "city": "Tokyo", "activity_title": "Half-day city tour", "category": "culture" }
// Response
{ "data": { "estimated_cost": 3500, "currency": "INR", "confidence": "estimate", "note": "AI-estimated based on typical mid-range pricing" } }
```
Client always labels this as "Estimated" in the UI (per UI/UX doc) — never presented as verified real-time pricing.

---

## 8. AI Itinerary Generation

### `POST /api/ai/generate-itinerary`
```json
// Request
{ "destination": "Goa", "days": 5, "budget": 20000, "interests": ["food", "beaches"], "trip_id": "uuid-or-null" }

// Response (success)
{
  "data": {
    "fallback": false,
    "days": [
      { "day": 1, "title": "Arrival", "activities": [ { "title": "Check-in & Beach Walk", "category": "nature", "estimated_cost": 0 } ] },
      { "day": 2, "title": "Water Sports", "activities": [ { "title": "Jet Ski", "category": "adventure", "estimated_cost": 1500 } ] }
    ]
  }
}

// Response (fallback triggered — same shape, flag differs)
{ "data": { "fallback": true, "days": [ ...template itinerary... ] } }

// Response (daily cap exceeded) — 429
{ "error": "Daily AI generation limit reached. Try again tomorrow.", "code": "AI_LIMIT_EXCEEDED" }
```
Server logic: check `ai_generations_today` cap → call OpenAI (8s timeout, function-calling for structured output) → on any failure, select closest-matching template → log to `ai_generation_log` → increment `ai_generations_today` (success or fallback both count against the cap, template selection doesn't call OpenAI but still protects against abuse of the endpoint itself).

---

## 9. Community

### `GET /api/community`
Public, no auth required. Paginated.
```json
// Query: ?page=1&limit=20&category=food (optional interest filter, joins via activities — stretch goal)
{ "data": [ { "id": "uuid", "title": "5 Days in Goa", "cover_image_url": "...", "like_count": 24, "owner_name": "Jeel" } ], "meta": { "page": 1, "has_more": true } }
```

### `POST /api/community/:tripId/like`
Idempotent — relies on `trip_likes` composite PK to no-op on duplicate (System Design §5).
```json
{ "data": { "liked": true, "like_count": 25 } }
```
### `DELETE /api/community/:tripId/like` — unlike

### `POST /api/community/:tripId/save`
Same pattern as like, writes to `trip_saves`.

### `POST /api/community/:tripId/copy`
```json
// Response: 201, { "data": { "new_trip_id": "uuid" } }
```
Implements clone logic from DB design §6.

---

## 10. Profile

### `GET /api/users/me`
### `PATCH /api/users/me`
```json
{ "name": "Jeel Patel", "bio": "...", "avatar_url": "..." }
```

---

## 11. Admin (role-gated: middleware checks `users.role === 'admin'`, else 403)

### `GET /api/admin/stats`
```json
{ "data": { "total_users": 142, "total_trips": 89, "public_trips": 31, "popular_cities": [ { "city": "Goa", "count": 18 } ] } }
```

---

## 12. Error Codes Reference

| Code | Meaning |
|---|---|
| `UNAUTHORIZED` | No valid Clerk session |
| `FORBIDDEN` | Authenticated but not permitted (e.g., non-owner edit attempt — should rarely surface since RLS blocks it first, but the API layer double-checks for clearer error messages) |
| `NOT_FOUND` | Resource doesn't exist or isn't visible to this user |
| `VALIDATION_ERROR` | Bad request shape/values |
| `AI_LIMIT_EXCEEDED` | Daily AI generation cap hit |
| `AI_GENERATION_FAILED` | Should rarely surface to client — fallback should absorb this |

---

*Next document: **08-Implementation-Plan** — phased build order mapped to your 4+ person team.*

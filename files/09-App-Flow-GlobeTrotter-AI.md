# GlobeTrotter AI — App Flow

**Doc 9 of 9** · Version 2.0

---

## 1. Purpose

This is the consolidated, end-to-end flow reference — what happens, screen by screen and system by system, tying together the PRD (what), UI/UX (how it looks), Architecture (what talks to what), and API design (exact calls). Use this as the single doc to sanity-check the whole system before demo day.

---

## 2. Full New-User Journey

```mermaid
flowchart TD
    A[Landing Page] --> B{Has account?}
    B -->|No| C[Sign Up via Clerk]
    B -->|Yes| D[Log In via Clerk]
    C --> E[Clerk fires user.created webhook]
    E --> F[users row created in Supabase]
    F --> G[Dashboard - empty state]
    D --> G2[Dashboard - with trips]
    G --> H[Create Trip]
    G2 --> H
    H --> I[POST /api/trips]
    I --> J[Itinerary Builder]
    J --> K{Use AI or manual?}
    K -->|AI| L[POST /api/ai/generate-itinerary]
    K -->|Manual| M[Add stops/activities manually]
    L --> N[Draft itinerary inserted, user edits]
    M --> N
    N --> O[Budget Screen - auto-calculated]
    O --> P[Calendar View]
    P --> Q[Itinerary Review]
    Q --> R[Publish to Community]
    R --> S[Community Browse - others can like/save/copy]
```

---

## 3. Collaborative Editing Flow (the live-sync differentiator)

```mermaid
sequenceDiagram
    participant A as User A (device 1)
    participant RH as Route Handler
    participant DB as Supabase Postgres
    participant RT as Realtime Engine
    participant B as User B (device 2)

    A->>RH: POST /api/trips/:id/stops (add "Mumbai")
    RH->>DB: INSERT trip_stops
    DB-->>RT: change event
    RT-->>A: push update (own change, client already has it)
    RT-->>B: push update
    B->>B: UI updates - "Mumbai" appears with highlight animation
    Note over A,B: Both users now see identical itinerary state
```

---

## 4. AI Generation Flow (with fallback path made explicit)

```mermaid
sequenceDiagram
    participant U as User
    participant RH as Route Handler
    participant AI as OpenAI API
    participant DB as Supabase

    U->>RH: POST /api/ai/generate-itinerary
    RH->>DB: check ai_generations_today < cap
    alt cap exceeded
        RH-->>U: 429 AI_LIMIT_EXCEEDED
    else within cap
        RH->>AI: generate itinerary (8s timeout)
        alt success
            AI-->>RH: structured JSON
            RH->>DB: log ai_generation_log (fallback: false)
            RH-->>U: itinerary (fallback: false)
        else timeout / error / rate-limited
            RH->>RH: select closest template
            RH->>DB: log ai_generation_log (fallback: true)
            RH-->>U: itinerary (fallback: true) + subtle badge
        end
    end
```

---

## 5. Trip Visibility & Security Flow

```mermaid
flowchart TD
    A[User requests trip data] --> B{Row Level Security check}
    B -->|user_id matches session| C[Full access - owner]
    B -->|visibility = public| D[Read-only access - viewer]
    B -->|neither| E[404 - not found, even if trip exists]
    D --> F[budget_items still blocked - owner only, per RLS]
```

This is the flow worth walking a judge through if asked "is private data actually private?" — the answer is enforced at the database layer (Database Design §4), not just hidden in the UI.

---

## 6. Copy Trip Flow

```mermaid
flowchart LR
    A[User views public trip] --> B[Click Copy]
    B --> C[POST /api/community/:tripId/copy]
    C --> D[Clone trips row - new owner, visibility=private, status=draft]
    D --> E[Clone trip_stops - new trip_id]
    E --> F[Clone activities - notes stripped]
    F --> G{budget_items_public?}
    G -->|No, default| H[Skip budget clone]
    G -->|Yes| I[Clone budget_items]
    H --> J[New trip appears in copier's Dashboard]
    I --> J
```

---

## 7. Error/Failure Flow (applies system-wide)

```mermaid
flowchart TD
    A[Any API call fails] --> B{Error type}
    B -->|Auth| C[Redirect to login]
    B -->|Not found / RLS block| D[404 page or 'not available' state]
    B -->|Validation| E[Inline form error, no request sent]
    B -->|Network/timeout| F[Toast notification with retry]
    B -->|AI-specific| G[Fallback path - see §4, never surfaces as raw error]
```

---

## 8. How the Nine Documents Connect

| Doc | Answers |
|---|---|
| 01 PRD | *What* are we building and *why* |
| 02 TRD | *What tools* and *how is the environment set up* |
| 03 Database Design | *What data* and *how is it protected* |
| 04 Architecture | *What components* and *how do they connect* |
| 05 System Design | *What happens under load/conflict/edge cases* |
| 06 UI/UX | *What does it look like and feel like* |
| 07 Backend/API Design | *Exact contracts* between frontend and backend |
| 08 Implementation Plan | *Who builds what, in what order* |
| 09 App Flow (this doc) | *How it all executes end-to-end* |

---

## 9. Final Pre-Demo Checklist

- [ ] Demo account seeded with a complete, good-looking trip
- [ ] AI fallback tested and confirmed working (force a failure once, verify)
- [ ] RLS tested across two accounts (private trip inaccessible to non-owner)
- [ ] Live sync tested across two real devices, not just two browser tabs on one laptop
- [ ] Demo script (PRD §11) rehearsed at least twice
- [ ] Answers ready for: "What if the AI API is down?", "How do you handle concurrent edits?", "Is data actually private?" — all answered by this doc set

**This completes the 9-document set for GlobeTrotter AI.**

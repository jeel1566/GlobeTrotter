# 🌍 GlobeTrotter — AI-Powered SaaS Travel Planning Platform

> **Where the Simplicity of Airbnb, Productivity of Notion, Polish of Linear, and Intelligence of AI Converge.**

GlobeTrotter is a full-stack, production-ready AI travel operating system built for modern explorers. It automates day-by-day itinerary synthesis, multi-stop route planning, and granular budget tracking while providing a personal workspace and public community expedition sharing.

---

## ✨ Highlights & Architecture

- **🤖 Zero-Cost AI Engine**: Powered by Groq (`llama-3.3-70b`) and Google Gemini (`gemini-1.5-flash`) with an 8-second circuit breaker and 5 hand-curated fallback templates (Goa, Manali, Jaipur, Tokyo, Paris). Never crashes, even without active API keys.
- **🗺️ Global Places & Geocoding**: OpenStreetMap (Photon) API integration with local Postgres caching (`places_cache`) and manual-entry fallback.
- **🔐 Modern Auth & Trust Boundaries**: Clerk Authentication synchronized via Svix-verified webhooks to Supabase PostgreSQL, enforced by strict server-side owner boundaries and hardened RLS policies.
- **💎 Agency-Grade Visual Architecture**: Built using the `/high-end-visual-design` principles:
  - **Double-Bezel Enclosures (Doppelrand)**: Machined outer shell with concentric specular inner core.
  - **Button-in-Button Architecture**: Fully rounded pill geometry with nested kinetic trailing icon circles.
  - **Component Ecosystem**: Radix UI / shadcn primitives (`Button`, `Card`, `Dialog`, `Sheet`, `Tabs`, `Popover`, `Calendar`, `Avatar`), Aceternity UI (`Spotlight`, `BackgroundBeams`), and Framer Motion.

---

## 📱 12 Verified Core Screens

1. **Landing Page (`/`)**: Image-led hero, natural language prompt bar, curated bento destinations, and interactive FAQs.
2. **Authentication (`/sign-in` & `/sign-up`)**: Mount Fuji sunrise split-screen with Clerk auth cards and social proof.
3. **Traveler Dashboard (`/dashboard`)**: Dynamic traveler greeting, active trip departure board, real trip metrics, and 1-click demo seeder.
4. **AI Trip Creator (`/trips/create`)**: Natural language prompt input, budget slider, vibe selection, failure-safe partial-save state, and day-by-day preview.
5. **Itinerary Builder (`/trips/[tripId]`)**: Notion/Linear-inspired workspace with persistent stop CRUD, stop reordering, activity timeline management, and owner-only public visibility controls.
6. **Executive Travel Calendar (`/calendar`)**: 7-column time grid rendering real persisted stops, activities, and daily schedules directly from your saved trips.
7. **Community Hub (`/community`)**: Data-backed public trip feed from `/api/community` with live likes, bookmark saves, 1-click safe trip cloning (`/api/community/[tripId]/copy`), and labeled editorial inspiration.
8. **Explore Split Canvas (`/explore`)**: Prototype spot explorer with date picker, curated spot feeds, and interactive vector map canvas.
9. **Shared Public Itinerary (`/trips/[tripId]/view`)**: Secure public read-only presentation mode powered strictly by `/api/public/trips/[tripId]` with stripped private notes and budget totals, plus clone-to-workspace action.
10. **Traveler Passport & Profile (`/profile`)**: Authenticated traveler passport overview with real trip statistics and preview galleries for country stamps and milestone trophies.
11. **AI Copilot Studio (`/copilot`)**: Conversational itinerary synthesis assistant connected to `/api/ai/generate-itinerary` with direct export to the trip creator.
12. **Admin Analytics Dashboard (`/admin`)**: Live telemetry suite connected to `/api/admin/stats` with role-based access control and system health monitors.

---

## ⏳ Explicitly Deferred in Current Version

To maintain extreme reliability, security, and a green build for the hackathon release, the following items are intentionally deferred:
- **Realtime Collaboration**: Supabase Realtime multi-cursor editing and live presence indicators (replaced with robust owner editing and public trip cloning).
- **External Booking & Live Feeds**: Live airline GDS feeds, real-time hotel booking checkouts, and weather APIs.
- **Native Mobile Apps**: Native iOS/Android builds, PWA offline caching, and push notifications.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Route Handlers)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS, PostCSS, Radix UI Primitives, Lucide Icons
- **Animation**: Framer Motion
- **Authentication**: Clerk (`@clerk/nextjs`, Svix webhook verification)
- **Database**: Supabase (`@supabase/supabase-js`, PostgreSQL with hardened RLS)
- **AI & Geocoding**: Groq SDK, Google Generative AI, OpenStreetMap Photon API
- **Date Handling**: `date-fns`

---

## 🚀 Quickstart & Setup

### 1. Clone the Repository
```bash
git clone git@github.com:jeel1566/GlobeTrotter.git
cd GlobeTrotter
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Clerk and Supabase credentials:
```bash
cp .env.example .env.local
```

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Keys (Optional - Curated Fallbacks enabled by default)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIzaSy...
```

### 4. Database Setup
Run the SQL migrations in your Supabase SQL Editor in sequence:
1. [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) (Relational schema)
2. [`supabase/migrations/002_harden_rls.sql`](./supabase/migrations/002_harden_rls.sql) (RLS security hardening & constraints)

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Quality Verification

```bash
# Type check
./node_modules/.bin/tsc --noEmit --pretty false

# Lint check
npm run lint

# Production build
npm run build
```
All 20 static and dynamic routes compile deterministically with zero errors.

---

## 📄 License
MIT License © 2026 GlobeTrotter Inc. Crafted with precision for the next generation of global explorers.

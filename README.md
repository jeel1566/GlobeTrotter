# 🌍 GlobeTrotter — AI-Powered SaaS Travel Planning Platform

> **Where the Simplicity of Airbnb, Productivity of Notion, Polish of Linear, and Intelligence of ChatGPT Converge.**

GlobeTrotter is a full-stack, production-ready AI travel operating system built for modern explorers. It automates day-by-day itinerary synthesis, transit calculation, and budget tracking while providing collaborative workspaces, interactive maps, and community expedition sharing.

---

## ✨ Highlights & Architecture

- **🤖 Zero-Cost AI Engine**: Powered by Groq / Gemini with an 8-second circuit breaker and 5 hand-curated fallback templates (Goa, Manali, Jaipur, Tokyo, Paris). Never fails, even without paid API keys.
- **🗺️ Global Places & Geocoding**: Fully free OpenStreetMap (Photon) API integration with local Postgres caching and high-resolution Unsplash destination photography.
- **🔐 Modern Auth & Row-Level Security**: Clerk Authentication synchronizes seamlessly with Supabase PostgreSQL RLS policies and Realtime replication.
- **💎 Agency-Grade Visual Architecture**: Built using the `/high-end-visual-design` principles:
  - **Double-Bezel Enclosures (Doppelrand)**: Machined outer shell with concentric specular inner core.
  - **Button-in-Button Architecture**: Fully rounded pill geometry with nested kinetic trailing icon circles.
  - **Component Ecosystem**: shadcn/ui (`Button`, `Card`, `Dialog`, `Drawer`, `Sheet`, `Tabs`, `Accordion`, `Popover`, `Calendar`, `Avatar`, `Tooltip`, `Command`, `Combobox`, `Carousel`), Aceternity UI (`Spotlight`, `BackgroundBeams`, `BentoGrid`), Magic UI (`ShimmerButton`), and Framer Motion.

---

## 📱 12 Verified Core Screens

1. **Landing Page (`/`)**: Cinematic hero, natural language prompt bar, curated bento destinations, and interactive FAQs.
2. **Authentication (`/sign-in` & `/sign-up`)**: Mount Fuji sunrise split-screen with Clerk auth cards and social proof.
3. **Traveler Dashboard (`/dashboard`)**: Dynamic traveler greeting, active trip countdown, live statistics, and 1-click demo seeder.
4. **AI Trip Creator (`/trips/create`)**: Natural language prompt input, budget slider, vibe pills, and day-by-day preview.
5. **Itinerary Builder (`/trips/[tripId]`)**: 3-Column Notion/Linear workspace with day outline, drag-and-drop vertical timeline, transit connectors, and live Card Inspector with Apple Wallet QR pass.
6. **Explore Split Canvas (`/explore`)**: Filter dock with date Popover/Calendar, curated spot feed, and interactive Kyoto/Tokyo vector map canvas.
7. **Executive Travel Calendar (`/calendar`)**: 7-column time grid with flight tracking, hotel stays, multi-layer layer pills, and timezone normalization.
8. **Community Hub (`/community`)**: Verified field guides, social fork metrics, and 1-click **"Fork Itinerary (Clone into your trips)"**.
9. **Traveler Passport & Profile (`/profile`)**: Pro traveler credentials, 14 Countries Visited gallery, milestone trophy shelf, and currency preferences.
10. **Shared Itinerary View (`/trips/[tripId]/view`)**: Presentation mode with photo Carousel, day breakdown Accordions, and print-ready PDF export.
11. **AI Copilot Studio (`/copilot`)**: Conversational itinerary synthesis canvas with contextual prompt chips and direct workspace export.
12. **Admin Analytics Dashboard (`/admin`)**: Telemetry suite connected to `/api/admin/stats` with route volume tracking and API health monitors.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS, PostCSS, Radix UI Primitives, Lucide Icons
- **Animation**: Framer Motion, Motion Primitives
- **Authentication**: Clerk (`@clerk/nextjs`)
- **Database & Realtime**: Supabase (`@supabase/supabase-js`, PostgreSQL with RLS)
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

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional AI (Fallbacks enabled by default)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIzaSy...
```

### 4. Database Setup
Run the SQL migration in [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) inside your Supabase SQL Editor.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build Verification

```bash
npm run build
```
All 20 static and dynamic routes compile cleanly with zero errors.

---

## 📄 License
MIT License © 2025 GlobeTrotter Inc. Crafted with precision for the next generation of global explorers.

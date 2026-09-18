"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import AskAIAssistant from "@/components/AskAIAssistant";
import CreateTripModal from "@/components/CreateTripModal";
import {
  Search,
  Bell,
  Plane,
  Globe2,
  Wallet,
  Bookmark,
  Sparkles,
  Compass,
  Calendar,
  MapPin,
  Heart,
  ArrowUpRight,
  Plus,
} from "lucide-react";

export default function HomeDashboard() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tripsList, setTripsList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/trips")
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data)) {
          setTripsList(json.data);
        }
      })
      .catch((err) => console.error("Error loading trips:", err));
  }, []);

  const upcomingTrip = {
    id: "japan-2026",
    title: "Japan Autumn Odyssey 2026",
    subtitle: "Tokyo • Kyoto • Osaka",
    dates: "Oct 12 – Oct 22, 2026",
    daysCount: "10 Days",
    countdown: "24 days to departure",
    progress: 72,
    budgetPlanned: "₹1,98,400",
    budgetTotal: "₹2,50,000",
    coverImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    collaborators: [
      { name: "Jeel Patel", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" },
      { name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" },
      { name: "Alex", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" },
    ],
  };

  const recentTrips = [
    {
      id: "goa-2026",
      title: "Goa Beach & Culture Retreat",
      dates: "Dec 05 – Dec 10, 2026",
      duration: "5 Days",
      stops: "Panaji • Vagator • Palolem",
      budget: "₹38,000",
      status: "Planning",
      coverImage:
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
      likes: 42,
    },
    {
      id: "rajasthan-2026",
      title: "Royal Rajasthan Circuit",
      dates: "Jan 14 – Jan 21, 2027",
      duration: "7 Days",
      stops: "Jaipur • Jodhpur • Udaipur",
      budget: "₹65,000",
      status: "Draft",
      coverImage:
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
      likes: 89,
    },
    {
      id: "swiss-2027",
      title: "Swiss Alps Scenic Rail & Trail",
      dates: "May 02 – May 09, 2027",
      duration: "8 Days",
      stops: "Zurich • Interlaken • Zermatt",
      budget: "₹2,10,000",
      status: "Wishlist",
      coverImage:
        "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80",
      likes: 124,
    },
  ];

  const popularDestinations = [
    {
      name: "Kyoto, Japan",
      tagline: "Autumn Foliage & Ancient Temples",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
      activeTrips: "482 travelers planning",
    },
    {
      name: "Amalfi Coast, Italy",
      tagline: "Cliffside Villages & Turquoise Seas",
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
      activeTrips: "310 travelers planning",
    },
    {
      name: "Bali, Indonesia",
      tagline: "Waterfalls, Rice Terraces & Surf",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
      activeTrips: "520 travelers planning",
    },
    {
      name: "Paris, France",
      tagline: "Boutique Cafes, Art & Romance",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
      activeTrips: "640 travelers planning",
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row antialiased bg-canvas text-obsidian-900">
      {/* Bespoke Architectural Sidebar */}
      <Sidebar onOpenAI={() => setIsAiOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-canvas overflow-y-auto">
        {/* Floating Top Architectural Header */}
        <header className="px-6 md:px-12 py-5 flex items-center justify-between gap-6 border-b border-black/[0.04] bg-canvas/80 backdrop-blur-md sticky top-0 z-30">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-3.5 h-3.5 text-obsidian-900/40 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.3} />
            <input
              type="search"
              placeholder="Search destinations, curated routes, or places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs font-medium bg-black/[0.03] border border-black/[0.05] text-obsidian-900 placeholder-obsidian-900/40 focus:border-obsidian-900 focus:bg-white focus:ring-1 focus:ring-obsidian-900 transition-all duration-500 ease-luxury outline-none shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Ask AI Pill Button */}
            <button
              onClick={() => setIsAiOpen(true)}
              className="group hidden sm:inline-flex items-center gap-2.5 pl-3.5 pr-2 py-1.5 rounded-full bg-obsidian-900 text-white text-xs font-medium shadow-hardware hover:bg-obsidian-850 active:scale-[0.98] transition-all duration-500 ease-luxury"
            >
              <span className="text-[11px] tracking-wide text-[#faf9f6]">Ask AI Copilot</span>
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 ease-luxury group-hover:scale-110">
                <Sparkles className="w-2.5 h-2.5 text-brand-200" strokeWidth={1.4} />
              </span>
            </button>

            {/* Notification Bell with Concentric Bezel */}
            <button className="relative p-2 rounded-full bg-black/[0.03] border border-black/[0.04] text-obsidian-900/60 hover:text-obsidian-900 hover:bg-black/[0.05] transition-all duration-300">
              <Bell className="w-4 h-4" strokeWidth={1.3} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-600 rounded-full" />
            </button>

            {/* User Profile Mini Badge */}
            <Link href="/profile" className="flex items-center gap-2.5 pl-1 group cursor-pointer">
              <div className="p-0.5 rounded-full ring-1 ring-black/[0.08] group-hover:ring-obsidian-900 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Jeel Patel"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-obsidian-900 leading-tight group-hover:text-brand-700 transition-colors">
                  Jeel Patel
                </p>
                <p className="text-[10px] text-obsidian-900/40">Verified Traveler</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Dashboard Body Container with Macro Whitespace */}
        <div className="p-6 md:p-12 space-y-12 max-w-7xl">
          {/* Hero Greeting & Editorial Headline */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black/[0.03] border border-black/[0.06] text-obsidian-900/70 text-[10px] uppercase tracking-[0.2em] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                  Live Sync Active • Autumn 2026
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-obsidian-900">
                  Welcome back, <span className="font-serif italic font-normal text-brand-700">Jeel</span>
                </h1>
                <p className="text-xs md:text-sm text-obsidian-900/50 max-w-xl font-light leading-relaxed">
                  Every journey unfolds in two moments: the quiet anticipation of planning and the vibrant memories collected on the open road.
                </p>
              </div>

              {/* Primary Call to Action: Button-in-Button */}
              <div className="shrink-0 pt-2 md:pt-0">
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="group relative inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-obsidian-900 text-white font-medium text-xs tracking-wide shadow-hardware hover:bg-obsidian-850 active:scale-[0.98] transition-all duration-500 ease-luxury"
                >
                  <span>Plan New Journey</span>
                  <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 ease-luxury group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                    <Plus className="w-3.5 h-3.5 text-brand-200" strokeWidth={1.4} />
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bento Row: Doppelrand Concentric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-1.5 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="p-4 rounded-[calc(1.75rem-0.375rem)] bg-white shadow-hardware flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-black/[0.03] text-obsidian-900 flex items-center justify-center shrink-0">
                    <Plane className="w-4 h-4 text-obsidian-800" strokeWidth={1.3} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-obsidian-900 leading-tight">3</p>
                    <p className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold">Active Itineraries</p>
                  </div>
                </div>
              </div>

              <div className="p-1.5 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="p-4 rounded-[calc(1.75rem-0.375rem)] bg-white shadow-hardware flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-black/[0.03] text-obsidian-900 flex items-center justify-center shrink-0">
                    <Globe2 className="w-4 h-4 text-obsidian-800" strokeWidth={1.3} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-obsidian-900 leading-tight">5</p>
                    <p className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold">Countries Explored</p>
                  </div>
                </div>
              </div>

              <div className="p-1.5 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="p-4 rounded-[calc(1.75rem-0.375rem)] bg-white shadow-hardware flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-black/[0.03] text-obsidian-900 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4 text-obsidian-800" strokeWidth={1.3} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-obsidian-900 leading-tight">₹1,98,400</p>
                    <p className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold">Budget Allocated</p>
                  </div>
                </div>
              </div>

              <div className="p-1.5 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="p-4 rounded-[calc(1.75rem-0.375rem)] bg-white shadow-hardware flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-black/[0.03] text-obsidian-900 flex items-center justify-center shrink-0">
                    <Bookmark className="w-4 h-4 text-obsidian-800" strokeWidth={1.3} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-obsidian-900 leading-tight">12</p>
                    <p className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold">Curated Bookmarks</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Asymmetrical Bento Grid: Spotlight Trip (8 cols) & Intelligent Quick-Tiles (4 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left 8 Columns: Featured Upcoming Journey (Doppelrand) */}
            <div className="xl:col-span-8 space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-obsidian-900/40">
                    Spotlight Expedition
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-800 text-[10px] font-semibold tracking-wide">
                    {upcomingTrip.countdown}
                  </span>
                </div>
                <Link
                  href="/trips"
                  className="group text-xs font-semibold text-obsidian-900 flex items-center gap-1.5 hover:text-brand-700 transition-colors duration-300"
                >
                  <span>Detailed Itinerary</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.3} />
                </Link>
              </div>

              {/* Doppelrand Outer Shell */}
              <div className="p-2 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                {/* Doppelrand Inner Core */}
                <div className="rounded-[calc(2rem-0.5rem)] bg-white overflow-hidden shadow-hardware group">
                  <div className="relative h-80 sm:h-96 overflow-hidden">
                    <img
                      src={upcomingTrip.coverImage}
                      alt={upcomingTrip.title}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-luxury"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/35 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-5 left-5 flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[#faf9f6] text-xs font-medium flex items-center gap-2 border border-white/15 shadow-hardware">
                        <Calendar className="w-3.5 h-3.5 text-brand-200" strokeWidth={1.3} />
                        {upcomingTrip.dates} ({upcomingTrip.daysCount})
                      </span>
                    </div>

                    {/* Collaborator Avatars */}
                    <div className="absolute top-5 right-5 flex items-center -space-x-2">
                      {upcomingTrip.collaborators.map((c, i) => (
                        <img
                          key={i}
                          src={c.avatar}
                          alt={c.name}
                          title={c.name}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                      ))}
                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="w-8 h-8 rounded-full border-2 border-white bg-white/90 backdrop-blur-md text-obsidian-900 flex items-center justify-center font-bold text-xs hover:bg-white transition shadow-sm"
                        title="Add co-traveler"
                      >
                        +
                      </button>
                    </div>

                    {/* Card Hero Content */}
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-200/90 block">
                          Curated Route
                        </span>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                          {upcomingTrip.title}
                        </h3>
                        <p className="text-xs text-white/80 font-medium flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-300" strokeWidth={1.3} />
                          {upcomingTrip.subtitle}
                        </p>
                      </div>

                      <Link
                        href="/trips"
                        className="group relative self-start sm:self-auto inline-flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full bg-white text-obsidian-900 font-semibold text-xs shadow-hardware hover:bg-canvas transition-all duration-300"
                      >
                        <span>Open Explorer</span>
                        <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                          <ArrowUpRight className="w-3 h-3 text-obsidian-900" strokeWidth={1.4} />
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Hardware Telemetry Bar */}
                  <div className="p-6 bg-canvas-subtle/40 border-t border-black/[0.04] flex flex-wrap items-center justify-between gap-6">
                    <div className="flex-1 min-w-[220px] space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-obsidian-900/80">
                        <span className="text-[11px] uppercase tracking-wider text-obsidian-900/50">Itinerary Completion</span>
                        <span className="text-brand-700 font-bold">{upcomingTrip.progress}% ready</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-700 rounded-full transition-all duration-700 ease-luxury"
                          style={{ width: `${upcomingTrip.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-xs">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold">Planned Cost</p>
                        <p className="font-bold text-obsidian-900 text-sm">{upcomingTrip.budgetPlanned}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold">Cap Ceiling</p>
                        <p className="font-bold text-obsidian-900 text-sm">{upcomingTrip.budgetTotal}</p>
                      </div>
                      <Link
                        href="/budget"
                        className="px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] text-obsidian-900 font-semibold text-xs shadow-2xs hover:bg-black/[0.02] transition-colors"
                      >
                        Budget Ledger
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Intelligent Control Tiles (Doppelrand) */}
            <div className="xl:col-span-4 space-y-4">
              <div className="px-1">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-obsidian-900/40">
                  Quick Actions
                </span>
              </div>

              <div className="space-y-3.5">
                {/* Plan New Trip Tile */}
                <div className="p-1 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="w-full p-4 rounded-[calc(1.75rem-0.25rem)] bg-obsidian-900 text-white flex items-center justify-between shadow-hardware hover:bg-obsidian-850 active:scale-[0.99] transition-all duration-500 ease-luxury group text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center transition-transform duration-500 ease-luxury group-hover:scale-105">
                        <Plus className="w-4 h-4 text-brand-200" strokeWidth={1.4} />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-[#faf9f6]">Create New Itinerary</p>
                        <p className="text-[10px] text-white/50">Multi-city & live sync</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={1.3} />
                  </button>
                </div>

                {/* Ask AI Copilot Tile */}
                <div className="p-1 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                  <button
                    onClick={() => setIsAiOpen(true)}
                    className="w-full p-4 rounded-[calc(1.75rem-0.25rem)] bg-white text-obsidian-900 flex items-center justify-between shadow-hardware hover:bg-canvas-subtle/50 active:scale-[0.99] transition-all duration-500 ease-luxury group text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center transition-transform duration-500 ease-luxury group-hover:scale-105">
                        <Sparkles className="w-4 h-4 text-brand-600" strokeWidth={1.4} />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-obsidian-900">Ask AI Copilot</p>
                        <p className="text-[10px] text-obsidian-900/40">Multi-stage generation in 8s</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-obsidian-900/30 group-hover:text-obsidian-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={1.3} />
                  </button>
                </div>

                {/* Community Itineraries Tile */}
                <div className="p-1 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                  <Link
                    href="/community"
                    className="w-full p-4 rounded-[calc(1.75rem-0.25rem)] bg-white text-obsidian-900 flex items-center justify-between shadow-hardware hover:bg-canvas-subtle/50 active:scale-[0.99] transition-all duration-500 ease-luxury group text-left block"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-black/[0.03] text-obsidian-900 flex items-center justify-center transition-transform duration-500 ease-luxury group-hover:scale-105">
                        <Compass className="w-4 h-4 text-obsidian-700" strokeWidth={1.3} />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-obsidian-900">Community Discovery</p>
                        <p className="text-[10px] text-obsidian-900/40">1-click clone top plans</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-obsidian-900/30 group-hover:text-obsidian-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={1.3} />
                  </Link>
                </div>

                {/* Architectural Note / Pro Tip Card */}
                <div className="p-1.5 rounded-[1.75rem] bg-black/[0.02] ring-1 ring-black/[0.04]">
                  <div className="p-4 rounded-[calc(1.75rem-0.375rem)] bg-canvas-subtle/70 text-obsidian-900 space-y-1.5">
                    <p className="text-[11px] font-bold flex items-center gap-2 uppercase tracking-wider text-obsidian-900/60">
                      <span>✦</span>
                      <span>Real-time Sync</span>
                    </p>
                    <p className="text-xs text-obsidian-900/70 leading-relaxed font-light">
                      Collaborative changes update seamlessly across devices with zero refresh required. Share your invite link anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Trips Section (Doppelrand Bento Cards) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-obsidian-900/40 block">
                  Archive & Drafts
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-obsidian-900 tracking-tight mt-0.5">
                  Your Recent Expeditions
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="text-xs font-semibold text-obsidian-900 hover:text-brand-700 transition-colors"
              >
                + New Expedition
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(tripsList.length > 0 ? tripsList : recentTrips).map((trip) => (
                <div key={trip.id} className="p-1.5 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                  <div className="rounded-[calc(1.75rem-0.375rem)] bg-white overflow-hidden shadow-hardware hover:shadow-hardware-elevated transition-all duration-500 ease-luxury flex flex-col group h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={trip.cover_image_url || trip.coverImage}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxury"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-obsidian-950/20 to-transparent" />
                      
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[#faf9f6] text-[10px] font-medium border border-white/15">
                        {trip.duration || (trip.start_date && trip.end_date ? `${trip.start_date} – ${trip.end_date}` : "Upcoming")}
                      </span>
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white text-obsidian-900 text-[10px] font-bold shadow-2xs">
                        {trip.status}
                      </span>
                      
                      <div className="absolute bottom-3 left-3.5 right-3.5">
                        <p className="text-white text-sm font-bold leading-tight drop-shadow-xs">
                          {trip.title}
                        </p>
                        <p className="text-white/70 text-[10px] truncate mt-0.5">{trip.destination || trip.stops || ""}</p>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between text-xs text-obsidian-900/60">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3 h-3 text-obsidian-900/40" strokeWidth={1.3} />
                          {trip.dates || (trip.start_date ? `${trip.start_date} – ${trip.end_date}` : "Upcoming")}
                        </span>
                        <span className="font-bold text-obsidian-900 text-xs">
                          {typeof trip.budget_total === 'number' ? `₹${trip.budget_total.toLocaleString()}` : trip.budget}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-obsidian-900/40">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" strokeWidth={1.3} />
                          <span className="text-[11px] font-medium">{trip.likes_count || trip.likes || 0}</span>
                        </div>

                        <Link
                          href={`/trips`}
                          className="group inline-flex items-center gap-1 text-xs font-semibold text-obsidian-900 hover:text-brand-700 transition-colors"
                        >
                          <span>Explore</span>
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.4} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Curated Destinations */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-obsidian-900/40 block">
                  Curated Catalog
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-obsidian-900 tracking-tight mt-0.5">
                  Popular Worldwide Destinations
                </h3>
              </div>
              <Link href="/community" className="text-xs font-semibold text-obsidian-900 hover:text-brand-700 transition-colors">
                View All Destinations ↗
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularDestinations.map((dest, idx) => (
                <div
                  key={idx}
                  onClick={() => setIsCreateOpen(true)}
                  className="p-1 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04] cursor-pointer group"
                >
                  <div className="relative h-52 rounded-[calc(1.75rem-0.25rem)] overflow-hidden shadow-hardware">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-luxury"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h5 className="font-bold text-sm leading-tight drop-shadow-xs">{dest.name}</h5>
                      <p className="text-[10px] text-white/75 line-clamp-1 mt-0.5">{dest.tagline}</p>
                      <p className="text-[9px] text-brand-300 uppercase tracking-widest font-semibold mt-1.5">
                        {dest.activeTrips}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Floating Create Trip Modal with Doppelrand Architecture */}
      <CreateTripModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTripCreated={(newTrip) => setTripsList((prev) => [newTrip, ...prev])}
      />

      {/* Slide-over Ask AI Assistant Panel with Doppelrand Details */}
      <AskAIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}


"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AskAIAssistant from "@/components/AskAIAssistant";
import {
  Search,
  Bell,
  Heart,
  Bookmark,
  Copy,
  Sparkles,
  CheckCircle2,
} from "lucide-react";


interface CommunityTrip {
  id: string;
  title: string;
  description: string;
  destination: string;
  creator: {
    name: string;
    avatar: string;
    handle: string;
  };
  duration: string;
  coverImage: string;
  likes: number;
  liked?: boolean;
  saved?: boolean;
  tags: string[];
}

export default function CommunityTripsPage() {
  const router = useRouter();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Trips");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTripTitle, setCopiedTripTitle] = useState<string | null>(null);

  const [trips, setTrips] = useState<CommunityTrip[]>([
    {
      id: "trip-japan-10",
      title: "Japan in 10 Days: Tokyo, Kyoto & Osaka",
      description: "A harmonic balance of ancient Shinto shrines, Shinkansen bullet transfers, and neon night markets.",
      destination: "Japan",
      creator: {
        name: "Riya Sharma",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        handle: "@riyatravels",
      },
      duration: "10 Days",
      coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
      likes: 1240,
      tags: ["Culture", "Food", "Rail"],
    },
    {
      id: "trip-goa-5",
      title: "Backpacking Goa & Western Ghats",
      description: "Secluded waterfalls, Portuguese heritage villas, and spice plantation sunset trails.",
      destination: "India",
      creator: {
        name: "Arjun Verma",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        handle: "@arjunv",
      },
      duration: "5 Days",
      coverImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
      likes: 890,
      tags: ["Nature", "Beaches", "Heritage"],
    },
    {
      id: "trip-amalfi-7",
      title: "Amalfi Coast & Southern Italy Odyssey",
      description: "Positano cliffside lemon groves, private Capri grotto excursions, and artisan trattorias.",
      destination: "Italy",
      creator: {
        name: "Marco Rossi",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
        handle: "@marcorossi",
      },
      duration: "7 Days",
      coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
      likes: 2150,
      tags: ["Scenic", "Coastal", "Architecture"],
    },
    {
      id: "trip-swiss-8",
      title: "Swiss Alps Scenic Train & Glacier Trail",
      description: "Interlaken paragliding over turquoise lakes, Jungfraujoch ice palace, and Matterhorn vistas.",
      destination: "Switzerland",
      creator: {
        name: "Elena Weber",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
        handle: "@elena_w",
      },
      duration: "8 Days",
      coverImage: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80",
      likes: 1540,
      tags: ["Alpine", "Rail", "Hiking"],
    },
    {
      id: "trip-bali-6",
      title: "Bali Spiritual Sanctuaries & Rice Terraces",
      description: "Ubud sacred monkey forest, Tirta Empul purification springs, and artisan roasteries.",
      destination: "Indonesia",
      creator: {
        name: "Chloe Chen",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
        handle: "@chloechen",
      },
      duration: "6 Days",
      coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
      likes: 980,
      tags: ["Wellness", "Nature", "Culture"],
    },
    {
      id: "trip-rajasthan-7",
      title: "Royal Forts & Heritage Palaces of Rajasthan",
      description: "Amber Fort light ceremonies, Thar desert dune expeditions, and private lake palace dining.",
      destination: "India",
      creator: {
        name: "Kabir Mehta",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
        handle: "@kabirmehta",
      },
      duration: "7 Days",
      coverImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
      likes: 1120,
      tags: ["Heritage", "Royal", "History"],
    },
  ]);

  const toggleLike = (id: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const liked = !t.liked;
          return { ...t, liked, likes: liked ? t.likes + 1 : t.likes - 1 };
        }
        return t;
      })
    );
  };

  const toggleSave = (id: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, saved: !t.saved } : t))
    );
  };

  const handleCopyTrip = async (trip: CommunityTrip) => {
    setCopiedTripTitle(trip.title);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Copy of ${trip.title}`,
          description: trip.description,
          destination: trip.destination,
          dates: "Upcoming 2026",
          duration: trip.duration,
          budget_total: 80000,
          cover_image_url: trip.coverImage,
          visibility: "private",
          status: "planning",
        }),
      });
      const data = await res.json();
      const newTripId = data.data?.id;

      if (newTripId) {
        // Seed default stop for the cloned route
        await fetch(`/api/trips/${newTripId}/stops`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: trip.destination,
            country: trip.destination,
            dates: "Day 1 – Day 3",
            nights: 3,
          }),
        });
      }

      setTimeout(() => {
        setCopiedTripTitle(null);
        if (newTripId) {
          router.push(`/trips/${newTripId}`);
        } else {
          router.push("/trips");
        }
      }, 1000);
    } catch (err) {
      console.error("Failed to clone community trip:", err);
      setTimeout(() => {
        setCopiedTripTitle(null);
        router.push("/trips");
      }, 1000);
    }
  };

  const categories = ["All Trips", "Trending", "Culture", "Food & Dining", "Nature & Adventure", "Budget Friendly"];

  const filteredTrips = trips.filter((t) => {
    if (searchQuery.trim()) {
      const match =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.creator.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    if (activeCategory === "All Trips" || activeCategory === "Trending") return true;
    return t.tags.some((tag) => activeCategory.toLowerCase().includes(tag.toLowerCase()));
  });

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row antialiased bg-canvas text-obsidian-900">
      {/* Sidebar */}
      <Sidebar onOpenAI={() => setIsAiOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Architectural Header */}
        <header className="h-16 bg-canvas/80 backdrop-blur-md sticky top-0 z-20 px-6 md:px-12 flex items-center justify-between border-b border-black/[0.04]">
          <div className="relative w-full max-w-lg">
            <Search className="w-3.5 h-3.5 text-obsidian-900/40 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.3} />
            <input
              type="text"
              placeholder="Search destinations, curated routes, or travelers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/[0.03] border border-black/[0.05] text-xs rounded-full pl-10 pr-4 py-2.5 text-obsidian-900 placeholder-obsidian-900/40 focus:border-obsidian-900 focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAiOpen(true)}
              className="group hidden sm:inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-full bg-black/[0.03] text-obsidian-900 border border-black/[0.06] text-xs font-medium hover:bg-black/[0.06] transition-colors"
            >
              <span className="text-[11px]">Ask AI</span>
              <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 text-brand-700" strokeWidth={1.4} />
              </span>
            </button>
            <button className="relative p-2 rounded-full bg-black/[0.03] border border-black/[0.04] text-obsidian-900/60 hover:text-obsidian-900 transition-colors">
              <Bell className="w-4 h-4" strokeWidth={1.3} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-600 rounded-full" />
            </button>
          </div>
        </header>

        {/* Community Body with Macro Whitespace */}
        <main className="p-6 md:p-12 space-y-10 max-w-7xl">
          {/* Hero Banner: Doppelrand Architecture */}
          <div className="p-2 rounded-[2.5rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
            <div className="relative rounded-[calc(2.5rem-0.5rem)] overflow-hidden bg-white min-h-[220px] flex items-center px-6 sm:px-10 py-8 shadow-hardware group">
              <div className="absolute right-0 top-0 bottom-0 w-2/3 overflow-hidden pointer-events-none hidden sm:block">
                <img
                  alt="Santorini coastal panorama"
                  className="w-full h-full object-cover object-center opacity-40 group-hover:scale-103 transition-transform duration-700 ease-luxury"
                  src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
              </div>

              <div className="relative z-10 max-w-lg space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black/[0.03] border border-black/[0.06] text-obsidian-900/70 text-[10px] uppercase tracking-[0.2em] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                  Collective Intelligence
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-obsidian-900 tracking-tight leading-tight">
                  Curated Expeditions, <span className="font-serif italic font-normal text-brand-700">Real Travelers.</span>
                </h1>
                <p className="text-xs text-obsidian-900/50 leading-relaxed font-light">
                  Clone complete multi-city routes with a single click, customize timings, and publish your own adventures to the community.
                </p>
              </div>
            </div>
          </div>

          {/* Copy Success Toast */}
          {copiedTripTitle && (
            <div className="p-4 rounded-2xl bg-obsidian-900 text-white font-semibold text-xs flex items-center justify-between shadow-hardware animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-200" strokeWidth={1.4} />
                <span>
                  &ldquo;{copiedTripTitle}&rdquo; cloned into your account! Redirecting to builder...
                </span>
              </div>
            </div>
          )}

          {/* Category Filter Chips & Counter */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="p-1 bg-black/[0.03] ring-1 ring-black/[0.04] rounded-full flex gap-1 overflow-x-auto pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-white text-obsidian-900 shadow-hardware font-bold"
                      : "text-obsidian-900/60 hover:text-obsidian-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-obsidian-900/40 font-medium">
              Showing {filteredTrips.length} verified routes
            </div>
          </div>

          {/* Trip Cards Grid: Doppelrand Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <article className="rounded-[calc(2rem-0.375rem)] bg-white overflow-hidden shadow-hardware hover:shadow-hardware-elevated transition-all duration-500 ease-luxury flex flex-col justify-between group h-full">
                  <div>
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={trip.coverImage}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxury"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-obsidian-950/20 to-transparent" />

                      {/* Bookmark Save Button */}
                      <button
                        onClick={() => toggleSave(trip.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                          trip.saved
                            ? "bg-white text-obsidian-900"
                            : "bg-black/40 text-white hover:bg-black/60"
                        }`}
                        title="Save route"
                      >
                        <Bookmark className="w-3.5 h-3.5" strokeWidth={1.3} />
                      </button>

                      {/* Like Pill */}
                      <button
                        onClick={() => toggleLike(trip.id)}
                        className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10 hover:bg-black/60 transition-colors"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            trip.liked ? "text-rose-500 fill-rose-500" : "text-white"
                          }`}
                          strokeWidth={1.3}
                        />
                        <span>{trip.likes.toLocaleString()}</span>
                      </button>

                      <span className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/10">
                        {trip.duration}
                      </span>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="font-bold text-obsidian-900 text-base leading-snug group-hover:text-brand-700 transition-colors">
                        {trip.title}
                      </h3>
                      <p className="text-xs text-obsidian-900/50 line-clamp-2 leading-relaxed font-light">
                        {trip.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {trip.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-canvas-subtle text-obsidian-900/60 border border-black/[0.04]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Creator Info and 1-Click Clone Button */}
                  <div className="p-6 pt-3 border-t border-black/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={trip.creator.avatar}
                        alt={trip.creator.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-black/[0.08]"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-obsidian-900 leading-tight">
                          {trip.creator.name}
                        </h4>
                        <span className="text-[10px] text-obsidian-900/40">
                          {trip.creator.handle}
                        </span>
                      </div>
                    </div>

                    {/* 1-Click Copy Trip Button: Button-in-Button */}
                    <button
                      onClick={() => handleCopyTrip(trip)}
                      className="group/btn relative inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-full bg-black/[0.03] text-obsidian-900 border border-black/[0.06] hover:bg-obsidian-900 hover:text-white text-xs font-medium transition-all duration-300 shadow-2xs"
                      title="Copy this itinerary into your account"
                    >
                      <span className="text-[11px] font-semibold">Clone</span>
                      <span className="w-5 h-5 rounded-full bg-black/[0.04] group-hover/btn:bg-white/20 flex items-center justify-center transition-transform group-hover/btn:scale-105">
                        <Copy className="w-2.5 h-2.5 text-current" strokeWidth={1.4} />
                      </span>
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Slide-over Ask AI Assistant Panel */}
      <AskAIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}

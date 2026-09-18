"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import AskAIAssistant from "@/components/AskAIAssistant";
import {
  Search,
  Bell,
  Calendar,
  Camera,
  Heart,
  Bookmark,
  Luggage,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowUpRight,
} from "lucide-react";

import { Trip } from "@/lib/types";

export default function TravelerProfilePage() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"trips" | "saved" | "preferences">("trips");
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    async function loadUserTrips() {
      try {
        const res = await fetch("/api/trips");
        const json = await res.json();
        if (json.data) {
          setTrips(json.data);
        }
      } catch (err) {
        console.error("Failed to load profile trips", err);
      }
    }
    loadUserTrips();
  }, []);

  const savedTrips = [
    {
      title: "Amalfi Coast & Southern Italy Roadtrip",
      creator: "Marco Rossi",
      dates: "June 2026",
      likes: 540,
      cover: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Swiss Alps Scenic Train & Hiking Trail",
      creator: "Elena Weber",
      dates: "July 2026",
      likes: 412,
      cover: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row antialiased bg-canvas text-obsidian-900">
      {/* Sidebar */}
      <Sidebar onOpenAI={() => setIsAiOpen(true)} />

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Architectural Header */}
        <header className="h-16 bg-canvas/80 backdrop-blur-md border-b border-black/[0.04] px-6 md:px-12 flex items-center justify-between sticky top-0 z-20">
          <div className="relative w-full max-w-lg">
            <Search className="w-3.5 h-3.5 text-obsidian-900/40 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.3} />
            <input
              type="text"
              placeholder="Search expeditions, travelers, or logs..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/[0.03] border border-black/[0.05] rounded-full text-xs text-obsidian-900 placeholder:text-obsidian-900/40 focus:border-obsidian-900 focus:bg-white transition-all outline-none"
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
            <button className="relative p-2 text-obsidian-900/60 hover:text-obsidian-900 rounded-full hover:bg-black/[0.03] transition-colors">
              <Bell className="w-4 h-4" strokeWidth={1.3} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-600 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 pl-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Jeel Patel"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-black/[0.08]"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-obsidian-900 leading-tight">Jeel Patel</p>
                <p className="text-[10px] text-obsidian-900/40">@jeel</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container with Macro Whitespace */}
        <main className="p-6 md:p-12 space-y-10 max-w-7xl">
          {/* Profile Hero Card (Doppelrand) */}
          <div className="p-2 rounded-[2.5rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
            <section className="bg-white rounded-[calc(2.5rem-0.5rem)] shadow-hardware overflow-hidden">
              {/* Cover Banner */}
              <div className="relative h-64 w-full overflow-hidden bg-obsidian-950">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
                  alt="Alpine landscape"
                  className="w-full h-full object-cover object-center opacity-65"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent" />
                <div className="absolute top-6 right-8 rotate-[-3deg] hidden md:block">
                  <span className="font-serif italic text-2xl text-amber-200/90 leading-tight">
                    &ldquo;Travel far enough, you meet yourself.&rdquo;
                  </span>
                </div>
              </div>

              {/* Profile Info Bar */}
              <div className="px-6 md:px-10 pb-8 pt-4">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-20">
                  {/* Avatar and Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 z-10">
                    <div className="relative group">
                      <div className="p-1 rounded-full bg-white ring-1 ring-black/[0.08] shadow-hardware">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80"
                          alt="Jeel Patel"
                          className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover"
                        />
                      </div>
                      <button
                        className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-obsidian-900 text-white flex items-center justify-center hover:bg-obsidian-850 transition-colors shadow-hardware"
                        title="Update avatar"
                      >
                        <Camera className="w-3.5 h-3.5 text-brand-200" strokeWidth={1.3} />
                      </button>
                    </div>

                    <div className="space-y-1.5 pb-1">
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-obsidian-900 tracking-tight">Jeel Patel</h1>
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-50 border border-brand-200/50 text-brand-800 text-[10px] font-semibold uppercase tracking-wider">
                          <Award className="w-3 h-3" strokeWidth={1.3} />
                          Explorer Tier
                        </span>
                      </div>
                      <div className="text-xs text-obsidian-900/50 font-medium">@jeel • Ahmedabad, India</div>
                      <p className="text-xs text-obsidian-900/70 max-w-xl leading-relaxed font-light pt-0.5">
                        Documenting journeys across cultural heritage sites, Shinkansen transits, and Alpine trails. Pair-planning live itineraries with friends.
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-obsidian-900/40 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-obsidian-900/40" strokeWidth={1.3} /> Joined Jan 2025
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" strokeWidth={1.3} /> Verified Traveler
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Counters and Statistics Bar (Doppelrand) */}
                  <div className="flex flex-col sm:flex-row items-stretch lg:items-end gap-3 self-end w-full lg:w-auto">
                    <div className="bg-canvas-subtle/70 border border-black/[0.04] rounded-2xl px-6 py-3 flex items-center justify-between gap-6 shadow-2xs">
                      <div className="text-center px-1">
                        <span className="block text-lg font-bold text-obsidian-900 leading-none font-mono">5</span>
                        <span className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold mt-0.5 block">Trips</span>
                      </div>
                      <div className="w-px h-6 bg-black/[0.06]" />
                      <div className="text-center px-1">
                        <span className="block text-lg font-bold text-obsidian-900 leading-none font-mono">12</span>
                        <span className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold mt-0.5 block">Countries</span>
                      </div>
                      <div className="w-px h-6 bg-black/[0.06]" />
                      <div className="text-center px-1">
                        <span className="block text-lg font-bold text-obsidian-900 leading-none font-mono">42</span>
                        <span className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold mt-0.5 block">Saved</span>
                      </div>
                      <div className="w-px h-6 bg-black/[0.06]" />
                      <div className="text-center px-1">
                        <span className="block text-lg font-bold text-obsidian-900 leading-none font-mono">1.2k</span>
                        <span className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold mt-0.5 block">Likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="p-1 bg-black/[0.03] ring-1 ring-black/[0.04] rounded-full inline-flex gap-1">
            <button
              onClick={() => setActiveTab("trips")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "trips"
                  ? "bg-white text-obsidian-900 shadow-hardware font-bold"
                  : "text-obsidian-900/60 hover:text-obsidian-900"
              }`}
            >
              <Luggage className="w-3.5 h-3.5" strokeWidth={1.3} />
              <span>My Expeditions (3)</span>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "saved"
                  ? "bg-white text-obsidian-900 shadow-hardware font-bold"
                  : "text-obsidian-900/60 hover:text-obsidian-900"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" strokeWidth={1.3} />
              <span>Saved Routes (2)</span>
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "preferences"
                  ? "bg-white text-obsidian-900 shadow-hardware font-bold"
                  : "text-obsidian-900/60 hover:text-obsidian-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.3} />
              <span>AI Persona & Preferences</span>
            </button>
          </div>

          {/* Tab 1: My Trips (Doppelrand Bento) */}
          {activeTab === "trips" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trips.map((trip) => {
                const activitiesCount =
                  trip.stops?.reduce((sum, s) => sum + (s.activities?.length || 0), 0) || 0;
                const stopsDisplay =
                  trip.stops && trip.stops.length > 0
                    ? trip.stops.map((s) => s.city).join(" • ")
                    : trip.destination || "Flexible Route";

                return (
                  <div key={trip.id} className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                    <div className="rounded-[calc(2rem-0.375rem)] bg-white overflow-hidden shadow-hardware hover:shadow-hardware-elevated transition-all duration-500 ease-luxury flex flex-col group h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={trip.cover_image_url}
                          alt={trip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxury"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-obsidian-950/20 to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-medium border border-white/10 uppercase tracking-wider">
                          {trip.visibility}
                        </span>
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white text-obsidian-900 text-[10px] font-bold shadow-2xs uppercase tracking-wider">
                          {trip.status}
                        </span>
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <h4 className="font-bold text-sm leading-tight drop-shadow-xs">{trip.title}</h4>
                          <p className="text-[10px] text-white/70 mt-0.5">{stopsDisplay}</p>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between text-xs text-obsidian-900/60">
                          <span className="text-[11px]">{trip.dates || "Dates TBD"}</span>
                          <span className="font-semibold text-brand-700">{activitiesCount} planned items</span>
                        </div>

                        <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-obsidian-900/40">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" strokeWidth={1.3} />
                            <span className="text-[11px] font-mono">{trip.likes_count || 0}</span>
                          </span>
                          <Link
                            href={`/trips/${trip.id}`}
                            className="group inline-flex items-center gap-1 text-xs font-semibold text-obsidian-900 hover:text-brand-700 transition-colors"
                          >
                            <span>Open Itinerary</span>
                            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.4} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Saved (Doppelrand) */}
          {activeTab === "saved" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedTrips.map((trip, idx) => (
                <div key={idx} className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                  <div className="rounded-[calc(2rem-0.375rem)] bg-white overflow-hidden shadow-hardware flex flex-col sm:flex-row group hover:shadow-hardware-elevated transition-all duration-500 ease-luxury h-full">
                    <img
                      src={trip.cover}
                      alt={trip.title}
                      className="w-full sm:w-52 h-48 object-cover group-hover:scale-105 transition-transform duration-700 ease-luxury"
                    />
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-700">Created by {trip.creator}</p>
                        <h4 className="font-bold text-sm text-obsidian-900 mt-1">{trip.title}</h4>
                        <p className="text-xs text-obsidian-900/40 mt-1">{trip.dates}</p>
                      </div>
                      <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
                        <span className="text-xs text-obsidian-900/50 font-medium">{trip.likes} saves</span>
                        <Link
                          href="/community"
                          className="text-xs font-semibold text-obsidian-900 hover:text-brand-700 transition-colors flex items-center gap-1"
                        >
                          <span>View in Community</span>
                          <ArrowUpRight className="w-3 h-3" strokeWidth={1.3} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Preferences (Doppelrand) */}
          {activeTab === "preferences" && (
            <div className="p-2 rounded-[2.5rem] bg-black/[0.025] ring-1 ring-black/[0.04] max-w-3xl">
              <div className="rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-8 shadow-hardware space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-[0.2em] block">
                    Telemetry Tuning
                  </span>
                  <h3 className="text-lg font-bold text-obsidian-900 mt-0.5">Travel Profile & Copilot Alignment</h3>
                  <p className="text-xs text-obsidian-900/50 font-light">
                    These parameters determine the density, culinary focus, and budget constraints of AI generated itineraries.
                  </p>
                </div>

                <div className="space-y-5 text-xs">
                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-2">Pacing Dynamics</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button className="p-3 rounded-2xl border border-black/[0.06] text-obsidian-900/70 font-medium hover:bg-black/[0.02]">
                        Slow Exploration
                      </button>
                      <button className="p-3 rounded-2xl border border-obsidian-900 bg-obsidian-900 text-white font-semibold shadow-2xs">
                        Balanced Tempo
                      </button>
                      <button className="p-3 rounded-2xl border border-black/[0.06] text-obsidian-900/70 font-medium hover:bg-black/[0.02]">
                        Intensive Sprint
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-2">Curated Focal Themes</label>
                    <div className="flex flex-wrap gap-2">
                      {["Historic Shrines", "Artisan Cuisine", "Scenic Rail", "Panoramic Photography", "Zen Gardens", "Modern Galleries", "Night Izakayas"].map(
                        (interest, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.05] text-obsidian-900 font-medium hover:bg-obsidian-900 hover:text-white cursor-pointer transition-colors"
                          >
                            {interest}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-2">Hospitality Tier</label>
                    <select className="w-full px-4 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none">
                      <option>Boutique Ryokans & Design Hotels (₹8,000 – ₹15,000 / night)</option>
                      <option>Traditional Machiyas & Hostels (&lt; ₹4,000 / night)</option>
                      <option>Luxury Onsen Resorts (&gt; ₹25,000 / night)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slide-over Ask AI Assistant Panel */}
      <AskAIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}

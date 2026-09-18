"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import AskAIAssistant from "@/components/AskAIAssistant";
import {
  ArrowLeft,
  Share2,
  MoreHorizontal,
  Calendar,
  MapPin,
  IndianRupee,
  Sparkles,
  GripVertical,
  Plus,
  Trash2,
  Navigation,
  ArrowUpRight,
  Train,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface Activity {
  id: string;
  title: string;
  time: string;
  category: "Culture" | "Food" | "Nature" | "Adventure" | "Nightlife";
  cost: number;
  duration: string;
  notes?: string;
  badgeBg: string;
}

interface Stop {
  id: string;
  city: string;
  country: string;
  dates: string;
  nights: number;
  activities: Activity[];
}

interface TripItineraryPageProps {
  tripId?: string;
}

export default function TripItineraryPage({ tripId = "japan-2026" }: TripItineraryPageProps) {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"itinerary" | "calendar" | "budget">("itinerary");
  const [tripData, setTripData] = useState<any>(null);
  const [showAddActivityModal, setShowAddActivityModal] = useState<string | null>(null);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const [newCountryName, setNewCountryName] = useState("Japan");
  const [newStopNights, setNewStopNights] = useState("2");
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityCategory, setNewActivityCategory] = useState<Activity["category"]>("Culture");
  const [newActivityCost, setNewActivityCost] = useState("500");
  const [newActivityTime] = useState("10:00 AM");
  const [flashLiveUpdate, setFlashLiveUpdate] = useState(false);

  // Initial Stops state matching Screen 2 (Japan 2026)
  const [stops, setStops] = useState<Stop[]>([
    {
      id: "stop-tokyo",
      city: "Tokyo",
      country: "Japan",
      dates: "Mar 12 – Mar 15, 2026",
      nights: 3,
      activities: [
        {
          id: "act-1",
          title: "Sensō-ji Temple & Asakusa District",
          time: "09:30 AM",
          category: "Culture",
          cost: 0,
          duration: "2.5 hrs",
          notes: "Oldest Buddhist temple in Tokyo. Try fresh melonpan on Nakamise Street.",
          badgeBg: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]",
        },
        {
          id: "act-2",
          title: "Shibuya Crossing & Hachiko Statue",
          time: "02:00 PM",
          category: "Adventure",
          cost: 0,
          duration: "1.5 hrs",
          notes: "Busiest pedestrian intersection in the world. View from Starbucks Tsutaya.",
          badgeBg: "bg-amber-50 text-amber-800 border border-amber-200/50",
        },
        {
          id: "act-3",
          title: "Tsukiji Outer Market Gourmet Tasting",
          time: "05:30 PM",
          category: "Food",
          cost: 2500,
          duration: "2 hrs",
          notes: "Fresh uni, grilled scallops, and wagyu skewers.",
          badgeBg: "bg-brand-50 text-brand-800 border border-brand-200/50",
        },
        {
          id: "act-4",
          title: "teamLab Planets Immersive Digital Art",
          time: "08:00 PM",
          category: "Culture",
          cost: 3200,
          duration: "2 hrs",
          notes: "Tickets booked online. Barefoot water exhibit.",
          badgeBg: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]",
        },
      ],
    },
    {
      id: "stop-kyoto",
      city: "Kyoto",
      country: "Japan",
      dates: "Mar 16 – Mar 18, 2026",
      nights: 3,
      activities: [
        {
          id: "act-5",
          title: "Fushimi Inari Shrine 10,000 Torii Gates",
          time: "08:00 AM",
          category: "Nature",
          cost: 0,
          duration: "3 hrs",
          notes: "Early morning hike before crowds arrive. Sacred fox statues.",
          badgeBg: "bg-emerald-50 text-emerald-800 border border-emerald-200/50",
        },
        {
          id: "act-6",
          title: "Traditional Gion Machiya Tea Ceremony",
          time: "01:30 PM",
          category: "Culture",
          cost: 4000,
          duration: "1.5 hrs",
          notes: "Matcha preparation with Japanese wagashi sweets.",
          badgeBg: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]",
        },
        {
          id: "act-7",
          title: "Kiyomizu-dera Wooden Stage Sunset",
          time: "05:00 PM",
          category: "Culture",
          cost: 400,
          duration: "2 hrs",
          notes: "Panoramic sunset view over Kyoto valley from the main hall.",
          badgeBg: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]",
        },
      ],
    },
    {
      id: "stop-osaka",
      city: "Osaka",
      country: "Japan",
      dates: "Mar 19 – Mar 20, 2026",
      nights: 2,
      activities: [
        {
          id: "act-8",
          title: "Osaka Castle & Plum Grove Gardens",
          time: "10:00 AM",
          category: "Culture",
          cost: 600,
          duration: "2.5 hrs",
          notes: "Historical museum inside tower with 360-degree observation deck.",
          badgeBg: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]",
        },
        {
          id: "act-9",
          title: "Dotonbori Neon Food Crawl (Takoyaki & Kushikatsu)",
          time: "06:30 PM",
          category: "Food",
          cost: 3500,
          duration: "3 hrs",
          notes: "Glico Running Man sign, canal bridge, and famous street stalls.",
          badgeBg: "bg-brand-50 text-brand-800 border border-brand-200/50",
        },
      ],
    },
  ]);

  useEffect(() => {
    fetch(`/api/trips/${tripId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setTripData(json.data);
          if (json.data.stops && Array.isArray(json.data.stops) && json.data.stops.length > 0) {
            setStops(json.data.stops);
          }
        }
      })
      .catch((err) => console.error("Error loading trip itinerary:", err));
  }, [tripId]);

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;

    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: newCityName,
          country: newCountryName,
          dates: "Dates TBD",
          nights: parseInt(newStopNights) || 2,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setStops((prev) => [...prev, json.data]);
        setNewCityName("");
        setShowAddStopModal(false);
        triggerLiveFlash();
      }
    } catch (err) {
      console.error("Error adding stop:", err);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    setStops((prev) => prev.filter((s) => s.id !== stopId));
    triggerLiveFlash();

    try {
      await fetch(`/api/trips/${tripId}/stops/${stopId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting stop:", err);
    }
  };

  const handleAddActivity = async (stopId: string) => {
    if (!newActivityTitle.trim()) return;

    const categoryBadges: Record<Activity["category"], string> = {
      Culture: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]",
      Food: "bg-brand-50 text-brand-800 border border-brand-200/50",
      Nature: "bg-emerald-50 text-emerald-800 border border-emerald-200/50",
      Adventure: "bg-amber-50 text-amber-800 border border-amber-200/50",
      Nightlife: "bg-indigo-50 text-indigo-800 border border-indigo-200/50",
    };

    const newAct: Activity = {
      id: `act-${Date.now()}`,
      title: newActivityTitle,
      time: newActivityTime,
      category: newActivityCategory,
      cost: parseFloat(newActivityCost) || 0,
      duration: "1.5 hrs",
      badgeBg: categoryBadges[newActivityCategory],
    };

    // Optimistic UI update
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === stopId ? { ...stop, activities: [...stop.activities, newAct] } : stop
      )
    );

    setNewActivityTitle("");
    setShowAddActivityModal(null);
    triggerLiveFlash();

    try {
      await fetch(`/api/trips/${tripId}/stops/${stopId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAct.title,
          category: newAct.category.toLowerCase(),
          cost: newAct.cost,
          time: newAct.time,
          duration: newAct.duration,
        }),
      });
    } catch (err) {
      console.error("Error adding activity:", err);
    }
  };

  const handleDeleteActivity = async (stopId: string, actId: string) => {
    // Optimistic UI update
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === stopId
          ? { ...stop, activities: stop.activities.filter((a) => a.id !== actId) }
          : stop
      )
    );
    triggerLiveFlash();

    try {
      await fetch(`/api/trips/${tripId}/stops/${stopId}/activities/${actId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting activity:", err);
    }
  };

  const handleMoveStop = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stops.length) return;

    const newStops = [...stops];
    const temp = newStops[index];
    newStops[index] = newStops[targetIdx];
    newStops[targetIdx] = temp;

    setStops(newStops);
    triggerLiveFlash();

    try {
      const orderPayload = newStops.map((s, idx) => ({ id: s.id, order_index: idx }));
      await fetch(`/api/trips/${tripId}/stops/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderPayload }),
      });
    } catch (err) {
      console.error("Error reordering stops:", err);
    }
  };

  const triggerLiveFlash = () => {
    setFlashLiveUpdate(true);
    setTimeout(() => setFlashLiveUpdate(false), 1200);
  };

  const handleAddFromAI = (daysData: any) => {
    if (!daysData || !daysData.length) return;
    const targetStop = stops[0]?.id || "stop-kyoto";
    const newItems = daysData[0].items.map((item: any, idx: number) => ({
      id: `act-ai-${Date.now()}-${idx}`,
      title: item.title,
      time: item.time,
      category: item.category as Activity["category"],
      cost: 1200,
      duration: "2 hrs",
      notes: "Curated by GlobeTrotter AI Copilot",
      badgeBg: item.badgeBg || "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]",
    }));

    setStops((prev) =>
      prev.map((stop) =>
        stop.id === targetStop
          ? { ...stop, activities: [...stop.activities, ...newItems] }
          : stop
      )
    );
    triggerLiveFlash();
  };

  const totalCost = stops.reduce(
    (acc, s) => acc + s.activities.reduce((sAcc, a) => sAcc + a.cost, 0),
    0
  );


  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row antialiased bg-canvas text-obsidian-900">
      {/* Persistent Left Sidebar */}
      <Sidebar onOpenAI={() => setIsAiOpen(true)} />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Architectural Collaboration Header */}
        <header className="h-16 px-6 md:px-12 border-b border-black/[0.04] bg-canvas/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-obsidian-900/60 hover:text-obsidian-900 text-xs font-medium transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-obsidian-900 transition-transform duration-300 group-hover:-translate-x-0.5">
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.3} />
              </span>
              <span className="hidden sm:inline">Overview</span>
            </Link>
            <span className="text-black/20">/</span>
            <span className="font-bold text-obsidian-900 text-xs tracking-tight">Japan Autumn Odyssey 2026</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Presence Indicator: Concentric Pill */}
            <div className="flex items-center -space-x-1.5 bg-black/[0.03] px-2.5 py-1 rounded-full border border-black/[0.04]">
              <div className="w-6 h-6 rounded-full bg-obsidian-900 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                JP
              </div>
              <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                SJ
              </div>
              <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                AL
              </div>
              <span className="pl-2.5 text-[10px] font-semibold text-obsidian-900/60 hidden lg:inline">
                3 active
              </span>
            </div>

            {/* Share / Invite button */}
            <button className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] text-obsidian-900 text-xs font-semibold hover:bg-canvas-subtle shadow-2xs transition-colors">
              <Share2 className="w-3 h-3 text-obsidian-900/60" strokeWidth={1.3} />
              <span>Share</span>
            </button>

            {/* Button-in-Button AI Copilot */}
            <button
              onClick={() => setIsAiOpen(true)}
              className="group relative inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-full bg-obsidian-900 text-white text-xs font-medium shadow-hardware hover:bg-obsidian-850 active:scale-[0.98] transition-all duration-500 ease-luxury"
            >
              <span className="text-[11px] text-[#faf9f6]">Ask AI Copilot</span>
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 ease-luxury group-hover:scale-110">
                <Sparkles className="w-2.5 h-2.5 text-brand-200" strokeWidth={1.4} />
              </span>
            </button>

            <button className="w-8 h-8 rounded-full bg-black/[0.03] border border-black/[0.04] flex items-center justify-center text-obsidian-900/60 hover:text-obsidian-900 transition-colors">
              <MoreHorizontal className="w-4 h-4" strokeWidth={1.3} />
            </button>
          </div>
        </header>

        {/* Hero Panorama & Itinerary Body */}
        <div className="p-6 md:p-12 space-y-10 max-w-7xl">
          {/* Doppelrand Panoramic Banner */}
          <div className="p-2 rounded-[2.5rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
            <div className="relative rounded-[calc(2.5rem-0.5rem)] overflow-hidden shadow-hardware min-h-[300px] sm:min-h-[340px] flex flex-col justify-between p-6 sm:p-10 text-white group">
              <img
                alt="Panoramic Mount Fuji and Pagoda"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-luxury"
                src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950/90 via-obsidian-950/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent" />

              {/* Top Banner Badges */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-brand-200 text-[10px] uppercase tracking-[0.2em] font-semibold">
                    Confirmed Expedition
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-xs font-medium border border-white/10">
                    🔒 Private Access
                  </span>
                </div>

                <div className="hidden md:block rotate-[-3deg] text-right font-serif italic text-2xl text-amber-200/90 select-none">
                  &ldquo;Collect moments, not things.&rdquo;
                </div>
              </div>

              {/* Banner Title & Stats */}
              <div className="relative z-10 space-y-4 pt-8">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-200">
                    Grand Tour
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                    Japan Autumn Odyssey 2026
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-light text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-300" strokeWidth={1.3} />
                    Mar 12 – Mar 20, 2026 (10 Days)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-300" strokeWidth={1.3} />
                    3 Cities ({stops.length} stops)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-brand-300" strokeWidth={1.3} />
                    Cap ₹2,50,000 (₹{totalCost.toLocaleString()} planned)
                  </span>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/15">
                    <button
                      onClick={() => setActiveTab("itinerary")}
                      className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all duration-300 ${
                        activeTab === "itinerary"
                          ? "bg-white text-obsidian-900 shadow-hardware"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      Itinerary View
                    </button>
                    <Link
                      href="/calendar"
                      className="px-4 py-1.5 rounded-full font-semibold text-xs text-white/80 hover:text-white transition-colors"
                    >
                      Calendar & Timeline
                    </Link>
                    <Link
                      href="/budget"
                      className="px-4 py-1.5 rounded-full font-semibold text-xs text-white/80 hover:text-white transition-colors"
                    >
                      Budget Ledger
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    <span>Supabase Live Sync Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Itinerary Builder */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left 8 Cols: City Stops & Activities list (Doppelrand) */}
            <div className={`xl:col-span-8 space-y-8 ${flashLiveUpdate ? "animate-realtime-flash" : ""}`}>
              {/* Add Stop Header Bar */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-[0.2em] block">
                    Itinerary Timeline
                  </span>
                  <h3 className="text-xl font-bold text-obsidian-900 mt-0.5">
                    {stops.length} Cities & Destinations
                  </h3>
                </div>

                <button
                  onClick={() => setShowAddStopModal(!showAddStopModal)}
                  className="group inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-obsidian-900 text-white text-xs font-semibold shadow-hardware hover:bg-obsidian-850 active:scale-[0.98] transition-all"
                >
                  <span>Add City Stop</span>
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <Plus className="w-3 h-3 text-brand-200" strokeWidth={1.4} />
                  </span>
                </button>
              </div>

              {/* Inline Add Stop Modal */}
              {showAddStopModal && (
                <div className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04] animate-in fade-in">
                  <form
                    onSubmit={handleAddStop}
                    className="rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-hardware space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-obsidian-900">Add New City to Route</h4>
                        <p className="text-[10px] text-obsidian-900/40">Enter destination city and scheduled nights</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddStopModal(false)}
                        className="text-obsidian-900/40 hover:text-obsidian-900 text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-obsidian-900 mb-1">City Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hiroshima"
                          value={newCityName}
                          onChange={(e) => setNewCityName(e.target.value)}
                          className="w-full px-3.5 py-2 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs outline-none focus:border-obsidian-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-obsidian-900 mb-1">Country</label>
                        <input
                          type="text"
                          placeholder="Japan"
                          value={newCountryName}
                          onChange={(e) => setNewCountryName(e.target.value)}
                          className="w-full px-3.5 py-2 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs outline-none focus:border-obsidian-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-obsidian-900 mb-1">Stay Duration</label>
                        <select
                          value={newStopNights}
                          onChange={(e) => setNewStopNights(e.target.value)}
                          className="w-full px-3.5 py-2 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs outline-none focus:border-obsidian-900"
                        >
                          <option value="1">1 Night</option>
                          <option value="2">2 Nights</option>
                          <option value="3">3 Nights</option>
                          <option value="4">4 Nights</option>
                          <option value="5">5 Nights</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddStopModal(false)}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold text-obsidian-900/60 hover:bg-black/[0.03]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-1.5 rounded-full bg-obsidian-900 text-white text-xs font-semibold hover:bg-obsidian-850 shadow-hardware"
                      >
                        Add Stop
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {stops.map((stop, stopIdx) => (
                <div key={stop.id} className="p-2 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                  <div className="rounded-[calc(2rem-0.5rem)] bg-white p-6 sm:p-8 shadow-hardware space-y-6">
                    {/* City Stop Header */}
                    <div className="flex items-start justify-between border-b border-black/[0.05] pb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-black/[0.03] border border-black/[0.05] text-obsidian-900 flex items-center justify-center font-bold text-xs shadow-2xs">
                          0{stopIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-xl font-bold text-obsidian-900 tracking-tight">{stop.city}</h3>
                            <span className="text-xs text-obsidian-900/40">({stop.country})</span>
                          </div>
                          <p className="text-xs text-obsidian-900/50 font-medium flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-obsidian-900/40" strokeWidth={1.3} />
                            {stop.dates} • {stop.nights} Nights
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Reorder Stop Up/Down */}
                        <div className="flex items-center bg-black/[0.03] border border-black/[0.05] rounded-full p-0.5 mr-1">
                          <button
                            type="button"
                            disabled={stopIdx === 0}
                            onClick={() => handleMoveStop(stopIdx, "up")}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-obsidian-900/40 hover:text-obsidian-900 hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                            title="Move stop up"
                          >
                            <ChevronUp className="w-3 h-3" strokeWidth={1.4} />
                          </button>
                          <button
                            type="button"
                            disabled={stopIdx === stops.length - 1}
                            onClick={() => handleMoveStop(stopIdx, "down")}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-obsidian-900/40 hover:text-obsidian-900 hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                            title="Move stop down"
                          >
                            <ChevronDown className="w-3 h-3" strokeWidth={1.4} />
                          </button>
                        </div>

                        <button
                          onClick={() => setShowAddActivityModal(stop.id)}
                          className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.03] text-obsidian-900 border border-black/[0.06] hover:bg-black/[0.06] font-semibold text-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={1.4} />
                          <span>Add Item</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStop(stop.id)}
                          className="w-8 h-8 rounded-full bg-black/[0.02] text-obsidian-900/30 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                          title="Delete city stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.3} />
                        </button>
                      </div>
                    </div>


                    {/* Activities List */}
                    <div className="space-y-3">
                      {stop.activities.map((act) => (
                        <div
                          key={act.id}
                          className="group flex items-center justify-between p-4 rounded-2xl border border-black/[0.04] bg-canvas-subtle/40 hover:bg-white hover:border-black/[0.08] hover:shadow-hardware transition-all duration-300"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 pr-3">
                            <div className="text-obsidian-900/20 group-hover:text-obsidian-900/60 cursor-grab transition-colors">
                              <GripVertical className="w-4 h-4" strokeWidth={1.3} />
                            </div>
                            <div className="w-16 font-mono text-[11px] text-obsidian-900/50 font-medium shrink-0">
                              {act.time}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-obsidian-900 truncate">{act.title}</p>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider shrink-0 ${act.badgeBg}`}
                                >
                                  {act.category}
                                </span>
                              </div>
                              {act.notes && (
                                <p className="text-[11px] text-obsidian-900/50 truncate mt-0.5 font-light">
                                  {act.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <p className="text-xs font-bold text-obsidian-900">
                                {act.cost > 0 ? `₹${act.cost.toLocaleString()}` : "Free"}
                              </p>
                              <p className="text-[10px] text-obsidian-900/40">{act.duration}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteActivity(stop.id, act.id)}
                              className="p-1.5 text-obsidian-900/30 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.3} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Inline Add Modal */}
                      {showAddActivityModal === stop.id && (
                        <div className="p-5 rounded-2xl bg-canvas border border-black/[0.06] shadow-hardware space-y-4 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs text-obsidian-900">Add Spot to {stop.city}</h5>
                            <button
                              onClick={() => setShowAddActivityModal(null)}
                              className="text-obsidian-900/40 hover:text-obsidian-900 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                            <input
                              type="text"
                              placeholder="Activity title (e.g. Bamboo Grove walk)"
                              value={newActivityTitle}
                              onChange={(e) => setNewActivityTitle(e.target.value)}
                              className="sm:col-span-2 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs outline-none focus:border-obsidian-900"
                            />
                            <select
                              value={newActivityCategory}
                              onChange={(e) => setNewActivityCategory(e.target.value as any)}
                              className="px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs outline-none focus:border-obsidian-900"
                            >
                              <option value="Culture">Culture</option>
                              <option value="Food">Food</option>
                              <option value="Nature">Nature</option>
                              <option value="Adventure">Adventure</option>
                              <option value="Nightlife">Nightlife</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Cost (INR)"
                              value={newActivityCost}
                              onChange={(e) => setNewActivityCost(e.target.value)}
                              className="px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs outline-none focus:border-obsidian-900"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setShowAddActivityModal(null)}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-obsidian-900/60 hover:bg-black/[0.03]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddActivity(stop.id)}
                              className="px-4 py-1.5 rounded-full bg-obsidian-900 text-white text-xs font-semibold hover:bg-obsidian-850 shadow-hardware"
                            >
                              Save Spot
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 4 Cols: Route Connector & AI Assistant card (Doppelrand) */}
            <div className="xl:col-span-4 space-y-6">
              {/* Route Summary Panel */}
              <div className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-hardware space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-obsidian-900/40 block">
                        Topology
                      </span>
                      <h4 className="font-bold text-sm text-obsidian-900 mt-0.5">Expedition Route</h4>
                    </div>
                    <Navigation className="w-4 h-4 text-obsidian-800" strokeWidth={1.3} />
                  </div>

                  {/* Vertical Step Connector */}
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-black/[0.08]">
                    {stops.map((stop, i) => (
                      <div key={stop.id} className="relative">
                        <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border border-obsidian-900 bg-white" />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-obsidian-900">{stop.city}</p>
                            <p className="text-[10px] text-obsidian-900/40">{stop.nights} nights • {stop.activities.length} planned items</p>
                          </div>
                          <span className="text-[9px] font-mono text-obsidian-900 bg-black/[0.03] px-2 py-0.5 rounded-full">
                            Stop 0{i + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shinkansen connection badge */}
                  <div className="p-3 rounded-2xl bg-canvas-subtle/70 border border-black/[0.05] text-xs flex items-center gap-3 text-obsidian-900">
                    <div className="w-8 h-8 rounded-xl bg-black/[0.03] flex items-center justify-center shrink-0">
                      <Train className="w-4 h-4 text-obsidian-800" strokeWidth={1.3} />
                    </div>
                    <div>
                      <p className="font-semibold text-xs">Tokaido Shinkansen Transit</p>
                      <p className="text-[10px] text-obsidian-900/50">Tokyo ↔ Kyoto: 2h 15m transfer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Copilot Pinned Card (Doppelrand) */}
              <div className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-obsidian-950 p-6 text-white shadow-hardware space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-brand-200">
                      <Sparkles className="w-4 h-4" strokeWidth={1.4} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight text-[#faf9f6]">AI Travel Copilot</h4>
                      <p className="text-[10px] text-white/50">Real-time local route caching</p>
                    </div>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    Ask Copilot to reorganize stops by geographic proximity, suggest hidden izakayas, or estimate transport passes.
                  </p>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => setIsAiOpen(true)}
                      className="group w-full py-2.5 px-4 rounded-full bg-white text-obsidian-900 font-semibold text-xs hover:bg-canvas transition-all flex items-center justify-center gap-2 shadow-hardware"
                    >
                      <span>Launch AI Copilot</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-obsidian-900 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.4} />
                    </button>
                    <p className="text-center text-[10px] text-white/40">
                      Response latency &lt; 8 seconds
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Quick Telemetry Card */}
              <div className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-hardware space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-obsidian-900">Budget Progress</h4>
                    <Link href="/budget" className="text-[11px] font-semibold text-brand-700 hover:underline">
                      Full Ledger ↗
                    </Link>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-obsidian-900/50">Activities Cost</span>
                      <span className="font-bold text-obsidian-900">₹{totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-obsidian-900/50">Cap Target</span>
                      <span className="font-bold text-obsidian-900">₹2,50,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-700 rounded-full transition-all duration-500 ease-luxury"
                        style={{ width: `${Math.min(100, (totalCost / 250000) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Slide-over Ask AI Assistant Panel */}
      <AskAIAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onAddToItinerary={handleAddFromAI}
      />
    </div>
  );
}

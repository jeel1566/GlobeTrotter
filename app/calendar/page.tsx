"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AskAIAssistant from "@/components/AskAIAssistant";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Sun,
  CloudSun,
  Train,
  Plus,
  Trash2,
  Clock,
  ChevronDown,
  Compass,
} from "lucide-react";
import { Trip, TripStop } from "@/lib/types";

interface CalendarDay {
  dayIndex: number;
  dayName: string;
  dateStr: string;
  fullDate: string;
  city: string;
  stopId: string;
  cityColor: string;
}

interface CalendarEvent {
  id: string;
  dayIndex: number;
  stopId: string;
  time: string;
  title: string;
  category: string;
  cost: number;
  duration?: string;
  notes?: string;
  badge: string;
  slot: "morning" | "afternoon" | "evening";
}

interface TransitEvent {
  id: string;
  dayIndex: number;
  fromCity: string;
  toCity: string;
  time: string;
  title: string;
}

const CITY_PALETTES = [
  "bg-black/[0.03] text-obsidian-900 border-black/[0.08]",
  "bg-rose-50 text-rose-900 border-rose-200/50",
  "bg-amber-50 text-amber-900 border-amber-200/50",
  "bg-emerald-50 text-emerald-900 border-emerald-200/50",
  "bg-indigo-50 text-indigo-900 border-indigo-200/50",
  "bg-sky-50 text-sky-900 border-sky-200/50",
];

const CATEGORY_BADGES: Record<string, string> = {
  culture: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]",
  food: "bg-brand-50 text-brand-800 border border-brand-200/50",
  nature: "bg-emerald-50 text-emerald-800 border border-emerald-200/50",
  adventure: "bg-amber-50 text-amber-800 border border-amber-200/50",
  nightlife: "bg-indigo-50 text-indigo-800 border border-indigo-200/50",
  transport: "bg-black/[0.04] text-obsidian-900 border border-black/[0.08]",
};

function determineSlot(timeStr?: string): "morning" | "afternoon" | "evening" {
  if (!timeStr) return "morning";
  const upper = timeStr.toUpperCase();
  if (upper.includes("PM")) {
    const hour = parseInt(upper.split(":")[0], 10);
    if (hour === 12 || hour < 5) return "afternoon";
    return "evening";
  }
  return "morning";
}

function TripCalendarTimelineInner() {
  const searchParams = useSearchParams();
  const initialTripId = searchParams.get("tripId") || "japan-2026";

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"Month" | "Week" | "Day" | "Timeline">("Timeline");
  const [selectedTripId, setSelectedTripId] = useState(initialTripId);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Quick Add Activity Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetStopId, setTargetStopId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("10:00 AM");
  const [newCategory, setNewCategory] = useState("culture");
  const [newCost, setNewCost] = useState("1500");
  const [newDuration, setNewDuration] = useState("2 hrs");

  // Load all trips for trip selector
  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await fetch("/api/trips");
        const json = await res.json();
        if (json.data) {
          setTrips(json.data);
        }
      } catch (err) {
        console.error("Failed to load trips", err);
      }
    }
    loadTrips();
  }, []);

  // Load active trip data
  const loadTripData = async () => {
    try {
      const res = await fetch(`/api/trips/${selectedTripId}`);
      const json = await res.json();
      if (json.data) {
        setActiveTrip(json.data);
      }
    } catch (err) {
      console.error("Failed to load trip", err);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [selectedTripId]);

  // Dynamically generate days from stops
  const { days, timelineEvents, transitEvents } = useMemo(() => {
    const stops: TripStop[] = activeTrip?.stops || [];
    const generatedDays: CalendarDay[] = [];
    const events: CalendarEvent[] = [];
    const transits: TransitEvent[] = [];

    if (stops.length === 0) {
      // Fallback empty single day
      generatedDays.push({
        dayIndex: 0,
        dayName: "Day 1",
        dateStr: "Start",
        fullDate: "Upcoming",
        city: activeTrip?.destination || "Destination",
        stopId: "default",
        cityColor: CITY_PALETTES[0],
      });
      return { days: generatedDays, timelineEvents: events, transitEvents: transits };
    }

    const dayNames = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let dayCount = 0;

    stops.forEach((stop, stopIdx) => {
      const nights = Math.max(1, stop.nights || 1);
      const cityColor = CITY_PALETTES[stopIdx % CITY_PALETTES.length];

      // Add transit event if moving from previous stop
      if (stopIdx > 0) {
        transits.push({
          id: `transit-${stopIdx}`,
          dayIndex: dayCount,
          fromCity: stops[stopIdx - 1].city,
          toCity: stop.city,
          time: "11:00 AM",
          title: `Inter-city Connection (${stops[stopIdx - 1].city} → ${stop.city})`,
        });
      }

      // Generate days for this stop
      const stopStartDay = dayCount;
      for (let n = 0; n < nights; n++) {
        const dIdx = dayCount;
        const dName = dayNames[dIdx % dayNames.length];
        const dateNum = 12 + dIdx;
        generatedDays.push({
          dayIndex: dIdx,
          dayName: dName,
          dateStr: `Mar ${dateNum}`,
          fullDate: `${dName} Mar ${dateNum}`,
          city: stop.city,
          stopId: stop.id,
          cityColor,
        });
        dayCount++;
      }

      // Distribute activities across this stop's days
      const activities = stop.activities || [];
      activities.forEach((act, actIdx) => {
        // Distribute across days of this stop
        const assignedDayOffset = actIdx % nights;
        const assignedDayIndex = stopStartDay + assignedDayOffset;
        const catKey = (act.category || "culture").toLowerCase();

        events.push({
          id: act.id,
          dayIndex: assignedDayIndex,
          stopId: stop.id,
          time: act.time || "10:00 AM",
          title: act.title,
          category: act.category ? act.category.charAt(0).toUpperCase() + act.category.slice(1) : "Culture",
          cost: act.cost || 0,
          duration: act.duration || "1.5 hrs",
          notes: act.notes || "",
          badge: CATEGORY_BADGES[catKey] || CATEGORY_BADGES.culture,
          slot: determineSlot(act.time),
        });
      });
    });

    return { days: generatedDays, timelineEvents: events, transitEvents: transits };
  }, [activeTrip]);

  // Handle adding an activity from Calendar
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const stopIdToUse = targetStopId || days[selectedDayIndex]?.stopId || activeTrip?.stops?.[0]?.id;
    if (!stopIdToUse) return;

    try {
      const res = await fetch(`/api/trips/${selectedTripId}/stops/${stopIdToUse}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          time: newTime,
          category: newCategory.toLowerCase(),
          cost: parseFloat(newCost) || 0,
          duration: newDuration,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTitle("");
        loadTripData();
      }
    } catch (err) {
      console.error("Failed to add activity", err);
    }
  };

  // Handle deleting an activity from Calendar
  const handleDeleteActivity = async (stopId: string, activityId: string) => {
    try {
      const res = await fetch(`/api/trips/${selectedTripId}/stops/${stopId}/activities/${activityId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadTripData();
      }
    } catch (err) {
      console.error("Failed to delete activity", err);
    }
  };

  const currentSelectedDay = days[selectedDayIndex] || days[0];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row antialiased bg-canvas text-obsidian-900">
      {/* Sidebar */}
      <Sidebar onOpenAI={() => setIsAiOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 bg-canvas overflow-y-auto">
        {/* Top Architectural Header */}
        <header className="h-16 px-6 md:px-12 border-b border-black/[0.04] bg-canvas/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Link
              href="/trips"
              className="w-8 h-8 rounded-full bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-obsidian-900 hover:bg-black/[0.06] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.3} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-obsidian-900 leading-tight">
                  {activeTrip?.title || "Trip Calendar"}
                </h1>
                {/* Trip Switcher Dropdown */}
                {trips.length > 1 && (
                  <div className="relative inline-block">
                    <select
                      value={selectedTripId}
                      onChange={(e) => {
                        setSelectedTripId(e.target.value);
                        setSelectedDayIndex(0);
                      }}
                      className="text-[10px] font-semibold bg-black/[0.04] border border-black/[0.06] rounded-full px-2 py-0.5 pr-4 text-obsidian-900 appearance-none cursor-pointer focus:outline-none"
                    >
                      {trips.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-2.5 h-2.5 text-obsidian-900/50 absolute right-1 top-1.5 pointer-events-none" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-obsidian-900/40">
                {activeTrip?.dates || "Upcoming"} • {activeTrip?.stops?.length || 0} Cities • {days.length} Days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Add Activity Button */}
            <button
              onClick={() => {
                setTargetStopId(days[selectedDayIndex]?.stopId || activeTrip?.stops?.[0]?.id || "");
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.03] text-obsidian-900 border border-black/[0.06] text-xs font-semibold hover:bg-black/[0.06] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.4} />
              <span className="hidden sm:inline">Schedule Event</span>
            </button>

            {/* Button-in-Button Copilot */}
            <button
              onClick={() => setIsAiOpen(true)}
              className="group relative inline-flex items-center gap-2.5 pl-3.5 pr-1.5 py-1.5 rounded-full bg-obsidian-900 text-white text-xs font-medium shadow-hardware hover:bg-obsidian-850 active:scale-[0.98] transition-all duration-500 ease-luxury"
            >
              <span className="text-[11px] text-[#faf9f6]">Ask AI Copilot</span>
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 ease-luxury group-hover:scale-110">
                <Sparkles className="w-2.5 h-2.5 text-brand-200" strokeWidth={1.4} />
              </span>
            </button>
            <Link
              href={`/trips/${selectedTripId}`}
              className="px-3.5 py-1.5 rounded-full border border-black/[0.06] text-xs font-semibold text-obsidian-900 hover:bg-black/[0.03] transition-colors"
            >
              Edit Itinerary
            </Link>
          </div>
        </header>

        {/* Calendar Body with Macro Whitespace */}
        <div className="p-6 md:p-12 space-y-10 max-w-7xl">
          {/* Top Banner with Weather widgets (Doppelrand) */}
          <div className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
            <div className="p-6 sm:p-8 rounded-[calc(2rem-0.375rem)] bg-white shadow-hardware flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-[0.2em] block">
                  Chrono Navigation
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-obsidian-900 tracking-tight">
                  Temporal Schedule & Timeline
                </h2>
                <p className="text-xs text-obsidian-900/50 font-light leading-relaxed max-w-xl">
                  Inspect hour-by-hour scheduled activities, temple morning walks, and bullet train connections across all stops.
                </p>
              </div>

              {/* Dynamic Weather Telemetry Pills from stops */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {(activeTrip?.stops || []).slice(0, 2).map((stop, idx) => (
                  <div
                    key={stop.id}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full border font-medium ${
                      idx === 0
                        ? "bg-amber-50/70 border-amber-200/50 text-amber-900"
                        : "bg-brand-50 border-brand-200/50 text-brand-900"
                    }`}
                  >
                    {idx === 0 ? (
                      <Sun className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.3} />
                    ) : (
                      <CloudSun className="w-3.5 h-3.5 text-brand-700" strokeWidth={1.3} />
                    )}
                    <span className="text-xs">
                      {stop.city}: {18 + idx * 2}°C {idx === 0 ? "Sunny" : "Fair"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View Switchers and Date Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="p-1 bg-black/[0.03] ring-1 ring-black/[0.04] rounded-full text-xs font-semibold text-obsidian-900/60 flex gap-1">
              {(["Timeline", "Day", "Week", "Month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-full transition-all duration-300 text-xs ${
                    viewMode === mode
                      ? "bg-white text-obsidian-900 shadow-hardware font-bold"
                      : "hover:text-obsidian-900"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSelectedDayIndex(0)}
                className="px-4 py-1.5 bg-white border border-black/[0.06] rounded-full text-xs font-semibold text-obsidian-900 hover:bg-black/[0.02] shadow-2xs"
              >
                Today
              </button>
              <div className="flex items-center border border-black/[0.06] rounded-full bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setSelectedDayIndex((prev) => Math.max(0, prev - 1))}
                  className="p-2 hover:bg-black/[0.02] text-obsidian-900/60 disabled:opacity-30"
                  disabled={selectedDayIndex <= 0}
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.3} />
                </button>
                <span className="px-3 text-xs font-bold text-obsidian-900 font-mono">
                  {days[0]?.dateStr} – {days[days.length - 1]?.dateStr}
                </span>
                <button
                  onClick={() => setSelectedDayIndex((prev) => Math.min(days.length - 1, prev + 1))}
                  className="p-2 hover:bg-black/[0.02] text-obsidian-900/60 disabled:opacity-30"
                  disabled={selectedDayIndex >= days.length - 1}
                >
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.3} />
                </button>
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: TIMELINE (Horizontal Multi-Day Grid) */}
          {viewMode === "Timeline" && (
            <div className="p-2 rounded-[2.5rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2.5rem-0.5rem)] bg-white shadow-hardware overflow-hidden">
                {/* Days Header */}
                <div
                  className="grid border-b border-black/[0.05] text-center text-xs bg-canvas-subtle/30 divide-x divide-black/[0.04]"
                  style={{ gridTemplateColumns: `repeat(${days.length}, minmax(130px, 1fr))` }}
                >
                  {days.map((d, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedDayIndex(i)}
                      className={`py-4 px-2 cursor-pointer transition-all duration-300 ${
                        selectedDayIndex === i
                          ? "bg-white shadow-2xs font-bold text-obsidian-900"
                          : "hover:bg-black/[0.02] text-obsidian-900/70"
                      }`}
                    >
                      <span className="block text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold">
                        {d.dayName}
                      </span>
                      <span className="font-bold text-sm leading-tight font-mono">{d.dateStr}</span>
                      <div className={`mt-2 py-0.5 px-2 rounded-full border text-[9px] font-bold ${d.cityColor}`}>
                        {d.city}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time slot rows */}
                <div className="divide-y divide-black/[0.04] text-xs">
                  {/* Morning Row */}
                  <div
                    className="grid divide-x divide-black/[0.04] min-h-[120px] p-2 bg-white"
                    style={{ gridTemplateColumns: `repeat(${days.length}, minmax(130px, 1fr))` }}
                  >
                    {days.map((d, dIdx) => {
                      const items = timelineEvents.filter((ev) => ev.dayIndex === dIdx && ev.slot === "morning");
                      return (
                        <div key={dIdx} className="p-1.5 space-y-2">
                          <span className="text-[9px] uppercase tracking-wider font-mono text-obsidian-900/40 font-semibold block">
                            Morning
                          </span>
                          {items.length === 0 ? (
                            <div className="p-3 text-center text-[10px] text-obsidian-900/20 border border-dashed border-black/[0.05] rounded-xl">
                              Free
                            </div>
                          ) : (
                            items.map((it) => (
                              <div
                                key={it.id}
                                className="group relative p-2.5 rounded-2xl bg-canvas-subtle/50 border border-black/[0.04] hover:bg-white hover:shadow-hardware transition-all duration-300 cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono text-obsidian-900/50 font-medium block">
                                    {it.time}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteActivity(it.stopId, it.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-obsidian-900/30 hover:text-rose-600 transition-opacity"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <p className="font-bold text-obsidian-900 text-xs line-clamp-1 mt-0.5">{it.title}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-medium ${it.badge}`}>
                                    {it.category}
                                  </span>
                                  {it.cost > 0 && (
                                    <span className="text-[9px] font-mono text-obsidian-900/50">₹{it.cost}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic Transit Row */}
                  {transitEvents.length > 0 && (
                    <div className="bg-canvas-subtle/80 p-3 px-6 flex flex-wrap items-center justify-between border-y border-black/[0.04] text-xs text-obsidian-900 font-semibold gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-obsidian-900 text-white flex items-center justify-center shrink-0">
                          <Train className="w-3.5 h-3.5 text-brand-200" strokeWidth={1.3} />
                        </div>
                        <span>
                          Inter-City Transit: {transitEvents.map((t) => `${t.fromCity} → ${t.toCity}`).join(" • ")}
                        </span>
                      </div>
                      <span className="text-[10px] text-obsidian-900/50 font-mono">
                        Shinkansen Bullet Rail & Scenic Express Transfers
                      </span>
                    </div>
                  )}

                  {/* Afternoon Row */}
                  <div
                    className="grid divide-x divide-black/[0.04] min-h-[120px] p-2 bg-white"
                    style={{ gridTemplateColumns: `repeat(${days.length}, minmax(130px, 1fr))` }}
                  >
                    {days.map((d, dIdx) => {
                      const items = timelineEvents.filter((ev) => ev.dayIndex === dIdx && ev.slot === "afternoon");
                      return (
                        <div key={dIdx} className="p-1.5 space-y-2">
                          <span className="text-[9px] uppercase tracking-wider font-mono text-obsidian-900/40 font-semibold block">
                            Afternoon
                          </span>
                          {items.length === 0 ? (
                            <div className="p-3 text-center text-[10px] text-obsidian-900/20 border border-dashed border-black/[0.05] rounded-xl">
                              Free
                            </div>
                          ) : (
                            items.map((it) => (
                              <div
                                key={it.id}
                                className="group relative p-2.5 rounded-2xl bg-canvas-subtle/50 border border-black/[0.04] hover:bg-white hover:shadow-hardware transition-all duration-300 cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono text-obsidian-900/50 font-medium block">
                                    {it.time}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteActivity(it.stopId, it.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-obsidian-900/30 hover:text-rose-600 transition-opacity"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <p className="font-bold text-obsidian-900 text-xs line-clamp-1 mt-0.5">{it.title}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-medium ${it.badge}`}>
                                    {it.category}
                                  </span>
                                  {it.cost > 0 && (
                                    <span className="text-[9px] font-mono text-obsidian-900/50">₹{it.cost}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Evening Row */}
                  <div
                    className="grid divide-x divide-black/[0.04] min-h-[120px] p-2 bg-white"
                    style={{ gridTemplateColumns: `repeat(${days.length}, minmax(130px, 1fr))` }}
                  >
                    {days.map((d, dIdx) => {
                      const items = timelineEvents.filter((ev) => ev.dayIndex === dIdx && ev.slot === "evening");
                      return (
                        <div key={dIdx} className="p-1.5 space-y-2">
                          <span className="text-[9px] uppercase tracking-wider font-mono text-obsidian-900/40 font-semibold block">
                            Evening
                          </span>
                          {items.length === 0 ? (
                            <div className="p-3 text-center text-[10px] text-obsidian-900/20 border border-dashed border-black/[0.05] rounded-xl">
                              Free
                            </div>
                          ) : (
                            items.map((it) => (
                              <div
                                key={it.id}
                                className="group relative p-2.5 rounded-2xl bg-canvas-subtle/50 border border-black/[0.04] hover:bg-white hover:shadow-hardware transition-all duration-300 cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono text-obsidian-900/50 font-medium block">
                                    {it.time}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteActivity(it.stopId, it.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-obsidian-900/30 hover:text-rose-600 transition-opacity"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <p className="font-bold text-obsidian-900 text-xs line-clamp-1 mt-0.5">{it.title}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-medium ${it.badge}`}>
                                    {it.category}
                                  </span>
                                  {it.cost > 0 && (
                                    <span className="text-[9px] font-mono text-obsidian-900/50">₹{it.cost}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: DAY VIEW (Focused Agenda for Current Day) */}
          {viewMode === "Day" && (
            <div className="p-2 rounded-[2.5rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-10 shadow-hardware space-y-6">
                <div className="flex flex-wrap items-center justify-between border-b border-black/[0.05] pb-5 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-[0.2em] block">
                      Single Day Focus
                    </span>
                    <h3 className="text-2xl font-bold text-obsidian-900">
                      {currentSelectedDay?.fullDate} • {currentSelectedDay?.city}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDayIndex((prev) => Math.max(0, prev - 1))}
                      disabled={selectedDayIndex <= 0}
                      className="px-3.5 py-1.5 rounded-full border border-black/[0.08] text-xs font-semibold hover:bg-black/[0.02] disabled:opacity-30"
                    >
                      ← Previous Day
                    </button>
                    <button
                      onClick={() => setSelectedDayIndex((prev) => Math.min(days.length - 1, prev + 1))}
                      disabled={selectedDayIndex >= days.length - 1}
                      className="px-3.5 py-1.5 rounded-full border border-black/[0.08] text-xs font-semibold hover:bg-black/[0.02] disabled:opacity-30"
                    >
                      Next Day →
                    </button>
                    <button
                      onClick={() => {
                        setTargetStopId(currentSelectedDay?.stopId || "");
                        setShowAddModal(true);
                      }}
                      className="px-4 py-1.5 rounded-full bg-obsidian-900 text-white text-xs font-semibold hover:bg-obsidian-850 shadow-hardware"
                    >
                      + Add Activity
                    </button>
                  </div>
                </div>

                {/* Day Agenda List */}
                <div className="space-y-4">
                  {timelineEvents.filter((ev) => ev.dayIndex === selectedDayIndex).length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <Compass className="w-8 h-8 text-obsidian-900/30 mx-auto" />
                      <p className="text-sm font-semibold text-obsidian-900">No scheduled activities for this day</p>
                      <p className="text-xs text-obsidian-900/40 max-w-sm mx-auto">
                        Enjoy unstructured exploration in {currentSelectedDay?.city}, or click above to schedule a new visit.
                      </p>
                    </div>
                  ) : (
                    timelineEvents
                      .filter((ev) => ev.dayIndex === selectedDayIndex)
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-start justify-between p-5 rounded-2xl border border-black/[0.05] bg-canvas-subtle/30 hover:bg-white hover:shadow-hardware transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="px-3 py-1.5 rounded-xl bg-black/[0.04] text-obsidian-900 font-mono text-xs font-bold shrink-0">
                              {ev.time}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm text-obsidian-900">{ev.title}</h4>
                              {ev.notes && <p className="text-xs text-obsidian-900/60 font-light">{ev.notes}</p>}
                              <div className="flex items-center gap-3 pt-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${ev.badge}`}>
                                  {ev.category}
                                </span>
                                {ev.duration && (
                                  <span className="text-[10px] text-obsidian-900/40 flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3" />
                                    {ev.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-2">
                            {ev.cost > 0 && (
                              <span className="font-bold text-xs font-mono text-obsidian-900">
                                ₹{ev.cost.toLocaleString()}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteActivity(ev.stopId, ev.id)}
                              className="text-obsidian-900/30 hover:text-rose-600 transition-colors p-1"
                              title="Delete activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: WEEK VIEW (7-Day Overview) */}
          {viewMode === "Week" && (
            <div className="p-2 rounded-[2.5rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-8 shadow-hardware space-y-6">
                <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-[0.2em] block">
                      Weekly Horizon
                    </span>
                    <h3 className="text-lg font-bold text-obsidian-900">7-Day Rolling Window</h3>
                  </div>
                  <span className="text-xs font-mono text-obsidian-900/40">{days.length} Total Expedition Days</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                  {days.slice(0, 7).map((day, idx) => {
                    const dayEvents = timelineEvents.filter((ev) => ev.dayIndex === idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedDayIndex(idx);
                          setViewMode("Day");
                        }}
                        className="p-3.5 rounded-2xl border border-black/[0.05] bg-canvas-subtle/40 hover:bg-white hover:shadow-hardware transition-all cursor-pointer space-y-3 min-h-[160px]"
                      >
                        <div className="border-b border-black/[0.04] pb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-obsidian-900/40 block">
                            {day.dayName}
                          </span>
                          <span className="text-sm font-bold font-mono text-obsidian-900">{day.dateStr}</span>
                          <div className={`mt-1 py-0.5 px-2 rounded-full border text-[9px] font-bold ${day.cityColor}`}>
                            {day.city}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          {dayEvents.map((ev) => (
                            <div key={ev.id} className="text-[10px] bg-white p-1.5 rounded-lg border border-black/[0.04] shadow-2xs">
                              <span className="font-bold text-obsidian-900 block truncate">{ev.title}</span>
                              <span className="text-obsidian-900/40 font-mono text-[9px]">{ev.time}</span>
                            </div>
                          ))}
                          {dayEvents.length === 0 && (
                            <span className="text-[10px] text-obsidian-900/30 italic block text-center pt-4">No events</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 4: MONTH VIEW (Monthly Calendar Matrix) */}
          {viewMode === "Month" && (
            <div className="p-2 rounded-[2.5rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-8 shadow-hardware space-y-6">
                <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-[0.2em] block">
                      Macro Monthly Outlook
                    </span>
                    <h3 className="text-lg font-bold text-obsidian-900">March 2026</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-obsidian-900" />
                    <span className="text-xs font-semibold text-obsidian-900">Active Itinerary Days</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                    <div key={dayName} className="py-2 text-[10px] font-bold uppercase tracking-wider text-obsidian-900/40">
                      {dayName}
                    </div>
                  ))}

                  {/* 31 days of March */}
                  {Array.from({ length: 31 }, (_, i) => {
                    const dayNum = i + 1;
                    const matchingDay = days.find((d) => d.dateStr === `Mar ${dayNum}`);
                    return (
                      <div
                        key={dayNum}
                        onClick={() => {
                          if (matchingDay) {
                            setSelectedDayIndex(matchingDay.dayIndex);
                            setViewMode("Day");
                          }
                        }}
                        className={`p-3 rounded-2xl min-h-[70px] flex flex-col justify-between border transition-all ${
                          matchingDay
                            ? "bg-canvas-subtle/80 border-obsidian-900/20 shadow-2xs font-bold cursor-pointer hover:bg-white hover:shadow-hardware"
                            : "bg-canvas-subtle/10 border-black/[0.02] text-obsidian-900/30"
                        }`}
                      >
                        <span className="font-mono text-xs text-left">{dayNum}</span>
                        {matchingDay && (
                          <div className={`py-0.5 px-1.5 rounded-md text-[8px] font-bold truncate ${matchingDay.cityColor}`}>
                            {matchingDay.city}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Quick Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-md animate-in fade-in">
          <div className="p-2 rounded-[2.5rem] bg-black/[0.05] ring-1 ring-black/[0.06] w-full max-w-md animate-in zoom-in-95">
            <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-3.5">
                <div>
                  <h3 className="font-bold text-base text-obsidian-900">Schedule New Activity</h3>
                  <p className="text-[10px] text-obsidian-900/40">Add event directly to the calendar timeline</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-obsidian-900/40 hover:text-obsidian-900 text-xs">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddActivity} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-obsidian-900 mb-1">Destination City Stop</label>
                  <select
                    value={targetStopId}
                    onChange={(e) => setTargetStopId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none"
                  >
                    {(activeTrip?.stops || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.city} ({s.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-obsidian-900 mb-1">Activity Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fushimi Inari Sunrise Hike"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-1">Scheduled Time</label>
                    <input
                      type="text"
                      required
                      placeholder="09:30 AM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none"
                    >
                      <option value="culture">Culture</option>
                      <option value="food">Food</option>
                      <option value="nature">Nature</option>
                      <option value="adventure">Adventure</option>
                      <option value="nightlife">Nightlife</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-1">Cost (INR)</label>
                    <input
                      type="number"
                      placeholder="1500"
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="2 hrs"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-full text-obsidian-900/60 font-semibold hover:bg-black/[0.03]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-obsidian-900 text-white font-semibold hover:bg-obsidian-850 shadow-hardware"
                  >
                    Add to Calendar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Ask AI Assistant Panel */}
      <AskAIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}

export default function TripCalendarTimelinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center text-xs">Loading Calendar...</div>}>
      <TripCalendarTimelineInner />
    </Suspense>
  );
}

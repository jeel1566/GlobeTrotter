'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Wallet,
  ChevronRight,
  AlertCircle,
  Loader2,
  ListOrdered,
  LayoutGrid,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { Activity, ActivityCategory, Trip, TripStop } from '@/types/database';

const CATEGORIES: { value: ActivityCategory; label: string }[] = [
  { value: 'culture', label: 'Culture' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'nature', label: 'Nature & Outdoors' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'nightlife', label: 'Nightlife' },
];

function getCategoryBadgeClass(category: ActivityCategory): string {
  switch (category) {
    case 'culture':
      return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'food':
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'nature':
      return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'adventure':
      return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    case 'nightlife':
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

function CalendarContent() {
  const searchParams = useSearchParams();
  const rawTripId = searchParams.get('tripId');
  const initialTripId = rawTripId && rawTripId !== 'undefined' ? rawTripId : null;

  // Trips list state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [tripsError, setTripsError] = useState<string | null>(null);

  // Selected trip state
  const [selectedTripId, setSelectedTripId] = useState<string | null>(initialTripId || null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isLoadingTripDetail, setIsLoadingTripDetail] = useState(false);
  const [tripDetailError, setTripDetailError] = useState<string | null>(null);

  // View & filter state
  const [viewMode, setViewMode] = useState<'board' | 'agenda'>('board');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 1. Fetch user's trips list
  const loadTrips = useCallback(async () => {
    setIsLoadingTrips(true);
    setTripsError(null);
    try {
      const res = await fetch('/api/trips');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to fetch trips (${res.status})`);
      }
      const json = await res.json();
      const tripsList: Trip[] = json.data || [];
      setTrips(tripsList);

      if (tripsList.length > 0) {
        // If an initial trip was requested and exists, keep it; otherwise default to first trip
        if (initialTripId && tripsList.some((t) => t.id === initialTripId)) {
          setSelectedTripId(initialTripId);
        } else {
          setSelectedTripId((prev) => {
            if (prev && tripsList.some((t) => t.id === prev)) {
              return prev;
            }
            return tripsList[0].id;
          });
        }
      } else {
        setSelectedTripId(null);
      }
    } catch (err: any) {
      console.error('Failed to load trips:', err);
      setTripsError(err.message || 'Unable to load trips');
    } finally {
      setIsLoadingTrips(false);
    }
  }, [initialTripId]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // 2. Fetch selected trip full details (stops and activities)
  const loadTripDetail = useCallback(async (tripId: string) => {
    if (!tripId || tripId === 'undefined') return;
    setIsLoadingTripDetail(true);
    setTripDetailError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to fetch trip details (${res.status})`);
      }
      const json = await res.json();
      if (json.data) {
        setSelectedTrip(json.data);
      } else {
        throw new Error('Trip data missing in response');
      }
    } catch (err: any) {
      console.error('Failed to load trip details:', err);
      setTripDetailError(err.message || 'Unable to load trip schedule');
    } finally {
      setIsLoadingTripDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      loadTripDetail(selectedTripId);
    } else {
      setSelectedTrip(null);
    }
  }, [selectedTripId, loadTripDetail]);

  // Derived stops and activities sorted by order_index
  const stops: TripStop[] = useMemo(() => {
    if (!selectedTrip?.stops) return [];
    return [...selectedTrip.stops]
      .sort((a, b) => a.order_index - b.order_index)
      .map((stop) => ({
        ...stop,
        activities: [...(stop.activities || [])].sort((a, b) => a.order_index - b.order_index),
      }));
  }, [selectedTrip?.stops]);

  // All activities flattened
  const allActivities: Activity[] = useMemo(() => {
    return stops.flatMap((s) => s.activities || []);
  }, [stops]);

  // Filtered activities count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allActivities.length,
      culture: 0,
      food: 0,
      nature: 0,
      adventure: 0,
      nightlife: 0,
    };
    allActivities.forEach((act) => {
      if (counts[act.category] !== undefined) {
        counts[act.category]++;
      }
    });
    return counts;
  }, [allActivities]);

  const totalPlannedCost = useMemo(() => {
    return allActivities.reduce((sum, act) => sum + Number(act.cost || 0), 0);
  }, [allActivities]);

  const totalDurationMinutes = useMemo(() => {
    return allActivities.reduce((sum, act) => sum + Number(act.duration_minutes || 0), 0);
  }, [allActivities]);

  // Initial full-page loading state for trips
  if (isLoadingTrips && trips.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading your travel calendar...</p>
        </div>
      </AppShell>
    );
  }

  // Trips loading error
  if (tripsError && trips.length === 0) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-sm flex flex-col items-center text-center gap-3">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unable to load trips</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{tripsError}</p>
          <div className="flex items-center gap-3 mt-2">
            <Button onClick={loadTrips} size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
              Retry
            </Button>
            <Link href="/trips">
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                Back to trips
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // Empty trips state
  if (!isLoadingTrips && trips.length === 0) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-black/[0.05] dark:border-white/10 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600">
            <CalendarIcon className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">No trips found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Create a trip and add stops with scheduled activities to view your travel calendar and sequence sheet.
          </p>
          <Link href="/trips/create">
            <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-sm mt-2">
              <Plus className="w-3.5 h-3.5" />
              <span>Create your first trip</span>
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-6 max-w-[1720px] mx-auto gap-6">
        
        {/* TOP CONTROL BAR: Trip Selector & Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-black/[0.05] dark:border-white/10 shadow-sm">
          
          {/* Left: Trip Selector & Real Dates */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-black/[0.05] dark:border-white/10">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={1.5} />
              <label htmlFor="trip-selector" className="sr-only">Select trip</label>
              <select
                id="trip-selector"
                value={selectedTripId || ''}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white pr-4 py-1 focus:outline-none cursor-pointer max-w-[260px] truncate"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedTrip?.start_date || selectedTrip?.end_date ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono font-medium">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                <span>
                  {selectedTrip.start_date || 'Start not set'} → {selectedTrip.end_date || 'End not set'}
                </span>
              </div>
            ) : null}

            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
              {stops.length} {stops.length === 1 ? 'stop' : 'stops'} • {allActivities.length} {allActivities.length === 1 ? 'activity' : 'activities'}
            </span>
          </div>

          {/* Right: View Modes & Itinerary Builder Link */}
          <div className="flex items-center gap-3 flex-wrap self-start lg:self-auto">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-black/[0.04] dark:border-white/5">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                <span>Stop Board</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
                <span>Agenda View</span>
              </button>
            </div>

            {selectedTrip && (
              <Link href={`/trips/${selectedTrip.id}`}>
                <Button
                  size="sm"
                  className="rounded-full text-xs h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
                >
                  <span>Edit in Builder</span>
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Button>
              </Link>
            )}
          </div>

        </div>

        {/* CATEGORY FILTER BAR */}
        <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full font-semibold transition-all text-xs ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              All ({categoryCounts.all})
            </button>
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.value] || 0;
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1 rounded-full font-semibold transition-all text-xs ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : `bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 hover:border-slate-300 ${getCategoryBadgeClass(cat.value)}`
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="font-mono text-[11px] text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
              <span>{totalDurationMinutes} min scheduled</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                ₹{totalPlannedCost.toLocaleString('en-IN')}
              </span>
            </span>
          </div>
        </div>

        {/* MAIN 12-COLUMN WORKSPACE: Schedule Canvas (9 Cols) + Summary Panel (3 Cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 9 COLS: SCHEDULE CANVAS */}
          <div className="xl:col-span-9 flex flex-col gap-6">
            
            {isLoadingTripDetail ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-black/[0.05] dark:border-white/10 p-12 flex flex-col items-center justify-center gap-3 min-h-[400px]">
                <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                <p className="text-xs font-medium text-slate-500">Loading trip schedule...</p>
              </div>
            ) : tripDetailError ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/50 p-8 flex flex-col items-center text-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Failed to load trip schedule</h3>
                <p className="text-xs text-slate-500">{tripDetailError}</p>
                {selectedTripId && (
                  <Button
                    onClick={() => loadTripDetail(selectedTripId)}
                    size="sm"
                    className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white mt-2"
                  >
                    Retry
                  </Button>
                )}
              </div>
            ) : stops.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center text-center gap-3">
                <CalendarIcon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No stops planned for this trip yet</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Stops and scheduled activities added in the Itinerary Builder will appear here in chronological sequence.
                </p>
                {selectedTrip && (
                  <Link href={`/trips/${selectedTrip.id}`}>
                    <Button size="sm" className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 mt-2">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add stops in Builder</span>
                    </Button>
                  </Link>
                )}
              </div>
            ) : viewMode === 'board' ? (
              /* STOP COLUMNS (BOARD VIEW) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                {stops.map((stop, stopIdx) => {
                  const filteredActivities = (stop.activities || []).filter(
                    (act) => selectedCategory === 'all' || act.category === selectedCategory
                  );
                  const stopTotalCost = (stop.activities || []).reduce((sum, act) => sum + Number(act.cost || 0), 0);
                  const stopDuration = (stop.activities || []).reduce((sum, act) => sum + Number(act.duration_minutes || 0), 0);

                  return (
                    <div
                      key={stop.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-black/[0.05] dark:border-white/10 shadow-sm overflow-hidden flex flex-col"
                    >
                      {/* Column Header: Stop Info */}
                      <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-black/[0.05] dark:border-white/10 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[10px] font-bold tracking-wider">
                            STOP {stopIdx + 1 < 10 ? `0${stopIdx + 1}` : stopIdx + 1}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                            ₹{stopTotalCost.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mt-1 truncate">
                          {stop.city}{stop.country ? `, ${stop.country}` : ''}
                        </h3>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                          <span>
                            {stop.arrival_date || stop.departure_date
                              ? `${stop.arrival_date || 'Start'} → ${stop.departure_date || 'End'}`
                              : 'Dates not set'}
                          </span>
                          <span>{stopDuration} min</span>
                        </div>
                      </div>

                      {/* Activities in this Stop */}
                      <div className="p-3 flex flex-col gap-2.5 min-h-[220px]">
                        {filteredActivities.length === 0 ? (
                          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 my-auto">
                            <Clock className="w-5 h-5 mb-1.5 opacity-50" strokeWidth={1.5} />
                            <span className="text-xs font-medium">
                              {selectedCategory !== 'all' ? 'No activities in this category' : 'No activities scheduled'}
                            </span>
                          </div>
                        ) : (
                          filteredActivities.map((act) => (
                            <motion.div
                              key={act.id}
                              whileHover={{ scale: 1.01 }}
                              className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-black/[0.04] dark:border-white/5 shadow-xs flex flex-col gap-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-bold text-slate-400">
                                    #{act.order_index + 1}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(act.category)}`}>
                                    {CATEGORIES.find((c) => c.value === act.category)?.label || act.category}
                                  </span>
                                </div>
                                <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                  ₹{Number(act.cost || 0).toLocaleString('en-IN')}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                {act.title}
                              </h4>

                              {act.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {act.notes}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                                <span className="flex items-center gap-1 text-teal-600 font-semibold">
                                  <Clock className="w-3 h-3" />
                                  <span>{act.duration_minutes} min</span>
                                </span>
                                <span>Sequence #{act.order_index + 1}</span>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* AGENDA / TIMELINE LIST VIEW */
              <div className="flex flex-col gap-5">
                {stops.map((stop, stopIdx) => {
                  const filteredActivities = (stop.activities || []).filter(
                    (act) => selectedCategory === 'all' || act.category === selectedCategory
                  );
                  const stopTotalCost = (stop.activities || []).reduce((sum, act) => sum + Number(act.cost || 0), 0);

                  return (
                    <div
                      key={stop.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-black/[0.05] dark:border-white/10 shadow-sm p-5 flex flex-col gap-4"
                    >
                      {/* Stop Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/5 gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[11px] font-bold tracking-wider">
                            STOP {stopIdx + 1}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {stop.city}{stop.country ? `, ${stop.country}` : ''}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                          <span>
                            {stop.arrival_date || stop.departure_date
                              ? `${stop.arrival_date || 'Start'} → ${stop.departure_date || 'End'}`
                              : 'Dates not set'}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            ₹{stopTotalCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Activities sequence */}
                      <div className="flex flex-col gap-3">
                        {filteredActivities.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                            {selectedCategory !== 'all' ? 'No activities matching this category filter.' : 'No activities scheduled for this stop.'}
                          </div>
                        ) : (
                          filteredActivities.map((act) => (
                            <div
                              key={act.id}
                              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-black/[0.04] dark:border-white/5 flex flex-col gap-2"
                            >
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                                    STEP {act.order_index + 1}
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {act.title}
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(act.category)}`}>
                                    {CATEGORIES.find((c) => c.value === act.category)?.label || act.category}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-mono">
                                  <span className="text-teal-600 font-semibold flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{act.duration_minutes} min</span>
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    ₹{Number(act.cost || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>

                              {act.notes && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-1">
                                  {act.notes}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* RIGHT 3 COLS: TRIP SCHEDULE & STATS SIDEBAR */}
          <aside className="xl:col-span-3 flex flex-col gap-5">
            <DoubleBezel innerClassName="p-5 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/5 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Trip Overview
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase">
                  {selectedTrip?.status || 'draft'}
                </span>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedTrip?.title || 'Selected Trip'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedTrip?.destination || (stops[0] ? `${stops[0].city}` : 'Destination not set')}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Total Planned Stops</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{stops.length}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Total Activities</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{allActivities.length}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Total Duration</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {totalDurationMinutes} min (~{Math.round(totalDurationMinutes / 60)}h)
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Activities Expense</span>
                    <span className="font-bold text-teal-600">₹{totalPlannedCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Trip Total Budget</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ₹{Number(selectedTrip?.budget_total || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {Number(selectedTrip?.budget_total || 0) > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-mono font-semibold">
                      <span className="text-slate-400">Budget Consumed</span>
                      <span className="text-blue-600">
                        {Math.round((totalPlannedCost / Number(selectedTrip?.budget_total || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(2, (totalPlannedCost / Number(selectedTrip?.budget_total || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stop Jump Links */}
              {stops.length > 0 && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Stops in Sequence
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {stops.map((stop, idx) => (
                      <div
                        key={stop.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] font-mono"
                      >
                        <span className="truncate max-w-[140px] font-medium text-slate-800 dark:text-slate-200">
                          {idx + 1}. {stop.city}
                        </span>
                        <span className="text-slate-400">
                          {stop.activities?.length || 0} acts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              {selectedTrip && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <Link href={`/trips/${selectedTrip.id}`}>
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs gap-1.5">
                      <span>Open Itinerary Builder</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Link href={`/trips/${selectedTrip.id}/view`}>
                    <Button variant="ghost" size="sm" className="w-full rounded-xl text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">
                      <span>Public Share Page</span>
                    </Button>
                  </Link>
                </div>
              )}
            </DoubleBezel>
          </aside>

        </div>

      </div>
    </AppShell>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading travel calendar...</p>
        </div>
      </AppShell>
    }>
      <CalendarContent />
    </Suspense>
  );
}

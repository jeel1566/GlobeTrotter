'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Calendar,
  ChevronRight,
  Search,
  AlertCircle,
  RefreshCw,
  Eye,
  Lock,
  Globe,
  Compass,
  Plus,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { ButtonInButton } from '@/components/ui/button-in-button';
import { Trip, TripStatus } from '@/types/database';

interface PersistedTrip extends Trip {
  trip_stops?: Array<{
    id: string;
    city: string;
    country?: string | null;
    order_index: number;
  }>;
}

type FilterStatus = 'all' | 'draft' | 'active' | 'completed';

const STATUS_TABS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

function formatDateRange(start?: string | null, end?: string | null): string {
  if (start && end) {
    return `${start} → ${end}`;
  }
  if (start) {
    return `${start} (End not set)`;
  }
  if (end) {
    return `Until ${end}`;
  }
  return 'Dates not set';
}

function calculateDays(start?: string | null, end?: string | null): number | null {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return null;
  const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : null;
}

function getStopCount(trip: PersistedTrip): number {
  if (Array.isArray(trip.trip_stops)) return trip.trip_stops.length;
  if (Array.isArray(trip.stops)) return trip.stops.length;
  return 0;
}

function formatTripBudget(trip: PersistedTrip): { text: string; isSet: boolean } {
  if (trip.budget_total && Number(trip.budget_total) > 0) {
    return {
      text: `₹${Number(trip.budget_total).toLocaleString('en-IN')}`,
      isSet: true,
    };
  }
  if (trip.estimated_cost_usd && Number(trip.estimated_cost_usd) > 0) {
    return {
      text: `$${Number(trip.estimated_cost_usd).toLocaleString()} USD`,
      isSet: true,
    };
  }
  return {
    text: 'Budget not set',
    isSet: false,
  };
}

function getStatusBadge(status: TripStatus) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        className: 'bg-emerald-500 text-white',
      };
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-slate-800 text-slate-200',
      };
    case 'draft':
    default:
      return {
        label: 'Draft',
        className: 'bg-blue-600 text-white',
      };
  }
}

function getVisibilityBadge(visibility: 'public' | 'private') {
  if (visibility === 'public') {
    return {
      label: 'Public',
      icon: Globe,
      className: 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30',
    };
  }
  return {
    label: 'Private',
    icon: Lock,
    className: 'bg-black/40 text-slate-200 border border-white/20',
  };
}

export default function TripsListingPage() {
  const [trips, setTrips] = useState<PersistedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trips');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to fetch trips (${res.status})`);
      }
      const json = await res.json();
      const tripsList: PersistedTrip[] = json.data || [];
      setTrips(tripsList);
    } catch (err: any) {
      console.error('Failed to load trips', err);
      setError(err.message || 'Unable to load trips');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const statusCounts = useMemo(() => {
    return {
      all: trips.length,
      draft: trips.filter((t) => t.status === 'draft').length,
      active: trips.filter((t) => t.status === 'active').length,
      completed: trips.filter((t) => t.status === 'completed').length,
    };
  }, [trips]);

  const filtered = useMemo(() => {
    return trips.filter((t) => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const query = search.trim().toLowerCase();
      if (!query) return matchesStatus;

      const titleMatch = t.title?.toLowerCase().includes(query) ?? false;
      const destMatch = t.destination?.toLowerCase().includes(query) ?? false;
      const stopMatch =
        t.trip_stops?.some((s) => s.city?.toLowerCase().includes(query)) ?? false;

      return matchesStatus && (titleMatch || destMatch || stopMatch);
    });
  }, [trips, statusFilter, search]);

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-6 max-w-[1720px] mx-auto gap-8">

        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.05] dark:border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest">
              My Travel Workspaces
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Trips &amp; Itineraries
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your itineraries, scheduled activities, and travel budgets.
            </p>
          </div>

          <Link href="/trips/create">
            <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 gap-1.5 shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>New Trip</span>
            </Button>
          </Link>
        </div>

        {/* ERROR STATE BANNER */}
        {error && (
          <div className="w-full p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-red-900 dark:text-red-200">Unable to load trips</h3>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{error}</p>
              </div>
            </div>
            <Button
              onClick={loadTrips}
              size="sm"
              className="rounded-full bg-red-600 hover:bg-red-700 text-white text-xs px-3.5 h-8 self-end sm:self-auto shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* CONTROLS DOCK: Search, Status Filters & Refresh */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title, destination, or city..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-black/[0.04] dark:border-white/5">
              {STATUS_TABS.map((tab) => {
                const count = statusCounts[tab.value];
                const isActive = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                          : 'bg-black/[0.04] dark:bg-white/10 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={loadTrips}
              disabled={isLoading}
              title="Refresh trips"
              aria-label="Refresh trips"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* CONTENT STATES */}
        {isLoading && trips.length === 0 ? (
          /* SKELETON LOADING GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <DoubleBezel
                key={n}
                innerClassName="p-5 bg-white dark:bg-slate-900 flex flex-col justify-between animate-pulse min-h-[360px]"
              >
                <div>
                  <div className="w-full h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3.5" />
                  <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4 mb-2.5" />
                  <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-md w-1/2" />
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-20" />
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  </div>
                </div>
              </DoubleBezel>
            ))}
          </div>
        ) : !isLoading && trips.length === 0 && !error ? (
          /* EMPTY STATE (NO TRIPS AT ALL) */
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-black/[0.05] dark:border-white/10 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600">
              <MapPin className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">No trips created yet</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              You don&apos;t have any saved itineraries in your workspace. Start by planning your first trip with our AI trip planner or build an itinerary from scratch.
            </p>
            <Link href="/trips/create" className="mt-2">
              <ButtonInButton variant="primary" size="default">
                Plan Your First Trip
              </ButtonInButton>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          /* NO MATCHING FILTER/SEARCH RESULTS */
          <div className="w-full py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-black/[0.05] dark:border-white/10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Search className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No matching trips</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              No trips matched your search {search ? `"${search}"` : ''}{' '}
              {statusFilter !== 'all' ? `with status "${statusFilter}"` : ''}.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
              className="rounded-full text-xs mt-2"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          /* TRIPS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((trip) => {
              const stopCount = getStopCount(trip);
              const daysCount = calculateDays(trip.start_date, trip.end_date);
              const dateRangeStr = formatDateRange(trip.start_date, trip.end_date);
              const budgetInfo = formatTripBudget(trip);
              const statusBadge = getStatusBadge(trip.status);
              const visBadge = getVisibilityBadge(trip.visibility);

              return (
                <DoubleBezel
                  key={trip.id}
                  innerClassName="p-5 bg-white dark:bg-slate-900 flex flex-col justify-between group h-full"
                >
                  <div>
                    {/* Media Container */}
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-3.5 bg-slate-950">
                      {trip.cover_image_url ? (
                        <Image
                          src={trip.cover_image_url}
                          alt={trip.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/60 p-4 text-center">
                          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-1 text-slate-300">
                            <Compass className="w-5 h-5" strokeWidth={1.5} />
                          </div>
                          <span className="text-[11px] font-mono tracking-tight font-medium text-slate-300">
                            {trip.destination || 'No cover photo'}
                          </span>
                        </div>
                      )}

                      {/* Legibility Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35 pointer-events-none" />

                      {/* Top Badges: Visibility & Status */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium backdrop-blur-md ${visBadge.className}`}
                        >
                          <visBadge.icon className="w-3 h-3" />
                          <span>{visBadge.label}</span>
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>

                      {/* Bottom Destination Tag */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-white text-xs font-mono drop-shadow-sm pointer-events-none">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-white/80" />
                        <span className="font-semibold truncate">
                          {trip.destination ? (
                            trip.destination
                          ) : (
                            <span className="opacity-75 italic">Destination not set</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {trip.title}
                    </h3>

                    {/* Honest Persisted Metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{dateRangeStr}</span>
                      </span>
                      {daysCount !== null && (
                        <>
                          <span>•</span>
                          <span>
                            {daysCount} {daysCount === 1 ? 'Day' : 'Days'}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {stopCount} {stopCount === 1 ? 'Stop' : 'Stops'}
                      </span>
                    </div>
                  </div>

                  {/* Footer: Budget & Actions */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Budget
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          budgetInfo.isSet
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-400 dark:text-slate-500 italic'
                        }`}
                      >
                        {budgetInfo.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/trips/${trip.id}/view`}
                        title="View read-only / shareable itinerary"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs h-8 px-3 border-black/[0.08] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>View</span>
                        </Button>
                      </Link>
                      <Link href={`/trips/${trip.id}`} title="Open private itinerary builder">
                        <Button
                          size="sm"
                          className="rounded-full text-xs h-8 px-3.5 bg-blue-600 hover:bg-blue-700 text-white gap-1 flex items-center shadow-xs"
                        >
                          <span>Builder</span>
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </DoubleBezel>
              );
            })}
          </div>
        )}

      </div>
    </AppShell>
  );
}

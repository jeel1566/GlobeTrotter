'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  Globe,
  Lock,
  Share2,
  Printer,
  ChevronLeft,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface PublicActivity {
  id: string;
  title: string;
  category: string;
  cost: number;
  duration_minutes: number;
  order_index: number;
}

interface PublicStop {
  id: string;
  city: string;
  country?: string | null;
  arrival_date?: string | null;
  departure_date?: string | null;
  order_index: number;
  activities?: PublicActivity[];
}

interface PublicTrip {
  id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  cover_image_url?: string | null;
  visibility: string;
  status: string;
  created_at: string;
  user?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
  stops?: PublicStop[];
  like_count?: number;
}

function getActivityBadgeClass(category: string): string {
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

export default function SharedItineraryViewPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<PublicTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivateOrNotFound, setIsPrivateOrNotFound] = useState(false);

  const [isCopying, setIsCopying] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const loadPublicTrip = useCallback(async () => {
    if (!tripId) return;
    setIsLoading(true);
    setError(null);
    setIsPrivateOrNotFound(false);

    try {
      const res = await fetch(`/api/public/trips/${tripId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setIsPrivateOrNotFound(true);
          throw new Error('This itinerary is private, does not exist, or has been unpublished by its owner.');
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to load public trip (${res.status})`);
      }
      const json = await res.json();
      if (json.data) {
        setTrip(json.data);
      } else {
        throw new Error('Trip data missing from server response');
      }
    } catch (err: any) {
      console.error('Failed to load public trip:', err);
      setError(err.message || 'Unable to load public itinerary');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadPublicTrip();
  }, [loadPublicTrip]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyToMyTrips = async () => {
    if (!tripId || isCopying) return;
    setIsCopying(true);
    setCopyError(null);

    try {
      const res = await fetch(`/api/community/${tripId}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 401) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to clone trip (${res.status})`);
      }

      const json = await res.json();
      if (json.data?.new_trip_id) {
        router.push(`/trips/${json.data.new_trip_id}`);
      } else {
        throw new Error('Trip cloned successfully but new ID was missing');
      }
    } catch (err: any) {
      console.error('Failed to copy trip:', err);
      setCopyError(err.message || 'Unable to copy trip to your workspace');
    } finally {
      setIsCopying(false);
    }
  };

  const stops = useMemo(() => {
    if (!trip?.stops) return [];
    return [...trip.stops].sort((a, b) => a.order_index - b.order_index);
  }, [trip?.stops]);

  const totalActivities = useMemo(() => {
    return stops.reduce((sum, s) => sum + (s.activities?.length || 0), 0);
  }, [stops]);

  const dateRangeDisplay = useMemo(() => {
    if (trip?.start_date && trip?.end_date) {
      return `${trip.start_date} → ${trip.end_date}`;
    }
    if (trip?.start_date) {
      return `Starts ${trip.start_date}`;
    }
    if (trip?.end_date) {
      return `Until ${trip.end_date}`;
    }
    return 'Dates not set';
  }, [trip?.start_date, trip?.end_date]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold uppercase tracking-wider font-mono">Loading Public Itinerary...</p>
      </div>
    );
  }

  // Not Found / Private / Error State
  if (isPrivateOrNotFound || !trip) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans">
        <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/10 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              <span>Back to My Trips</span>
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
              <Lock className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trip Private or Unavailable</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              {error || 'This itinerary is private, does not exist, or has not been published by its creator.'}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
              <Button onClick={loadPublicTrip} size="sm" variant="outline" className="rounded-full text-xs">
                Retry
              </Button>
              <Link href="/community">
                <Button size="sm" variant="outline" className="rounded-full text-xs">
                  Browse Community
                </Button>
              </Link>
              <Link href="/trips">
                <Button size="sm" className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  My Trips
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased pb-24">

      {/* Top Navigation Bar */}
      <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/10 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Back to Trips</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-full text-xs gap-1.5 border-black/[0.08] dark:border-white/10"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
              <span>Print / PDF</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="rounded-full text-xs gap-1.5 border-black/[0.08] dark:border-white/10"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleCopyToMyTrips}
              disabled={isCopying}
              className="rounded-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold"
            >
              {isCopying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopying ? 'Cloning...' : 'Copy to My Trips'}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Copy Error Alert */}
      {copyError && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{copyError}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyToMyTrips}
              className="h-7 text-xs px-2.5 text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Hero Header Presentation */}
      <header className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              <span>Public Itinerary</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">•</span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRangeDisplay}</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">•</span>
            <span className="text-xs text-slate-500 font-mono">
              {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'} • {totalActivities} {totalActivities === 1 ? 'Activity' : 'Activities'}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {trip.title}
          </h1>

          {trip.description && (
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {trip.description}
            </p>
          )}

          {/* Author Details & Stats */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-black/[0.05] dark:border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-slate-800">
                {trip.user?.avatar_url && (
                  <AvatarImage src={trip.user.avatar_url} alt={trip.user?.name || 'Traveler'} />
                )}
                <AvatarFallback className="text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {(trip.user?.name || 'Traveler').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Shared by {trip.user?.name || 'GlobeTrotter Traveler'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Published on {new Date(trip.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {trip.like_count !== undefined && trip.like_count > 0 && (
              <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {trip.like_count} {trip.like_count === 1 ? 'traveler saved this' : 'travelers saved this'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Cover Image (Real image only if present) */}
      {trip.cover_image_url ? (
        <section className="max-w-6xl mx-auto px-6 py-4">
          <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden shadow-md">
            <Image
              src={trip.cover_image_url}
              alt={trip.title}
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold truncate drop-shadow-sm">{trip.title}</h2>
            </div>
          </div>
        </section>
      ) : null}

      {/* Main Breakdown: Stops & Activities */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Stops and Scheduled Activities (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Stops &amp; Scheduled Activities
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
            </span>
          </div>

          {stops.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 text-center flex flex-col items-center gap-3">
              <Compass className="w-8 h-8 text-slate-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No stops have been added to this itinerary yet.
              </p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={stops.map((s) => `stop-${s.id}`)} className="w-full flex flex-col gap-4">
              {stops.map((stop, idx) => (
                <AccordionItem
                  key={stop.id}
                  value={`stop-${stop.id}`}
                  className="border border-black/[0.06] dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs px-5 py-1"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                          STOP {String(idx + 1).padStart(2, '0')}
                        </span>
                        {(stop.arrival_date || stop.departure_date) && (
                          <span className="text-xs text-slate-400 font-mono">
                            {stop.arrival_date}
                            {stop.departure_date && stop.departure_date !== stop.arrival_date
                              ? ` → ${stop.departure_date}`
                              : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          {stop.city}
                          {stop.country && (
                            <span className="text-slate-500 font-normal">, {stop.country}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-2 pb-5 border-t border-slate-100 dark:border-slate-800">
                    {stop.activities && stop.activities.length > 0 ? (
                      <div className="flex flex-col gap-2.5">
                        {stop.activities.map((act) => (
                          <div
                            key={act.id}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {act.title}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium border uppercase tracking-wider ${getActivityBadgeClass(
                                      act.category
                                    )}`}
                                  >
                                    {act.category}
                                  </span>
                                </div>
                                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                                  <Clock className="w-3 h-3" />
                                  <span>{act.duration_minutes} mins</span>
                                </span>
                              </div>
                            </div>

                            {act.cost > 0 ? (
                              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold shrink-0">
                                ₹{act.cost.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] shrink-0">
                                Free
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No scheduled activities for this stop.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Right Column: Actions & Trip Overview Sidebar (4 Cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Trip Overview
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This public itinerary was shared by a fellow traveler. Copy it to your own workspace to adapt and customize it for your travel plans.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Stops</span>
                <span className="font-bold text-slate-900 dark:text-white">{stops.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Activities</span>
                <span className="font-bold text-slate-900 dark:text-white">{totalActivities}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Dates</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                  {dateRangeDisplay}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <Button
                onClick={handleCopyToMyTrips}
                disabled={isCopying}
                className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-sm"
              >
                {isCopying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                <span>{isCopying ? 'Cloning to Workspace...' : 'Copy to My Trips'}</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="w-full h-9 rounded-xl text-xs gap-1.5 border-black/[0.08] dark:border-white/10"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Public Link'}</span>
              </Button>
            </div>
          </DoubleBezel>
        </aside>

      </main>

    </div>
  );
}

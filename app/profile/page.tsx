'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  MapPin,
  Compass,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TripSummary {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  visibility: string;
  cover_image_url: string | null;
  trip_stops?: Array<{ id: string; city: string; country: string | null }>;
}

const PREVIEW_COUNTRIES = [
  { name: 'Japan', code: 'JP', trips: 4, flag: '🇯🇵' },
  { name: 'Italy', code: 'IT', trips: 3, flag: '🇮🇹' },
  { name: 'France', code: 'FR', trips: 2, flag: '🇫🇷' },
  { name: 'Switzerland', code: 'CH', trips: 2, flag: '🇨🇭' },
  { name: 'India', code: 'IN', trips: 5, flag: '🇮🇳' },
  { name: 'Spain', code: 'ES', trips: 1, flag: '🇪🇸' },
  { name: 'United States', code: 'US', trips: 6, flag: '🇺🇸' },
  { name: 'Thailand', code: 'TH', trips: 2, flag: '🇹🇭' },
];

const PREVIEW_BADGES = [
  {
    title: 'Sakura Chaser',
    description: 'Tracked cherry blossom peak bloom across Tokyo, Kyoto & Osaka.',
    icon: '🌸',
    level: 'Gold Tier',
  },
  {
    title: 'Alpine Traverse',
    description: 'Conquered high-elevation hut-to-hut trails in the Dolomites.',
    icon: '🏔️',
    level: 'Silver Tier',
  },
  {
    title: 'Kissaten Connoisseur',
    description: 'Logged 15+ analog audiophile listening bars in Japan.',
    icon: '☕',
    level: 'Platinum Tier',
  },
  {
    title: 'Zero-Friction Route',
    description: 'Crafted public itineraries shared with the community.',
    icon: '⚡',
    level: 'Master Curator',
  },
];

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    async function fetchUserTrips() {
      try {
        const res = await fetch('/api/trips');
        if (res.ok) {
          const json = await res.json();
          setTrips(json.data || []);
        }
      } catch (err) {
        console.error('Failed to load trips for profile:', err);
      } finally {
        setLoadingTrips(false);
      }
    }
    fetchUserTrips();
  }, []);

  const displayName = user?.fullName || user?.firstName || 'Traveler';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const avatarUrl = user?.imageUrl || '';
  const initials =
    (user?.firstName?.[0] || 'T') + (user?.lastName?.[0] || '');
  const joinYear = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : '2025';

  // Calculate real metrics from user trips
  const totalTrips = trips.length;
  const publicTripsCount = trips.filter((t) => t.visibility === 'public').length;
  const totalStops = trips.reduce(
    (acc, t) => acc + (t.trip_stops?.length || 0),
    0
  );
  const uniqueCities = Array.from(
    new Set(
      trips.flatMap((t) => (t.trip_stops || []).map((s) => s.city.trim()))
    )
  );

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-6 max-w-[1720px] mx-auto gap-8">
        {/* PROFILE HEADER HERO */}
        <DoubleBezel innerClassName="p-6 md:p-8 bg-white dark:bg-slate-900">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Avatar & Real User Details */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-blue-500/20 shadow-xl">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="text-xl font-bold bg-blue-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[10px]">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {isLoaded ? displayName : 'Loading profile...'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Traveler
                  </span>
                  {publicTripsCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                      Published Author
                    </span>
                  )}
                </div>

                {email && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {email}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono mt-2.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {uniqueCities.length > 0
                        ? `${uniqueCities.slice(0, 2).join(', ')}${uniqueCities.length > 2 ? ` +${uniqueCities.length - 2} more` : ''}`
                        : 'No locations logged'}
                    </span>
                  </span>
                  <span>•</span>
                  <span>Member since {joinYear}</span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Link href="/trips/create">
                <Button size="sm" className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  New Trip
                </Button>
              </Link>
              <Link href="/trips">
                <Button variant="outline" size="sm" className="rounded-full text-xs border-black/[0.08]">
                  My Trips Workspace
                </Button>
              </Link>
            </div>
          </div>

          {/* REAL QUICK METRICS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Trips
              </span>
              <span className="text-xl font-bold font-mono mt-0.5 text-blue-600">
                {totalTrips}
              </span>
              <span className="text-[10px] text-slate-400">In your personal workspace</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Stops Planned
              </span>
              <span className="text-xl font-bold font-mono mt-0.5 text-teal-600">
                {totalStops}
              </span>
              <span className="text-[10px] text-slate-400">
                {uniqueCities.length} unique {uniqueCities.length === 1 ? 'city' : 'cities'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Public Guides
              </span>
              <span className="text-xl font-bold font-mono mt-0.5 text-indigo-600">
                {publicTripsCount}
              </span>
              <span className="text-[10px] text-slate-400">Shared with community</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Traveler Status
              </span>
              <span className="text-xl font-bold font-mono mt-0.5 text-amber-600">
                {totalTrips > 0 ? 'Active' : 'Explorer'}
              </span>
              <span className="text-[10px] text-slate-400">Clerk authenticated</span>
            </div>
          </div>
        </DoubleBezel>

        {/* TABS SECTION */}
        <Tabs defaultValue="expeditions" className="w-full">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
            <TabsTrigger value="expeditions" className="rounded-xl text-xs font-semibold">
              My Expeditions ({trips.length})
            </TabsTrigger>
            <TabsTrigger value="countries" className="rounded-xl text-xs font-semibold">
              Passport Stamp Preview
            </TabsTrigger>
            <TabsTrigger value="trophies" className="rounded-xl text-xs font-semibold">
              Milestone Trophies Preview
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-xl text-xs font-semibold">
              Logistics &amp; Currency
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: REAL USER EXPEDITIONS */}
          <TabsContent value="expeditions" className="flex flex-col gap-6">
            {loadingTrips ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-60 rounded-3xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : trips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {trips.map((trip) => {
                  const datesSummary =
                    trip.start_date && trip.end_date
                      ? `${new Date(trip.start_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })} – ${new Date(trip.end_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : 'Flexible dates';

                  const stopsCount = trip.trip_stops?.length || 0;

                  return (
                    <DoubleBezel
                      key={trip.id}
                      innerClassName="p-5 bg-white dark:bg-slate-900 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                          {trip.cover_image_url ? (
                            <Image
                              src={trip.cover_image_url}
                              alt={trip.title}
                              fill
                              className="object-cover"
                              unoptimized={!trip.cover_image_url.includes('images.unsplash.com')}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900">
                              <Compass className="w-8 h-8 text-blue-300 dark:text-blue-700" />
                            </div>
                          )}

                          <span
                            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-white font-mono text-[10px] font-bold uppercase tracking-wider ${
                              trip.visibility === 'public'
                                ? 'bg-teal-600'
                                : 'bg-slate-700'
                            }`}
                          >
                            {trip.visibility === 'public' ? 'Public' : 'Private'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                          {trip.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {datesSummary} • {stopsCount} {stopsCount === 1 ? 'Stop' : 'Stops'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-mono capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {trip.status}
                        </span>
                        <Link href={`/trips/${trip.id}`}>
                          <Button size="sm" className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1">
                            <span>Open Builder</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </DoubleBezel>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
                <Compass className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Expeditions Planned Yet
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Your itineraries will appear here. Start crafting your next travel adventure using our smart planning builder.
                </p>
                <Link href="/trips/create" className="mt-5">
                  <Button size="sm" className="rounded-xl text-xs bg-blue-600 text-white font-semibold">
                    Create Your First Trip
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: PASSPORT STAMP GALLERY (HONEST PREVIEW) */}
          <TabsContent value="countries">
            <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-2.5 mb-6 text-xs text-blue-900 dark:text-blue-200">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Interactive Passport Concept:</strong> Automatic country passport stamps unlock dynamically as your trips are marked completed in future updates. Below is a preview of the stamp gallery design.
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Passport Stamp Preview
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {PREVIEW_COUNTRIES.map((c) => (
                  <div
                    key={c.code}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center gap-3"
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {c.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Passport Stamp
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DoubleBezel>
          </TabsContent>

          {/* TAB 3: MILESTONES (HONEST PREVIEW) */}
          <TabsContent value="trophies">
            <div className="flex flex-col gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Milestone Trophies Concept:</strong> Achievement badges celebrate travel milestones as you build and complete multi-city routes.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PREVIEW_BADGES.map((b, idx) => (
                  <DoubleBezel key={idx} innerClassName="p-5 bg-white dark:bg-slate-900 flex items-start gap-4">
                    <div className="text-3xl p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60">
                      {b.icon}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.title}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 text-[10px] font-mono font-bold">
                          {b.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {b.description}
                      </p>
                    </div>
                  </DoubleBezel>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: PREFERENCES */}
          <TabsContent value="preferences">
            <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900 max-w-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Traveler Profile &amp; Preferences
              </h3>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Default Currency</span>
                    <span className="text-slate-500">Trip budgeting currency format.</span>
                  </div>
                  <span className="font-mono font-bold text-blue-600">USD ($)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Planning Vibe</span>
                    <span className="text-slate-500">Pacing preference for AI generated day plans.</span>
                  </div>
                  <span className="font-semibold text-teal-600">Balanced Culture &amp; Sightseeing</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Account Authentication</span>
                    <span className="text-slate-500">Identity provided securely by Clerk Auth.</span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Clerk Verified</span>
                </div>
              </div>
            </DoubleBezel>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Clock,
  Award,
  Search,
  GitFork,
  Heart,
  Bookmark,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MapPin,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { ButtonInButton } from '@/components/ui/button-in-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ApiCommunityTrip {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  created_at: string;
  owner_name: string;
  owner_avatar: string | null;
  stops: Array<{
    id: string;
    city: string;
    country: string | null;
    order_index: number;
  }>;
  like_count: number;
  is_liked: boolean;
  is_saved: boolean;
}

interface InspirationStory {
  id: string;
  title: string;
  destination: string;
  authorName: string;
  authorAvatar: string;
  duration: string;
  summary: string;
  tags: string[];
  imageUrl: string;
}

const INSPIRATION_STORIES: InspirationStory[] = [
  {
    id: 'insp-1',
    title: 'Hidden Kyoto: Quiet Temples & Secret Tea Houses',
    destination: 'Kyoto, Japan',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    duration: '5 Days • 3 Stops',
    summary: 'Skip the crowds at Kinkaku-ji. These quiet Zen sanctuaries nestled in Kitayama offer moss gardens and absolute stillness.',
    tags: ['#OffTheBeatenPath', '#Kyoto', '#SlowTravel'],
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'insp-2',
    title: 'Alta Via 1: Alpine Rifugio Traverse in the Italian Dolomites',
    destination: 'Cortina d’Ampezzo, Italy',
    authorName: 'Matteo Moretti',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    duration: '8 Days • 4 Stops',
    summary: 'A dramatic high-altitude route from Lago di Braies to Belluno, resting in rustic mountain rifugios along the crest.',
    tags: ['#Trekking', '#Dolomites', '#Backpacking'],
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'insp-3',
    title: 'Tokyo Audiophile & Analog Coffee Trail',
    destination: 'Tokyo, Japan',
    authorName: 'Kenji Takahashi',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    duration: '4 Days • 2 Stops',
    summary: 'Vacuum tube jazz kissaten in Jinbocho, analog vinyl listening rooms in Shibuya, and pour-over roasters in Tomigaya.',
    tags: ['#VinylBars', '#TokyoCafe', '#Audiophile'],
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
  },
];

export default function CommunityPage() {
  const router = useRouter();
  const [filterTab, setFilterTab] = useState<'hot' | 'new' | 'curated'>('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<ApiCommunityTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [forkingId, setForkingId] = useState<string | null>(null);
  const [forkSuccess, setForkSuccess] = useState<string | null>(null);
  const [forkError, setForkError] = useState<string | null>(null);
  const [isPublishInfoOpen, setIsPublishInfoOpen] = useState(false);

  const fetchTrips = useCallback(async (query: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = query.trim()
        ? `/api/community?search=${encodeURIComponent(query.trim())}`
        : '/api/community';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load community trips (${res.status})`);
      }
      const json = await res.json();
      setTrips(json.data || []);
    } catch (err: any) {
      console.error('Community fetch error:', err);
      setError(err.message || 'Failed to load community trips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTrips(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchTrips]);

  // Handle real fork
  const handleFork = async (trip: ApiCommunityTrip) => {
    setForkingId(trip.id);
    setForkError(null);
    try {
      const res = await fetch(`/api/community/${trip.id}/copy`, {
        method: 'POST',
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to clone trip');
      }
      const json = await res.json();
      const clonedId = json.data?.id || json.data?.new_trip_id || json.data?.trip_id;
      setTimeout(() => {
        setForkSuccess(null);
        if (clonedId && clonedId !== 'undefined') {
          router.push(`/trips/${clonedId}`);
        } else {
          router.push('/trips');
        }
      }, 1000);
    } catch (err: any) {
      setForkError(err.message || 'Failed to clone trip');
      setTimeout(() => setForkError(null), 4000);
    } finally {
      setForkingId(null);
    }
  };

  // Handle Like
  const handleToggleLike = async (trip: ApiCommunityTrip) => {
    const nextIsLiked = !trip.is_liked;
    const nextCount = Math.max(0, trip.like_count + (nextIsLiked ? 1 : -1));

    // Optimistic update
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id ? { ...t, is_liked: nextIsLiked, like_count: nextCount } : t
      )
    );

    try {
      const res = await fetch(`/api/community/${trip.id}/like`, {
        method: nextIsLiked ? 'POST' : 'DELETE',
      });
      if (!res.ok) {
        // Rollback
        setTrips((prev) =>
          prev.map((t) =>
            t.id === trip.id ? { ...t, is_liked: trip.is_liked, like_count: trip.like_count } : t
          )
        );
      }
    } catch {
      // Rollback
      setTrips((prev) =>
        prev.map((t) =>
          t.id === trip.id ? { ...t, is_liked: trip.is_liked, like_count: trip.like_count } : t
        )
      );
    }
  };

  // Handle Save
  const handleToggleSave = async (trip: ApiCommunityTrip) => {
    const nextIsSaved = !trip.is_saved;

    // Optimistic update
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, is_saved: nextIsSaved } : t))
    );

    try {
      const res = await fetch(`/api/community/${trip.id}/save`, {
        method: nextIsSaved ? 'POST' : 'DELETE',
      });
      if (!res.ok) {
        // Rollback
        setTrips((prev) =>
          prev.map((t) => (t.id === trip.id ? { ...t, is_saved: trip.is_saved } : t))
        );
      }
    } catch {
      // Rollback
      setTrips((prev) =>
        prev.map((t) => (t.id === trip.id ? { ...t, is_saved: trip.is_saved } : t))
      );
    }
  };

  // Sort displayed trips
  const displayedTrips = [...trips].sort((a, b) => {
    if (filterTab === 'hot') {
      return b.like_count - a.like_count;
    }
    // 'new'
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-6 max-w-[1720px] mx-auto gap-6">
        {/* TOP SEARCH & DOCK */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-black/[0.05] dark:border-white/10 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search public itineraries by title..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Tabs & Publish Action */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  onClick={() => setFilterTab('hot')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    filterTab === 'hot'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Popular</span>
                </button>

                <button
                  onClick={() => setFilterTab('new')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    filterTab === 'new'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Recent</span>
                </button>

                <button
                  onClick={() => setFilterTab('curated')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    filterTab === 'curated'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span>Curated Inspiration</span>
                </button>
              </div>

              <ButtonInButton
                variant="primary"
                size="sm"
                onClick={() => setIsPublishInfoOpen(true)}
                className="h-10 text-xs font-semibold"
              >
                Publish a Trip
              </ButtonInButton>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900">
              <GitFork className="w-3 h-3 text-blue-600" />
              <span>Cloneable Public Itineraries</span>
            </span>
            <span className="text-slate-400">•</span>
            <span>
              {loading ? 'Refreshing...' : `${trips.length} published ${trips.length === 1 ? 'trip' : 'trips'}`}
            </span>
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {forkSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-teal-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{forkSuccess} Redirecting to your builder workspace...</span>
            </motion.div>
          )}

          {forkError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-red-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg"
            >
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
              <span>{forkError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTrips(searchQuery)}
              className="text-xs gap-1.5 border-red-300"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                <div className="space-y-2 mt-4">
                  <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="w-1/2 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CURATED INSPIRATION TAB */}
        {filterTab === 'curated' && !loading && (
          <div className="flex flex-col gap-6">
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start sm:items-center gap-3 text-xs text-blue-900 dark:text-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Editorial Demo Inspiration:</strong> These hand-curated guides showcase recommended route structures. You can use any of these ideas to plan your own trip in the creator.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {INSPIRATION_STORIES.map((story) => (
                <DoubleBezel
                  key={story.id}
                  innerClassName="flex flex-col justify-between bg-white dark:bg-slate-900 overflow-hidden group"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={story.imageUrl}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-teal-700 shadow-xs">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>Editorial Inspiration</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>{story.duration}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm text-[11px]">
                        {story.destination}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6 ring-1 ring-black/[0.1]">
                          <AvatarImage src={story.authorAvatar} alt={story.authorName} />
                          <AvatarFallback>{story.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {story.authorName}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">
                        {story.summary}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {story.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Link href={`/trips/create?destination=${encodeURIComponent(story.destination)}`}>
                        <Button className="w-full rounded-2xl h-10 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          <span>Plan a Trip Like This</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </DoubleBezel>
              ))}
            </div>
          </div>
        )}

        {/* REAL COMMUNITY TRIPS */}
        {filterTab !== 'curated' && !loading && (
          <>
            {displayedTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedTrips.map((trip) => {
                  const stopCount = trip.stops?.length || 0;
                  const stopsSummary =
                    stopCount > 0
                      ? `${stopCount} ${stopCount === 1 ? 'stop' : 'stops'} • ${trip.stops
                          .map((s) => s.city)
                          .slice(0, 3)
                          .join(' → ')}`
                      : 'Route in planning';

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

                  return (
                    <DoubleBezel
                      key={trip.id}
                      innerClassName="flex flex-col justify-between bg-white dark:bg-slate-900 overflow-hidden group"
                    >
                      {/* Photo Banner */}
                      <Link href={`/trips/${trip.id}/view`} className="block">
                        <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                          {trip.cover_image_url ? (
                            <Image
                              src={trip.cover_image_url}
                              alt={trip.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                              unoptimized={!trip.cover_image_url.includes('images.unsplash.com')}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                              <MapPin className="w-8 h-8 text-blue-300 dark:text-blue-700" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-teal-700 dark:text-teal-400 shadow-xs">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            <span>Public Community Itinerary</span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              <span>{datesSummary}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm text-[11px]">
                              {stopCount} {stopCount === 1 ? 'Stop' : 'Stops'}
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-6 h-6 ring-1 ring-black/[0.1]">
                              {trip.owner_avatar && (
                                <AvatarImage src={trip.owner_avatar} alt={trip.owner_name} />
                              )}
                              <AvatarFallback className="text-[10px]">
                                {trip.owner_name[0]?.toUpperCase() || 'T'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                              {trip.owner_name}
                            </span>
                          </div>

                          <Link href={`/trips/${trip.id}/view`}>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                              {trip.title}
                            </h3>
                          </Link>

                          {trip.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                              {trip.description}
                            </p>
                          )}

                          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{stopsSummary}</span>
                          </div>
                        </div>

                        {/* Social Stats & Fork Action */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                            <button
                              onClick={() => handleToggleLike(trip)}
                              className={`flex items-center gap-1 transition-colors ${
                                trip.is_liked
                                  ? 'text-red-600 font-bold'
                                  : 'hover:text-red-600 text-slate-500'
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${trip.is_liked ? 'fill-red-600' : ''}`}
                              />
                              <span>{trip.like_count}</span>
                            </button>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleSave(trip)}
                                className={`transition-colors ${
                                  trip.is_saved
                                    ? 'text-blue-600'
                                    : 'hover:text-blue-600 text-slate-400'
                                }`}
                                title={trip.is_saved ? 'Saved' : 'Save guide'}
                              >
                                <Bookmark
                                  className={`w-4 h-4 ${trip.is_saved ? 'fill-blue-600' : ''}`}
                                />
                              </button>
                              <Link
                                href={`/trips/${trip.id}/view`}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-sans"
                              >
                                <span>Inspect</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleFork(trip)}
                            disabled={forkingId === trip.id}
                            className="w-full rounded-2xl h-10 text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white border border-blue-200 dark:border-blue-800 transition-all duration-300 gap-2"
                          >
                            <GitFork className="w-3.5 h-3.5" />
                            <span>
                              {forkingId === trip.id
                                ? 'Cloning Itinerary...'
                                : 'Fork Itinerary (Clone into your trips)'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </DoubleBezel>
                  );
                })}
              </div>
            ) : (
              /* Honest Empty State when 0 public trips found */
              <div className="flex flex-col gap-8">
                <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-black/[0.05] dark:border-white/10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 mb-4">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {searchQuery.trim()
                      ? `No public itineraries matching "${searchQuery}"`
                      : 'No public community itineraries yet'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
                    {searchQuery.trim()
                      ? 'Try another search term or clear the search box to view all public journeys.'
                      : 'Published trips from travelers appear here. Open any of your trips in the builder and toggle the Public visibility switch to share your route!'}
                  </p>
                  <div className="flex items-center gap-3 mt-6">
                    <Link href="/trips/create">
                      <Button size="sm" className="rounded-xl text-xs bg-blue-600 text-white font-semibold">
                        Create a Trip
                      </Button>
                    </Link>
                    <Link href="/trips">
                      <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                        View My Trips
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Inspiration Section Shown When Empty */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Curated Editorial Inspiration
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Sample Guides
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {INSPIRATION_STORIES.map((story) => (
                      <DoubleBezel
                        key={story.id}
                        innerClassName="flex flex-col justify-between bg-white dark:bg-slate-900 overflow-hidden group"
                      >
                        <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <Image
                            src={story.imageUrl}
                            alt={story.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-[10px] font-bold text-slate-700">
                            <span>Demo Inspiration</span>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
                            <span>{story.duration}</span>
                            <span>{story.destination}</span>
                          </div>
                        </div>

                        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                          <div>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                              {story.title}
                            </h5>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {story.summary}
                            </p>
                          </div>
                          <Link href={`/trips/create?destination=${encodeURIComponent(story.destination)}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full rounded-xl text-xs gap-1.5 mt-2"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>Plan a Similar Trip</span>
                            </Button>
                          </Link>
                        </div>
                      </DoubleBezel>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* DIALOG: HOW TO PUBLISH */}
        <Dialog open={isPublishInfoOpen} onOpenChange={setIsPublishInfoOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                How to Publish a Trip
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Share your journey with fellow travelers in the GlobeTrotter community.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-900 dark:text-blue-200 block mb-0.5">
                    1. Open Your Trip in the Builder
                  </strong>
                  Navigate to any existing trip from your <strong>My Trips</strong> workspace.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-900 dark:text-blue-200 block mb-0.5">
                    2. Toggle Visibility to Public
                  </strong>
                  In the top-right header of the Itinerary Builder, click the visibility button to switch from <strong>Private Draft</strong> to <strong>Public</strong>.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-900 dark:text-blue-200 block mb-0.5">
                    3. Protected Privacy
                  </strong>
                  Only your destination, stops, activity titles, and timing are shared publicly. Your private activity notes and budget totals are automatically stripped.
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Link href="/trips" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  Go to My Trips
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

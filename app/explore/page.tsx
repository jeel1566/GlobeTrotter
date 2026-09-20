'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Sparkles,
  Star,
  PlusCircle,
  CheckCircle2,
  Search,
  Loader2,
  Compass,
  Flame,
  MessageSquare,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { MapWrapper } from '@/components/map/map-wrapper';
import { AddSpotModal } from '@/components/explore/add-spot-modal';
import { TrendySpot, CityCenterInfo } from '@/app/api/places/trendy/route';

const QUICK_AREAS = [
  { label: 'Ahmedabad (Riverfront & SBR)', query: 'ahmedabad' },
  { label: 'Shibuya, Tokyo', query: 'shibuya' },
  { label: 'Kyoto (Temples & Shrines)', query: 'kyoto' },
  { label: 'Paris (Latin Quarter & Eiffel)', query: 'paris' },
];

const BUZZ_FILTERS = [
  { id: 'all', label: 'All Spots' },
  { id: 'instagram', label: '🔥 Viral on Instagram', icon: Flame },
  { id: 'reddit', label: '💬 Reddit Recommended', icon: MessageSquare },
  { id: 'food', label: '☕ Cafes & Dining' },
  { id: 'culture', label: '🏛️ Heritage & Sights' },
  { id: 'nature', label: '🌿 Scenic & Nature' },
];

export default function ExplorePage() {
  const [searchInput, setSearchInput] = useState('Ahmedabad');
  const [activeAreaQuery, setActiveAreaQuery] = useState('ahmedabad');
  const [activeFilter, setActiveFilter] = useState('all');

  // Map & Spots state
  const [cityCenter, setCityCenter] = useState<CityCenterInfo>({
    name: 'Ahmedabad',
    country: 'India',
    latitude: 23.0304,
    longitude: 72.5450,
    zoom: 13,
  });
  const [spots, setSpots] = useState<TrendySpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<TrendySpot | null>(null);

  // UI Dialog states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [spotToAddToTrip, setSpotToAddToTrip] = useState<TrendySpot | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<{ spot: string; trip: string } | null>(null);

  // Fetch trendy places for query area
  const fetchAreaSpots = useCallback(async (query: string) => {
    setIsLoading(true);
    setSelectedSpot(null);
    try {
      const res = await fetch(`/api/places/trendy?city=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.city) {
          setCityCenter(json.city);
        }
        const fetchedSpots: TrendySpot[] = json.spots || [];
        setSpots(fetchedSpots);
        if (fetchedSpots.length > 0) {
          setSelectedSpot(fetchedSpots[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load area spots:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreaSpots(activeAreaQuery);
  }, [activeAreaQuery, fetchAreaSpots]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setActiveAreaQuery(searchInput.trim());
  };

  const handleQuickAreaSelect = (areaQuery: string, label: string) => {
    setSearchInput(label.split(' (')[0]);
    setActiveAreaQuery(areaQuery);
  };

  const handleOpenAddToTrip = (spot: TrendySpot) => {
    setSpotToAddToTrip(spot);
    setIsAddModalOpen(true);
  };

  const handleAddSuccess = (spotName: string, tripTitle: string) => {
    setAddedToast({ spot: spotName, trip: tripTitle });
    setTimeout(() => setAddedToast(null), 5000);
  };

  // Filter spots by category or social platform
  const filteredSpots = spots.filter((s) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'instagram') return s.socialBuzz?.platform === 'instagram' || s.socialBuzz?.badge.includes('Instagram');
    if (activeFilter === 'reddit') return s.socialBuzz?.platform === 'reddit' || s.socialBuzz?.badge.includes('Reddit');
    if (activeFilter === 'food') return s.category === 'food';
    if (activeFilter === 'culture') return s.category === 'culture';
    if (activeFilter === 'nature') return s.category === 'nature';
    return true;
  });

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">

        {/* STICKY DISCOVERY DOCK */}
        <section className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/10 shadow-xs">
          <div className="max-w-[1720px] mx-auto px-4 md:px-6 py-3 flex flex-col gap-2.5">

            {/* Area Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-2xl px-4 py-2.5 border border-black/[0.04] dark:border-white/5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <MapPin className="w-4 h-4 text-blue-600 mr-2.5 shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Select or Search Area / Neighborhood
                  </span>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="e.g. Ahmedabad, Shibuya, Tokyo, Paris..."
                    className="bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none truncate"
                  />
                </div>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl px-5 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-xs shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Explore Area</span>
              </Button>
            </form>

            {/* Quick Area Presets & Social Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
              {/* Preset buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 hidden lg:inline">
                  Featured:
                </span>
                {QUICK_AREAS.map((area) => (
                  <button
                    key={area.query}
                    onClick={() => handleQuickAreaSelect(area.query, area.label)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      activeAreaQuery === area.query
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {area.label}
                  </button>
                ))}
              </div>

              {/* Buzz Radar Filters */}
              <div className="flex items-center gap-1.5 shrink-0">
                {BUZZ_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      activeFilter === f.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* SUCCESS TOAST */}
        <AnimatePresence>
          {addedToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-3 shadow-2xl border border-emerald-500"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <div>
                <p>Added &ldquo;{addedToast.spot}&rdquo; to {addedToast.trip}!</p>
                <p className="text-[10px] text-emerald-200 font-normal">Activity saved directly into your itinerary stop.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN VIEWPORT: Left Spot List (48%) & Right Real Leaflet Map (52%) */}
        <div className="flex flex-col lg:flex-row w-full max-w-[1720px] mx-auto flex-1 p-4 md:p-6 gap-6">

          {/* LEFT COLUMN: Spots & Social Buzz Feed */}
          <div className="w-full lg:w-[48%] flex flex-col gap-4 lg:h-[calc(100vh-170px)] lg:overflow-y-auto pr-1">

            {/* Header with City Meta */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Real-Life Map &amp; Social Buzz Radar</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                  {cityCenter.name}, {cityCenter.country}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {filteredSpots.length} {filteredSpots.length === 1 ? 'place' : 'places'} found
              </span>
            </div>

            {/* Area Overview Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={1.5} />
                <span>
                  Showing trending spots in <strong>{cityCenter.name}</strong> aggregated from Reddit, Instagram reels, and web guides. Click any pin or card to add directly to your trip!
                </span>
              </div>
            </div>

            {/* Spot Cards */}
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs font-semibold">Discovering trending places in {cityCenter.name}...</span>
              </div>
            ) : filteredSpots.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Compass className="w-8 h-8 text-slate-400 mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No spots found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Try switching your category filter or search another city above.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredSpots.map((spot) => (
                  <DoubleBezel
                    key={spot.id}
                    glow={selectedSpot?.id === spot.id}
                    innerClassName="p-4 bg-white dark:bg-slate-900 cursor-pointer transition-all hover:border-blue-400"
                    onClick={() => setSelectedSpot(spot)}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Spot Image */}
                      <div className="relative w-full sm:w-44 h-36 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <Image
                          src={spot.imageUrl}
                          alt={spot.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 180px"
                        />
                        {spot.isTopPick && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-teal-800 flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Top Pick</span>
                          </span>
                        )}
                      </div>

                      {/* Details & Social Buzz */}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {spot.tag}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>{spot.rating}</span>
                              <span className="text-slate-400 font-normal">({spot.reviewsCount})</span>
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-1 group-hover:text-blue-600 transition-colors">
                            {spot.name}
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {spot.description}
                          </p>

                          {/* Social Buzz Badge */}
                          {spot.socialBuzz && (
                            <div className="mt-2 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300">
                              <span className="font-bold">{spot.socialBuzz.badge}</span>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 italic line-clamp-1">
                                {spot.socialBuzz.quote}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Cost & Actions */}
                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                            {spot.cost}
                          </span>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSpot(spot);
                                setIsSheetOpen(true);
                              }}
                              className="rounded-full h-8 px-3 text-xs border-black/[0.08]"
                            >
                              Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddToTrip(spot);
                              }}
                              className="rounded-full h-8 px-3.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5 font-semibold"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Add to Trip</span>
                            </Button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </DoubleBezel>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Real Interactive Leaflet Map */}
          <div className="w-full lg:w-[52%] flex flex-col h-[520px] lg:h-[calc(100vh-170px)] sticky top-28">
            <MapWrapper
              center={cityCenter}
              spots={filteredSpots}
              selectedSpot={selectedSpot}
              onSelectSpot={(spot) => setSelectedSpot(spot)}
              onAddToTrip={(spot) => handleOpenAddToTrip(spot)}
            />
          </div>

        </div>

        {/* SPOT DETAILS DRAWER SHEET */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="sm:max-w-[500px] overflow-y-auto p-6 bg-white dark:bg-slate-900">
            {selectedSpot && (
              <div className="flex flex-col gap-4">
                <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-slate-100">
                  <Image
                    src={selectedSpot.imageUrl}
                    alt={selectedSpot.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-teal-800">
                    {selectedSpot.tag}
                  </span>
                </div>

                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {selectedSpot.name}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-500 mt-1">
                    {selectedSpot.location} • Lat: {selectedSpot.latitude.toFixed(4)}, Lng: {selectedSpot.longitude.toFixed(4)}
                  </SheetDescription>
                </div>

                {/* Social Proof Quote Box */}
                {selectedSpot.socialBuzz && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold flex items-center gap-1">
                      <span>{selectedSpot.socialBuzz.badge}</span>
                    </span>
                    <p className="mt-1 italic leading-relaxed text-slate-700 dark:text-slate-300">
                      &ldquo;{selectedSpot.socialBuzz.quote}&rdquo;
                    </p>
                  </div>
                )}

                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                  <p>{selectedSpot.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Cost</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                      {selectedSpot.cost}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Typical Duration</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                      {selectedSpot.durationMinutes} minutes
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <Button
                    onClick={() => {
                      setIsSheetOpen(false);
                      handleOpenAddToTrip(selectedSpot);
                    }}
                    className="flex-1 rounded-full h-10 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add to Itinerary</span>
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* ADD SPOT ACTION MODAL */}
        <AddSpotModal
          spot={spotToAddToTrip}
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSpotToAddToTrip(null);
          }}
          onSuccess={handleAddSuccess}
        />

      </div>
    </AppShell>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Sparkles,
  Star,
  PlusCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { ButtonInButton } from '@/components/ui/button-in-button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface Spot {
  id: string;
  name: string;
  category: string;
  tag: string;
  rating: number;
  reviewsCount: number;
  cost: string;
  description: string;
  location: string;
  imageUrl: string;
  coords: { x: number; y: number }; // percentage on map
  pinColor: string;
  isTopPick?: boolean;
}

const CURATED_SPOTS: Spot[] = [
  {
    id: 'spot-1',
    name: 'Fushimi Inari Taisha',
    category: 'Attractions',
    tag: 'Shinto Shrine',
    rating: 4.9,
    reviewsCount: 14200,
    cost: 'Free Entry',
    description: 'Vibrant vermilion red Torii gates winding through a serene dense cedar mountain forest in Kyoto during misty dawn.',
    location: 'Fushimi-ku, Kyoto',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
    coords: { x: 62, y: 72 },
    pinColor: '#14B8A6',
    isTopPick: true,
  },
  {
    id: 'spot-2',
    name: 'Kinkaku-ji (The Golden Pavilion)',
    category: 'Attractions',
    tag: 'Zen Buddhist Temple',
    rating: 4.8,
    reviewsCount: 9800,
    cost: '¥500 (~$3.30)',
    description: 'Two top floors covered entirely in pure gold leaf, reflecting majestically across the mirror pond Kyoko-chi.',
    location: 'Kita-ku, Kyoto',
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&auto=format&fit=crop&q=80',
    coords: { x: 38, y: 22 },
    pinColor: '#2563EB',
  },
  {
    id: 'spot-3',
    name: 'Monk Kaiseki Restaurant',
    category: 'Top Restaurants',
    tag: 'Farm-to-Table Dining',
    rating: 5.0,
    reviewsCount: 680,
    cost: '$120 tasting menu',
    description: 'A 7-course seasonal tasting menu centered around an open wood-fired oven and hyper-local foraged herbs from Ohara farms.',
    location: "Philosopher's Path, Sakyo-ku",
    imageUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600&auto=format&fit=crop&q=80',
    coords: { x: 74, y: 38 },
    pinColor: '#F97316',
    isTopPick: true,
  },
  {
    id: 'spot-4',
    name: 'The Celestine Boutique Ryokan',
    category: 'Boutique Stays',
    tag: 'Heritage Machiya',
    rating: 4.9,
    reviewsCount: 420,
    cost: '$240 / night',
    description: 'Sleek contemporary wooden design blending traditional tatami tea pavilions with modern deep soaking onsen tubs.',
    location: 'Higashiyama, Kyoto',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    coords: { x: 55, y: 52 },
    pinColor: '#2563EB',
  },
  {
    id: 'spot-5',
    name: 'Otagi Nenbutsu-ji Secret Temple',
    category: 'Hidden Gems',
    tag: '1,200 Stone Rakan',
    rating: 4.9,
    reviewsCount: 890,
    cost: '¥300 (~$2.00)',
    description: 'Nestled far up in Arashiyama, covered in emerald moss with 1,200 whimsical stone statues carved by devoted sculptors.',
    location: 'Saga Toriimoto, Arashiyama',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    coords: { x: 20, y: 44 },
    pinColor: '#14B8A6',
  },
];

export default function ExplorePage() {
  const [destination, setDestination] = useState('Kyoto, Japan');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(CURATED_SPOTS[0]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState<string | null>(null);

  const filteredSpots =
    activeCategory === 'All'
      ? CURATED_SPOTS
      : CURATED_SPOTS.filter((s) => s.category === activeCategory);

  const handleAddSpot = (spotName: string) => {
    setAddedSuccess(spotName);
    setTimeout(() => setAddedSuccess(null), 2500);
  };

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
        
        {/* INTERACTIVE STICKY FILTER & SEARCH DOCK (Stitch v2 Section 6) */}
        <section className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/10 shadow-xs">
          <div className="max-w-[1720px] mx-auto px-6 py-3 flex flex-col gap-3">
            
            {/* Primary Search Inputs Dock */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-black/[0.04] dark:border-white/5">
              
              {/* Destination auto-suggest input */}
              <div className="flex-1 min-w-[220px] flex items-center bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2 shadow-xs group">
                <MapPin className="w-4 h-4 text-blue-600 mr-2.5 shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Destination
                  </span>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none truncate"
                  />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-teal-500" strokeWidth={1.5} />
              </div>

              {/* Date Range Picker Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex-1 min-w-[200px] flex items-center bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2 shadow-xs text-left">
                    <CalendarIcon className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" strokeWidth={1.5} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Dates
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        May 14 – May 21, 2025
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 font-bold">
                      7n
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                  <Calendar mode="single" className="rounded-2xl border-none" />
                </PopoverContent>
              </Popover>

              {/* Traveler Count */}
              <div className="flex-1 min-w-[160px] flex items-center bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2 shadow-xs">
                <Users className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Travelers
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    2 Guests (1 Room)
                  </span>
                </div>
              </div>

              {/* Action Trigger */}
              <ButtonInButton
                variant="primary"
                size="sm"
                className="shrink-0 h-11"
              >
                Explore Spots
              </ButtonInButton>
            </div>

            {/* Categories & Precision Filter Pills */}
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-1.5 shrink-0">
                {['All', 'Attractions', 'Top Restaurants', 'Boutique Stays', 'Hidden Gems'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                      activeCategory === cat
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0 text-xs font-medium">
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Rating 4.8+</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-mono">
                  Under $100
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* MAIN VIEWPORT: Curated Feed (Left) & Interactive Map Canvas (Right) */}
        <div className="flex flex-col lg:flex-row w-full max-w-[1720px] mx-auto flex-1">
          
          {/* LEFT COLUMN: Curated Feed (w-full lg:w-[48%]) */}
          <div className="w-full lg:w-[48%] p-6 flex flex-col gap-5 lg:h-[calc(100vh-140px)] lg:overflow-y-auto">
            
            {/* Meta header & Quick route advice */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-teal-600 font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span>Live Availability</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                  142 Curated Spots in {destination}
                </h2>
              </div>
            </div>

            {/* Quick AI Tip Card */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" strokeWidth={1.5} />
                <span>
                  <strong className="text-teal-900 dark:text-teal-200">Pro Route Tip:</strong> Morning visits in Eastern Kyoto minimize crowd friction by 68%.
                </span>
              </div>
            </div>

            {/* Success toast notification */}
            <AnimatePresence>
              {addedSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-2xl bg-blue-600 text-white text-xs font-semibold flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Added &quot;{addedSuccess}&quot; to your active trip itinerary!</span>
                  </div>
                  <Link href="/trips/demo" className="underline text-blue-100 hover:text-white">
                    View
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Curated Spot Cards */}
            <div className="flex flex-col gap-4">
              {filteredSpots.map((spot) => (
                <DoubleBezel
                  key={spot.id}
                  glow={selectedSpot?.id === spot.id}
                  innerClassName="p-4 bg-white dark:bg-slate-900 cursor-pointer"
                  onClick={() => setSelectedSpot(spot)}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-48 h-40 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={spot.imageUrl}
                        alt={spot.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {spot.isTopPick && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-teal-700 flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3" />
                          <span>Top Pick</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {spot.tag}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
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
                      </div>

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
                              handleAddSpot(spot.name);
                            }}
                            className="rounded-full h-8 px-3.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5"
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

          </div>

          {/* RIGHT COLUMN: Interactive Vector Map Canvas (flex-1) */}
          <div className="flex-1 relative w-full lg:h-[calc(100vh-140px)] min-h-[500px] overflow-hidden bg-[#E5E9EC] dark:bg-slate-950 border-l border-black/[0.05] dark:border-white/10">
            
            {/* Vector Map Simulation Graphic with Kyoto River & Machiya Grid */}
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1000 850"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="kamoRiverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bfdbfe" />
                  <stop offset="100%" stopColor="#93c5fd" />
                </linearGradient>
              </defs>

              {/* Landmass background */}
              <rect width="1000" height="850" fill="#F4F6F9" />

              {/* Natural mountain & temple green zones */}
              <path d="M 680 50 Q 820 180 880 420 Q 940 700 860 850 L 1000 850 L 1000 0 L 680 0 Z" fill="#D6E8D8" opacity="0.6" />
              <path d="M 0 0 L 220 0 Q 200 240 120 480 Q 80 620 0 740 Z" fill="#D6E8D8" opacity="0.5" />
              <rect x="380" y="80" width="180" height="140" rx="16" fill="#C8E6C9" opacity="0.45" />
              <text x="400" y="160" fill="#2E7D32" fontSize="11" fontFamily="sans-serif" fontWeight="700" opacity="0.7">
                KYOTO IMPERIAL PALACE
              </text>

              {/* Machiya City Grid Lines */}
              <g stroke="#E2E8F0" strokeWidth="1.5">
                <line x1="150" y1="0" x2="150" y2="850" />
                <line x1="280" y1="0" x2="280" y2="850" />
                <line x1="420" y1="0" x2="420" y2="850" stroke="#CBD5E1" strokeWidth="2.5" />
                <line x1="560" y1="0" x2="560" y2="850" />
                <line x1="700" y1="0" x2="700" y2="850" stroke="#CBD5E1" strokeWidth="2.5" />
                <line x1="840" y1="0" x2="840" y2="850" />
                <line x1="0" y1="120" x2="1000" y2="120" />
                <line x1="0" y1="240" x2="1000" y2="240" stroke="#CBD5E1" strokeWidth="2.5" />
                <line x1="0" y1="360" x2="1000" y2="360" />
                <line x1="0" y1="480" x2="1000" y2="480" stroke="#CBD5E1" strokeWidth="2.5" />
                <line x1="0" y1="600" x2="1000" y2="600" />
                <line x1="0" y1="720" x2="1000" y2="720" stroke="#CBD5E1" strokeWidth="2.5" />
              </g>

              {/* Kamo River Route */}
              <path
                d="M 640 0 Q 610 200 580 340 T 540 580 T 510 850"
                fill="none"
                stroke="url(#kamoRiverGrad)"
                strokeWidth="32"
                strokeLinecap="round"
              />
              <path
                d="M 640 0 Q 610 200 580 340 T 540 580 T 510 850"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeDasharray="8 8"
                opacity="0.6"
              />
              <text
                x="590"
                y="240"
                fill="#3B82F6"
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight="700"
                letterSpacing="2"
                transform="rotate(76, 590, 240)"
              >
                KAMO RIVER
              </text>

              {/* Transit line connecting spots */}
              <path
                d="M 550 440 Q 580 520 620 610"
                fill="none"
                stroke="#2563EB"
                strokeWidth="4"
                strokeDasharray="6 6"
                className="animate-pulse"
              />
            </svg>

            {/* Interactive Anchored Map Pins */}
            {filteredSpots.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  style={{ left: `${spot.coords.x}%`, top: `${spot.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg font-mono text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110'
                        : 'bg-white text-slate-800 dark:bg-slate-900 dark:text-white ring-1 ring-black/[0.1]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{spot.name.split(' ')[0]}</span>
                  </motion.div>
                </div>
              );
            })}

            {/* Selected Spot Floating Quick Card in corner of map */}
            {selectedSpot && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 z-30 p-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/10 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">
                      {selectedSpot.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedSpot.name}
                    </h4>
                    <span className="text-xs font-mono text-slate-500">{selectedSpot.cost}</span>
                  </div>
                  <button
                    onClick={() => setSelectedSpot(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    onClick={() => handleAddSpot(selectedSpot.name)}
                    className="flex-1 rounded-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add to Itinerary</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSheetOpen(true)}
                    className="rounded-full h-8 px-3 text-xs"
                  >
                    Details
                  </Button>
                </div>
              </motion.div>
            )}

          </div>

        </div>

        {/* SHEET DRAWER: SPOT DETAILS */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="sm:max-w-[480px] p-6 bg-white dark:bg-slate-900">
            {selectedSpot && (
              <div className="flex flex-col gap-4 mt-4">
                <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-sm">
                  <Image
                    src={selectedSpot.imageUrl}
                    alt={selectedSpot.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                    {selectedSpot.category}
                  </span>
                  <SheetTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                    {selectedSpot.name}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-500">
                    {selectedSpot.location}
                  </SheetDescription>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedSpot.description}
                </p>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs font-mono">
                  <span>Entry / Price:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedSpot.cost}</span>
                </div>

                <Button
                  onClick={() => {
                    handleAddSpot(selectedSpot.name);
                    setIsSheetOpen(false);
                  }}
                  className="w-full rounded-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 mt-4"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Insert into Itinerary</span>
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>

      </div>
    </AppShell>
  );
}

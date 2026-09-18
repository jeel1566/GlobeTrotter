'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Plus,
  Share2,
  Download,
  CheckCircle2,
  ChevronRight,
  Train,
  Footprints,
  Info,
  GripVertical,
  Wallet,
  Sun,
  Cloud,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trip } from '@/types/database';

interface ItineraryItem {
  id: string;
  time: string;
  period: 'AM' | 'PM';
  title: string;
  category: 'Dining' | 'Cultural' | 'Foodie' | 'Exploration' | 'Sightseeing' | 'Nightlife';
  status: string;
  statusType: 'confirmed' | 'qr' | 'sunset' | 'standard';
  cost: string;
  location: string;
  duration: string;
  description: string;
  notes?: string[];
  imageUrl?: string;
  hasAudioGuide?: boolean;
  transitBefore?: {
    type: 'subway' | 'walk' | 'train';
    text: string;
  };
}

const DEFAULT_DAYS = [
  { dayNumber: 1, date: 'May 14', title: 'Arrival & Shinjuku Neon Night', temp: '22°C', weather: 'sunny', activitiesCount: 3, cost: '¥12,400' },
  { dayNumber: 2, date: 'May 15', title: 'Meiji Shrine, Harajuku & Shibuya', temp: '20°C', weather: 'cloudy', activitiesCount: 4, cost: '¥18,500' },
  { dayNumber: 3, date: 'May 16', title: 'Asakusa, Akihabara & Shibuya Sky', temp: '18°C', weather: 'sunset', activitiesCount: 5, cost: '¥24,800' },
  { dayNumber: 4, date: 'May 17', title: 'Bullet Train to Kyoto & Gion Dusk', temp: '24°C', weather: 'sunny', activitiesCount: 3, cost: '¥31,000' },
  { dayNumber: 5, date: 'May 18', title: 'Fushimi Inari Gates at Dawn', temp: '21°C', weather: 'cloudy', activitiesCount: 4, cost: '¥14,200' },
  { dayNumber: 6, date: 'May 19', title: 'Arashiyama Bamboo & Monkey Park', temp: '23°C', weather: 'sunny', activitiesCount: 3, cost: '¥19,100' },
  { dayNumber: 7, date: 'May 20', title: 'Nishiki Market & KIX Departure', temp: '19°C', weather: 'cloudy', activitiesCount: 3, cost: '¥27,800' },
];

const DEFAULT_ITEMS: ItineraryItem[] = [
  {
    id: 'act-1',
    time: '09:00',
    period: 'AM',
    title: 'Breakfast at Fuglen Tokyo',
    category: 'Dining',
    status: 'Confirmed',
    statusType: 'confirmed',
    cost: '¥1,600 pp',
    location: 'Tomigaya 1-16-11, Shibuya',
    duration: '15 min walk from hotel',
    description: 'Iconic vintage Scandinavian cafe in Tomigaya. Light roast pour-over espresso paired with authentic heart-shaped Norwegian cardamom waffles.',
  },
  {
    id: 'act-2',
    time: '10:30',
    period: 'AM',
    title: 'Sensō-ji Temple & Nakamise-dori',
    category: 'Cultural',
    status: 'Audio QR Ready',
    statusType: 'qr',
    cost: 'Free Entry',
    location: 'Asakusa 2-3-1, Taito',
    duration: '2h scheduled',
    description: "Tokyo's oldest Buddhist temple founded in 645 AD. Enter through Kaminarimon (Thunder Gate) and browse traditional melon-pan bakeries along Nakamise street.",
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&auto=format&fit=crop&q=80',
    hasAudioGuide: true,
    transitBefore: {
      type: 'subway',
      text: 'Chiyoda Line to Ginza Line • 24 min • ¥210 IC card',
    },
  },
  {
    id: 'act-3',
    time: '01:00',
    period: 'PM',
    title: 'Wagyu Tsukemen at Menya Musashi',
    category: 'Foodie',
    status: 'Confirmed',
    statusType: 'confirmed',
    cost: '¥1,800 (~$12)',
    location: 'Shinjuku 7-2-6, Tokyo',
    duration: '1h reserved',
    description: 'Rich, double-soup pork & dried fish broth served with thick artisanal chewy noodles and charred thick-cut wagyu chashu slices. Ticket vending machine order at entrance.',
  },
  {
    id: 'act-4',
    time: '02:30',
    period: 'PM',
    title: 'Akihabara Electric Town & Retro Arcades',
    category: 'Exploration',
    status: '3h reserved',
    statusType: 'standard',
    cost: '¥3,000 allowance',
    location: 'Sotokanda, Chiyoda City',
    duration: '3h reserved',
    description: 'Explore multi-floor retro video game holy grail Super Potato, Mandarake Complex, and GiGO Akihabara arcade center. Note: Keep passport handy for 10% tax-free purchases.',
    notes: ['Super Potato 5F Retro Lounge', 'Radio Kaikan 2F'],
    transitBefore: {
      type: 'train',
      text: 'JR Yamanote Line to Akihabara Station • 14 min • ¥160',
    },
  },
  {
    id: 'act-5',
    time: '05:30',
    period: 'PM',
    title: 'Shibuya Sky Observation Deck',
    category: 'Sightseeing',
    status: 'Sunset Slot 18:15',
    statusType: 'sunset',
    cost: '¥2,500 pp',
    location: 'Shibuya Scramble Square 47F, Tokyo',
    duration: 'Strict 18:00 – 18:20 window',
    description: '360-degree open-air rooftop observation deck 229 meters above Shibuya Crossing. Strict timed ticket entry window between 18:00 – 18:20 for golden hour & twilight transition over Mt. Fuji.',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    transitBefore: {
      type: 'subway',
      text: 'Ginza Line Express to Shibuya Station • 18 min • ¥200',
    },
  },
  {
    id: 'act-6',
    time: '08:30',
    period: 'PM',
    title: 'Izakaya Crawl in Omoide Yokocho',
    category: 'Nightlife',
    status: 'Local Guide Kenji',
    statusType: 'standard',
    cost: '¥4,500 pp',
    location: 'Nishishinjuku 1-2, Tokyo',
    duration: 'Evening tour',
    description: 'Atmospheric alleyways packed with miniature 6-seat yakitori bars grilling chicken skewers over binchotan charcoal. Meet Kenji at Shinjuku West Gate under the big clock.',
    notes: ['Cash-only recommended', 'Tsukune with raw egg yolk'],
    transitBefore: {
      type: 'walk',
      text: 'Walk across Shibuya Scramble → JR Yamanote to Shinjuku • 12 min',
    },
  },
];

export default function ItineraryBuilderPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedDay, setSelectedDay] = useState(3);
  const [items, setItems] = useState<ItineraryItem[]>(DEFAULT_ITEMS);
  const [selectedItem, setSelectedItem] = useState<ItineraryItem>(DEFAULT_ITEMS[4]); // Shibuya Sky active by default
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isCopilotDismissed, setIsCopilotDismissed] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Dining' | 'Cultural' | 'Sightseeing' | 'Foodie' | 'Exploration' | 'Nightlife'>('Sightseeing');
  const [newTime, setNewTime] = useState('14:00');
  const [newCost, setNewCost] = useState('¥2,000');
  const [newDesc, setNewDesc] = useState('');

  // Load trip from DB if exists
  useEffect(() => {
    async function loadTrip() {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setTrip(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to load trip', err);
      }
    }
    if (tripId && tripId !== 'demo') {
      loadTrip();
    }
  }, [tripId]);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ItineraryItem = {
      id: `act-${Date.now()}`,
      time: newTime,
      period: parseInt(newTime.split(':')[0]) >= 12 ? 'PM' : 'AM',
      title: newTitle,
      category: newCategory,
      status: 'Custom Added',
      statusType: 'standard',
      cost: newCost,
      location: trip?.destination || 'Tokyo, Japan',
      duration: '1.5h scheduled',
      description: newDesc || 'Custom scheduled stop added via workspace builder.',
    };

    setItems([...items, newItem]);
    setSelectedItem(newItem);
    setIsAddActivityOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleAutoOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      // Reorder items by time logic
      const sorted = [...items].sort((a, b) => {
        const toMinutes = (timeStr: string, period: string) => {
          const [h, m] = timeStr.split(':').map(Number);
          const hour24 = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h;
          return hour24 * 60 + m;
        };
        return toMinutes(a.time, a.period) - toMinutes(b.time, b.period);
      });
      setItems(sorted);
      setIsOptimizing(false);
      setIsOptimizeOpen(false);
    }, 1200);
  };

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
        
        {/* TOP COMMAND BAR & META HEADER (Stitch v2 Section 1) */}
        <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/10 px-6 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] sticky top-0 z-30">
          <div className="max-w-[1720px] mx-auto flex flex-col gap-3">
            
            {/* Breadcrumb & Collaborator Cluster */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Link href="/trips" className="hover:text-blue-600 transition-colors">Trips</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px]">
                  {trip?.title || 'Tokyo & Kyoto Cherry Blossom Odyssey'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                <span className="text-blue-600 font-semibold">Itinerary Builder</span>

                <div className="ml-3 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <span>Live Sync Active</span>
                </div>
              </div>

              {/* Action Cluster: Avatars, Auto-Optimize, PDF, Share */}
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <div className="flex items-center -space-x-2 mr-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-7 h-7 ring-2 ring-white dark:ring-slate-900 cursor-pointer">
                          <AvatarImage src="/jeel_avatar.png" alt="Jeel Patel" />
                          <AvatarFallback>JP</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>Jeel Patel (Owner)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-7 h-7 ring-2 ring-white dark:ring-slate-900 cursor-pointer">
                          <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" />
                          <AvatarFallback>ER</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>Elena Rostova (Editor)</TooltipContent>
                    </Tooltip>

                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                      +2
                    </div>
                  </div>
                </TooltipProvider>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOptimizeOpen(true)}
                  className="rounded-full h-8 px-3 text-xs gap-1.5 border-black/[0.08] dark:border-white/10 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
                  <span>Auto-Optimize</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="rounded-full h-8 px-3 text-xs gap-1.5 border-black/[0.08] dark:border-white/10 text-slate-700 dark:text-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
                  <span>PDF</span>
                </Button>

                <Link href={`/trips/${tripId}/view`}>
                  <Button
                    size="sm"
                    className="rounded-full h-8 px-4 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Share View</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Title & Linear View-mode Pills */}
            <div className="flex items-end justify-between gap-4 flex-wrap pb-1">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {trip?.title || "Tokyo & Kyoto Cherry Blossom Odyssey '25"}
                </h1>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap font-medium">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                    <span>May 14 – May 21, 2025 (7 Days)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                    <span>2 Regions • 14 Curated Waypoints</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Est. ¥148,000 (~$980)
                    </span>
                  </span>
                </div>
              </div>

              {/* Linear-style view mode pill switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-black/[0.04] dark:border-white/5">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                  <span>Timeline View</span>
                </button>
                <Link
                  href="/explore"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Map Split</span>
                </Link>
                <Link
                  href="/calendar"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
                >
                  <CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Calendar Sheet</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* 3-COLUMN NOTION / LINEAR STYLE WORKSPACE CANVAS */}
        <div className="max-w-[1720px] mx-auto w-full flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-130px)]">

          {/* LEFT COLUMN: Day Selector & Hierarchy (w-72) */}
          <aside className="w-full lg:w-80 bg-white/60 dark:bg-slate-900/60 border-r border-black/[0.05] dark:border-white/10 p-4 flex flex-col justify-between shrink-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Itinerary Outline
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  7 Days Total
                </span>
              </div>

              {/* Day Selector Buttons */}
              <div className="flex flex-col gap-1.5">
                {DEFAULT_DAYS.map((day) => {
                  const isActive = selectedDay === day.dayNumber;
                  return (
                    <button
                      key={day.dayNumber}
                      onClick={() => setSelectedDay(day.dayNumber)}
                      className={`group relative w-full text-left p-3 rounded-2xl transition-all duration-300 flex flex-col gap-1 ${
                        isActive
                          ? 'bg-blue-50/80 dark:bg-blue-950/50 ring-1 ring-blue-500/30 shadow-[0_4px_16px_rgba(37,99,235,0.06)]'
                          : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-full" />
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          Day {day.dayNumber} • {day.date}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                          {day.weather === 'sunny' ? (
                            <Sun className="w-3 h-3 text-amber-500" strokeWidth={1.5} />
                          ) : (
                            <Cloud className="w-3 h-3 text-teal-500" strokeWidth={1.5} />
                          )}
                          <span>{day.temp}</span>
                        </div>
                      </div>

                      <span className={`text-xs truncate ${isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                        {day.title}
                      </span>

                      <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                        <span className="text-slate-400">{day.activitiesCount} activities</span>
                        <span className={`font-semibold ${isActive ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                          {day.cost}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Day & Budget Footnote */}
            <div className="pt-4 flex flex-col gap-2.5">
              <Button
                variant="outline"
                onClick={() => setIsAddActivityOpen(true)}
                className="w-full rounded-xl py-2 text-xs font-semibold gap-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Add Day 8</span>
              </Button>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/[0.04] dark:border-white/5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Est. Trip Total
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ¥147,800 (~$980)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold">
                  92% Budget
                </span>
              </div>
            </div>
          </aside>

          {/* CENTER COLUMN: Interactive Vertical Timeline (flex-1) */}
          <main className="flex-1 bg-transparent p-4 md:p-8 flex flex-col overflow-y-auto">
            
            {/* Day Header & Inline Quick Commands */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/[0.04] dark:border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[11px] font-bold tracking-wider">
                    DAY {selectedDay < 10 ? `0${selectedDay}` : selectedDay}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {DEFAULT_DAYS[selectedDay - 1]?.title || 'Scheduled Waypoints'}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Friday, May 16 • Asakusa Heritage → Akihabara Otaku Culture → Shibuya Twilight Panorama
                </p>
              </div>

              {/* Inline Notion-style Quick Command Bar */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 shadow-xs self-start md:self-auto">
                <button
                  onClick={() => setIsAddActivityOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                  <span>Activity</span>
                </button>
                <button
                  onClick={() => setIsAddActivityOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Train className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
                  <span>Transit</span>
                </button>
                <button
                  onClick={() => setIsOptimizeOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Smart Order</span>
                </button>
              </div>
            </div>

            {/* Timeline Continuous Flow Container */}
            <div className="relative flex flex-col gap-6 pt-6">
              
              {/* Continuous vertical timeline ruler */}
              <div className="absolute left-[38px] top-8 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800 pointer-events-none" />

              {/* Render timeline items */}
              {items.map((item, idx) => {
                const isSelected = selectedItem?.id === item.id;

                return (
                  <React.Fragment key={item.id}>
                    {/* Transit Connector if present */}
                    {item.transitBefore && (
                      <div className="relative flex items-center ml-[54px] py-1 z-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px] shadow-xs">
                          {item.transitBefore.type === 'subway' && (
                            <Train className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                          )}
                          {item.transitBefore.type === 'walk' && (
                            <Footprints className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
                          )}
                          {item.transitBefore.type === 'train' && (
                            <Train className="w-3.5 h-3.5 text-indigo-600" strokeWidth={1.5} />
                          )}
                          <span>{item.transitBefore.text}</span>
                        </div>
                      </div>
                    )}

                    {/* Main Activity Item Block */}
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="relative group flex items-start gap-4"
                    >
                      {/* Time Marker + Dot */}
                      <div className="flex flex-col items-center w-[76px] shrink-0 pt-2 z-10">
                        <span className={`font-mono text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.time}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 uppercase">
                          {item.period}
                        </span>
                        <div className={`w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center mt-2 ring-2 ${
                          isSelected ? 'ring-blue-500 scale-110' : 'ring-slate-300 dark:ring-slate-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-400 dark:bg-slate-600'}`} />
                        </div>
                      </div>

                      {/* Card Content with DoubleBezel / Premium Envelope */}
                      <div
                        onClick={() => setSelectedItem(item)}
                        className={`flex-1 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                          isSelected ? 'scale-[1.01]' : 'hover:scale-[1.005]'
                        }`}
                      >
                        <DoubleBezel
                          glow={isSelected}
                          innerClassName={`p-5 ${
                            isSelected
                              ? 'border-l-4 border-l-blue-600 bg-white dark:bg-slate-900 ring-1 ring-blue-500/20'
                              : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-600 opacity-40 group-hover:opacity-100 transition-opacity cursor-grab" strokeWidth={1.5} />
                              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                {item.title}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                                {item.category}
                              </span>
                              {item.status && (
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                                  item.statusType === 'sunset'
                                    ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-700'
                                    : item.statusType === 'qr'
                                    ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-200 text-teal-700'
                                    : 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 text-blue-700'
                                }`}>
                                  <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                                  <span>{item.status}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{item.cost}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2.5 ml-6">
                            <div className={item.imageUrl ? 'md:col-span-3' : 'md:col-span-5'}>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-4 mt-3 flex-wrap text-[11px] font-mono text-slate-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                                  <span>{item.location}</span>
                                </span>
                                <span className="flex items-center gap-1 text-teal-600 font-semibold">
                                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                                  <span>{item.duration}</span>
                                </span>
                              </div>
                            </div>

                            {item.imageUrl && (
                              <div className="md:col-span-2 relative h-24 rounded-xl overflow-hidden shadow-xs">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            )}
                          </div>
                        </DoubleBezel>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}

              {/* Click to add new itinerary block placeholder */}
              <button
                onClick={() => setIsAddActivityOpen(true)}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white/40 dark:bg-slate-900/40 text-slate-500 hover:text-blue-600 transition-all ml-[76px]"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-xs font-semibold">
                  Click or press &apos;/&apos; to insert new itinerary block
                </span>
              </button>
            </div>
          </main>

          {/* RIGHT COLUMN: Card Inspector & Logistics Details (w-80) */}
          <aside className="w-full lg:w-96 bg-white/60 dark:bg-slate-900/60 border-l border-black/[0.05] dark:border-white/10 p-5 flex flex-col gap-5 shrink-0 overflow-y-auto">
            
            {/* Inspector Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Card Inspector
                </span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-blue-600">
                ACTIVE
              </span>
            </div>

            {/* Selected Entity Banner */}
            <div>
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                SCHEDULED ITEM #{selectedItem?.id.replace('act-', '')}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                {selectedItem?.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedItem?.location}
              </p>
            </div>

            {/* QR & Mobile Entry Pass Module */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Mobile Entry Pass
                </span>
                <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-200">
                  PAID • 2 TIX
                </span>
              </div>

              {/* Inline QR Pattern SVG */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center my-1">
                <svg className="w-24 h-24 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 100 100">
                  <rect fill="currentColor" height="25" rx="2" width="25" x="5" y="5" />
                  <rect fill="white" height="17" width="17" x="9" y="9" />
                  <rect fill="currentColor" height="9" width="9" x="13" y="13" />
                  <rect fill="currentColor" height="25" rx="2" width="25" x="70" y="5" />
                  <rect fill="white" height="17" width="17" x="74" y="9" />
                  <rect fill="currentColor" height="9" width="9" x="78" y="13" />
                  <rect fill="currentColor" height="25" rx="2" width="25" x="5" y="70" />
                  <rect fill="white" height="17" width="17" x="9" y="74" />
                  <rect fill="currentColor" height="9" width="9" x="13" y="78" />
                  <rect height="6" width="6" x="35" y="10" />
                  <rect height="6" width="6" x="45" y="10" />
                  <rect height="6" width="8" x="55" y="10" />
                  <rect height="6" width="10" x="35" y="22" />
                  <rect height="10" width="6" x="50" y="22" />
                  <rect height="6" width="8" x="10" y="35" />
                  <rect height="6" width="6" x="25" y="35" />
                  <rect height="6" width="14" x="35" y="35" />
                  <rect height="12" width="6" x="55" y="35" />
                  <rect height="6" width="12" x="70" y="35" />
                  <rect height="10" width="6" x="88" y="35" />
                  <rect height="15" width="6" x="35" y="50" />
                  <rect height="6" width="12" x="48" y="48" />
                  <rect height="14" width="8" x="65" y="50" />
                  <rect height="6" width="14" x="80" y="50" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Ref: <strong className="text-slate-900 dark:text-white">#SK-2505-81</strong></span>
                <button className="text-blue-600 hover:underline font-semibold">
                  Add to Apple Wallet
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.04] dark:border-white/5 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Slot Forecast
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">18°C</span>
                </div>
                <span className="text-[10px] font-mono text-teal-600 font-medium">Clear Sunset</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.04] dark:border-white/5 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Travel Time
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <Train className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">18 min</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Via Ginza Line</span>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Expense Breakdown
              </span>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 flex flex-col gap-1.5 text-xs font-mono text-slate-500">
                <div className="flex justify-between">
                  <span>General Admission × 2</span>
                  <span className="text-slate-800 dark:text-slate-200">¥5,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Rooftop Sofa Access</span>
                  <span className="text-teal-600">¥0 (Free)</span>
                </div>
                <div className="flex justify-between">
                  <span>Foreign FX (0% Card Fee)</span>
                  <span>$0.00</span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Total Paid</span>
                  <span className="text-blue-600">¥5,000 (~$33)</span>
                </div>
              </div>
            </div>

            {/* Important Logistics Memo */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="flex flex-col text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <strong className="font-semibold text-amber-900 dark:text-amber-200">Strict entry window:</strong>
                <span>Lockers required on 46F for tripods and bags before ascending to open roof deck. Handheld cameras only.</span>
              </div>
            </div>

            {/* AI Copilot Proactive Advisory */}
            {!isCopilotDismissed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 border border-teal-200/60 dark:border-teal-800/50 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-teal-700 dark:text-teal-300 font-bold text-xs">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>AI Copilot Recommendation</span>
                  </div>
                  <button onClick={() => setIsCopilotDismissed(true)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Crowd peak expected at <strong>18:30</strong>. Arrive at Shibuya Scramble Square elevator by <strong>17:45</strong> to avoid queueing.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs shadow-xs hover:bg-slate-50">
                    Set Reminder (17:40)
                  </button>
                  <button onClick={() => setIsCopilotDismissed(true)} className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs">
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}

          </aside>
        </div>

        {/* DIALOG: ADD NEW ACTIVITY */}
        <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Insert Itinerary Block
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Add an activity, landmark, dining reservation, or transit leg to Day {selectedDay}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddActivity} className="flex flex-col gap-4 mt-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Tea Ceremony at Uji"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Dining">Dining</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Foodie">Foodie</option>
                    <option value="Exploration">Exploration</option>
                    <option value="Nightlife">Nightlife</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Est. Cost
                  </label>
                  <input
                    type="text"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="e.g. ¥2,000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Logistics Notes
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ticket details, booking references, or tips..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Activity
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: AUTO OPTIMIZE */}
        <Dialog open={isOptimizeOpen} onOpenChange={setIsOptimizeOpen}>
          <DialogContent className="sm:max-w-[440px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 flex items-center justify-center text-teal-600 mb-2">
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                AI Route Optimization
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Our algorithm will analyze geographical clustering, subway transit legs, opening hours, and sunset golden hour slots to minimize total travel time by ~34%.
              </DialogDescription>
            </DialogHeader>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex flex-col gap-2 my-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between font-mono">
                <span>Current Transit Time:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">1h 48m</span>
              </div>
              <div className="flex items-center justify-between font-mono text-teal-600 font-bold">
                <span>Optimized Transit Time:</span>
                <span>1h 12m (-36 min)</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOptimizeOpen(false)}
                className="rounded-full text-xs"
              >
                Keep Current
              </Button>
              <Button
                onClick={handleAutoOptimize}
                disabled={isOptimizing}
                className="rounded-full text-xs bg-teal-600 hover:bg-teal-700 text-white gap-2"
              >
                {isOptimizing ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply Optimized Order</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AppShell>
  );
}

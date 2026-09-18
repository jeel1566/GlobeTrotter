'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Share2,
  Printer,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { ButtonInButton } from '@/components/ui/button-in-button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const GALLERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
    title: 'Tokyo Twilight Skyline & Tokyo Tower',
    author: 'Captured by Jeel Patel',
  },
  {
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
    title: 'Arashiyama Bamboo Pathway at Dawn, Kyoto',
    author: 'Shot on 35mm film',
  },
  {
    url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&auto=format&fit=crop&q=80',
    title: 'Sensō-ji Pagoda in Bloom, Asakusa',
    author: 'Cherry Blossom Special',
  },
  {
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
    title: 'Mount Fuji Silhouette from Shibuya Sky',
    author: 'Sunset Golden Hour',
  },
];

const DAYS_SCHEDULE = [
  {
    day: 1,
    title: 'Day 1 • Arrival, Narita Express & Shinjuku Neon Night',
    date: 'May 14, 2025',
    summary: 'Touchdown at NRT, check-in at Hotel Gracery Shinjuku, and evening walk through Omoide Yokocho.',
    activities: [
      { time: '14:30', name: 'NRT Arrival & JR Pass Activation', type: 'Transit', cost: 'Included in pass' },
      { time: '17:00', name: 'Check-in: Hotel Gracery Shinjuku', type: 'Stay', cost: '¥22,000 / night' },
      { time: '19:30', name: 'Yakitori Dinner in Memory Lane', type: 'Dining', cost: '¥3,800' },
    ],
  },
  {
    day: 2,
    title: 'Day 2 • Meiji Jingu, Harajuku Streetwear & Shibuya Crossing',
    date: 'May 15, 2025',
    summary: 'Morning peaceful walk under cedar trees, afternoon boutique browsing in Cat Street, sunset crossing.',
    activities: [
      { time: '09:00', name: 'Meiji Jingu Forest Walk', type: 'Cultural', cost: 'Free' },
      { time: '12:00', name: 'Aoyama Coffee & Tonkatsu Lunch', type: 'Dining', cost: '¥2,100' },
      { time: '15:00', name: 'Cat Street & Harajuku Shopping', type: 'Exploration', cost: 'Budget ¥15,000' },
      { time: '18:30', name: 'Shibuya Crossing & Hachiko Statue', type: 'Sightseeing', cost: 'Free' },
    ],
  },
  {
    day: 3,
    title: 'Day 3 • Sensō-ji Asakusa, Akihabara & Shibuya Sky Sunset',
    date: 'May 16, 2025',
    summary: "Tokyo's oldest temple, retro arcade hunting, and 360-degree observation deck during peak sunset.",
    activities: [
      { time: '09:00', name: 'Breakfast at Fuglen Tokyo', type: 'Dining', cost: '¥1,600' },
      { time: '10:30', name: 'Sensō-ji Temple & Nakamise-dori', type: 'Cultural', cost: 'Free Entry' },
      { time: '13:00', name: 'Wagyu Tsukemen at Menya Musashi', type: 'Foodie', cost: '¥1,800' },
      { time: '14:30', name: 'Akihabara Super Potato & Radio Kaikan', type: 'Exploration', cost: '¥3,000' },
      { time: '17:30', name: 'Shibuya Sky Rooftop Sunset Slot (18:15)', type: 'Sightseeing', cost: '¥2,500' },
      { time: '20:30', name: 'Omoide Yokocho Izakaya Crawl with Guide', type: 'Nightlife', cost: '¥4,500' },
    ],
  },
  {
    day: 4,
    title: 'Day 4 • Bullet Train to Kyoto & Gion Lantern Dusk',
    date: 'May 17, 2025',
    summary: '2h15m Shinkansen Nozomi bullet train to Kyoto Station, traditional Machiya townhouse check-in.',
    activities: [
      { time: '09:30', name: 'Shinkansen Bullet Train: Tokyo → Kyoto', type: 'Transit', cost: '¥14,200' },
      { time: '13:00', name: 'Machiya Townhouse Check-in, Higashiyama', type: 'Stay', cost: '¥28,000' },
      { time: '17:00', name: 'Gion Geisha District Twilight Walking Tour', type: 'Cultural', cost: '¥4,000' },
    ],
  },
  {
    day: 5,
    title: 'Day 5 • Fushimi Inari Torii Gates at Dawn & Kiyomizu-dera',
    date: 'May 18, 2025',
    summary: 'Early sunrise hike through 10,000 vermilion Torii gates with zero crowd friction.',
    activities: [
      { time: '06:30', name: 'Fushimi Inari Dawn Summit Hike', type: 'Nature', cost: 'Free' },
      { time: '11:00', name: 'Matcha Tasting & Uji Soba Lunch', type: 'Dining', cost: '¥2,400' },
      { time: '14:30', name: 'Kiyomizu-dera Wooden Stage & Otowa Waterfall', type: 'Cultural', cost: '¥400' },
    ],
  },
];

export default function SharedItineraryViewPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased pb-24">
      
      {/* Top Navigation Bar */}
      <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/10 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href={`/trips/${tripId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Back to Editor Workspace</span>
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
              size="sm"
              onClick={handleCopyLink}
              className="rounded-full text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{copied ? 'Link Copied!' : 'Share Itinerary'}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Header Presentation */}
      <header className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold uppercase tracking-widest">
              Verified Expedition
            </span>
            <span className="text-xs text-slate-400 font-mono">•</span>
            <span className="text-xs text-slate-500 font-mono">7 Days / 6 Nights</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Tokyo &amp; Kyoto Cherry Blossom Odyssey &apos;25
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            An intentionally balanced itinerary navigating neon cyberpunk skyscrapers, serene 8th-century moss gardens, artisan pour-overs, and timed golden hour rooftop panoramas.
          </p>

          {/* Collaborator / Author details */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-black/[0.05] dark:border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-slate-800">
                <AvatarImage src="/jeel_avatar.png" alt="Jeel Patel" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Curated by Jeel Patel
                </span>
                <span className="text-[11px] text-slate-500">
                  Updated May 2025 • Public Collaborative Plan
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Waypoints</span>
                <span className="font-bold">14 Spots</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Cost</span>
                <span className="font-bold text-teal-600">¥148,000 (~$980)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pace</span>
                <span className="font-bold text-blue-600">Moderate / Scenic</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Visual Photo Carousel */}
      <section className="max-w-6xl mx-auto px-6 py-6">
        <Carousel className="w-full">
          <CarouselContent>
            {GALLERY_IMAGES.map((img, idx) => (
              <CarouselItem key={idx} className="md:basis-1/2 lg:basis-3/4">
                <div className="p-1">
                  <div className="relative h-80 md:h-[420px] rounded-[2rem] overflow-hidden shadow-lg group">
                    <Image
                      src={img.url}
                      alt={img.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                      <div>
                        <h4 className="text-lg md:text-xl font-bold">{img.title}</h4>
                        <span className="text-xs text-white/80 font-mono">{img.author}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                        Waypoint #{idx + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:flex justify-end gap-2 mt-4">
            <CarouselPrevious className="relative inset-auto border-black/[0.08]" />
            <CarouselNext className="relative inset-auto border-black/[0.08]" />
          </div>
        </Carousel>
      </section>

      {/* Main Breakdown & Accordions */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Day Accordions (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Day-by-Day Route &amp; Schedule
            </h3>
            <span className="text-xs text-slate-500 font-mono">Expandable timeline</span>
          </div>

          <Accordion type="single" collapsible defaultValue="day-3" className="w-full flex flex-col gap-4">
            {DAYS_SCHEDULE.map((d) => (
              <AccordionItem
                key={d.day}
                value={`day-${d.day}`}
                className="border border-black/[0.06] dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs px-5 py-1"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                        DAY 0{d.day}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{d.date}</span>
                    </div>
                    <span className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {d.title}
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-2 pb-5 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    {d.summary}
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {d.activities.map((act, aIdx) => (
                      <div
                        key={aIdx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 w-12">
                            {act.time}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {act.name}
                            </span>
                            <span className="text-[11px] text-slate-400">{act.type}</span>
                          </div>
                        </div>

                        <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
                          {act.cost}
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Right Column: Key Logistics & Packing Summary (4 Cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Expedition Highlights
            </h4>

            <div className="flex flex-col gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Tokyo Subway 72-hr Pass covers all central metropolitan transfers.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Shinkansen Nozomi seat reserved on right side for Mount Fuji visibility.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Mobile Suica card integrated via Apple Wallet for seamless IC tap-and-go.</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link href={`/trips/${tripId}`}>
                <ButtonInButton variant="primary" className="w-full">
                  Clone / Edit in My Workspace
                </ButtonInButton>
              </Link>
            </div>
          </DoubleBezel>
        </aside>

      </main>

    </div>
  );
}

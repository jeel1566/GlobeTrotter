'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Share2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { ButtonInButton } from '@/components/ui/button-in-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const VISITED_COUNTRIES = [
  { name: 'Japan', code: 'JP', trips: 4, flag: '🇯🇵' },
  { name: 'Italy', code: 'IT', trips: 3, flag: '🇮🇹' },
  { name: 'France', code: 'FR', trips: 2, flag: '🇫🇷' },
  { name: 'Switzerland', code: 'CH', trips: 2, flag: '🇨🇭' },
  { name: 'India', code: 'IN', trips: 5, flag: '🇮🇳' },
  { name: 'Spain', code: 'ES', trips: 1, flag: '🇪🇸' },
  { name: 'United States', code: 'US', trips: 6, flag: '🇺🇸' },
  { name: 'Thailand', code: 'TH', trips: 2, flag: '🇹🇭' },
];

const BADGES = [
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
    description: 'Crafted 10 public itineraries with 1,000+ community forks.',
    icon: '⚡',
    level: 'Master Curator',
  },
];

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-6 max-w-[1720px] mx-auto gap-8">
        
        {/* PROFILE HEADER HERO (High-End Agency Tier) */}
        <DoubleBezel innerClassName="p-6 md:p-8 bg-white dark:bg-slate-900">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Avatar & User Details */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-blue-500/20 shadow-xl">
                  <AvatarImage src="/jeel_avatar.png" alt="Jeel Patel" />
                  <AvatarFallback className="text-xl font-bold">JP</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[10px]">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Jeel Patel
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Pro Traveler
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Verified Curator
                  </span>
                </div>

                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                  Architecting modern SaaS workflows &amp; curated world expeditions. Passionate about analog audio bars, Kyoto Zen gardens, and zero-friction travel logistics.
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono mt-2.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>San Francisco / Tokyo</span>
                  </span>
                  <span>•</span>
                  <span>Joined GlobeTrotter 2024</span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs gap-1.5 border-black/[0.08]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Passport</span>
              </Button>
              <ButtonInButton variant="primary" size="sm" className="h-10 text-xs">
                Edit Preferences
              </ButtonInButton>
            </div>

          </div>

          {/* Haptic Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Countries Visited
              </span>
              <span className="text-xl font-bold font-mono mt-0.5 text-blue-600">14</span>
              <span className="text-[10px] text-slate-400">Across 3 continents</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cities Explored
              </span>
              <span className="text-xl font-bold font-mono mt-0.5 text-teal-600">38</span>
              <span className="text-[10px] text-slate-400">92 waypoints logged</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Distance Traveled
              </span>
              <span className="text-xl font-bold font-mono mt-0.5 text-indigo-600">32,480 km</span>
              <span className="text-[10px] text-slate-400">12 flight segments</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Community Forks
              </span>
              <span className="text-xl font-bold font-mono mt-0.5 text-amber-600">4,120</span>
              <span className="text-[10px] text-slate-400">Top 1% curator</span>
            </div>
          </div>
        </DoubleBezel>

        {/* TABS SECTION */}
        <Tabs defaultValue="expeditions" className="w-full">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
            <TabsTrigger value="expeditions" className="rounded-xl text-xs font-semibold">
              My Expeditions
            </TabsTrigger>
            <TabsTrigger value="countries" className="rounded-xl text-xs font-semibold">
              Visited Countries &amp; Passport
            </TabsTrigger>
            <TabsTrigger value="trophies" className="rounded-xl text-xs font-semibold">
              Milestone Trophies
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-xl text-xs font-semibold">
              Logistics &amp; Currency
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MY EXPEDITIONS */}
          <TabsContent value="expeditions" className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              
              {/* Trip Card 1 */}
              <DoubleBezel innerClassName="p-5 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3">
                    <Image
                      src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80"
                      alt="Tokyo"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-teal-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                      Active
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tokyo &amp; Kyoto Cherry Blossom Odyssey &apos;25
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    May 14 – May 21, 2025 • 7 Days • 14 Waypoints
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    ¥148,000 (~$980)
                  </span>
                  <Link href="/trips/demo">
                    <Button size="sm" className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white">
                      Open Workspace
                    </Button>
                  </Link>
                </div>
              </DoubleBezel>

              {/* Trip Card 2 */}
              <DoubleBezel innerClassName="p-5 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3">
                    <Image
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80"
                      alt="Dolomites"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                      Planning
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Italian Dolomites Alpine Hut Traverse
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    August 10 – August 18, 2025 • 8 Days
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    €1,240 (~$1,350)
                  </span>
                  <Link href="/trips/create">
                    <Button size="sm" variant="outline" className="rounded-full text-xs">
                      Edit Plan
                    </Button>
                  </Link>
                </div>
              </DoubleBezel>

            </div>
          </TabsContent>

          {/* TAB 2: VISITED COUNTRIES */}
          <TabsContent value="countries">
            <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Passport Stamp Gallery (14 Countries)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {VISITED_COUNTRIES.map((c) => (
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
                        {c.trips} logged expeditions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DoubleBezel>
          </TabsContent>

          {/* TAB 3: MILESTONES */}
          <TabsContent value="trophies">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BADGES.map((b, idx) => (
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
          </TabsContent>

          {/* TAB 4: PREFERENCES */}
          <TabsContent value="preferences">
            <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900 max-w-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Traveler Profile &amp; FX Preferences
              </h3>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Default Currency</span>
                    <span className="text-slate-500">All prices will be estimated in USD with live conversion.</span>
                  </div>
                  <span className="font-mono font-bold text-blue-600">USD ($)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Travel Vibe Priority</span>
                    <span className="text-slate-500">Preferred pacing for AI itinerary suggestions.</span>
                  </div>
                  <span className="font-semibold text-teal-600">Culture &amp; Hidden Gems</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Transit Mode Preference</span>
                    <span className="text-slate-500">High-speed trains &amp; scenic walking routes.</span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Rail + Foot</span>
                </div>
              </div>
            </DoubleBezel>
          </TabsContent>

        </Tabs>

      </div>
    </AppShell>
  );
}

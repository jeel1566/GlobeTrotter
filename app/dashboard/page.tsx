'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Sparkles,
  Plus,
  MapPin,
  Wallet,
  ArrowRight,
  Compass,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { MotionCard } from '@/components/ui/motion-card';
import { Trip } from '@/types/database';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [seeding, setSeeding] = useState(false);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      if (res.ok) {
        const json = await res.json();
        setTrips(json.data || []);
      }
    } catch (e) {
      console.error('Failed to load trips:', e);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await fetchTrips();
      }
    } catch (e) {
      console.error('Seeding failed:', e);
    } finally {
      setSeeding(false);
    }
  };

  const handleAiPlan = () => {
    if (!aiPrompt.trim()) return;
    router.push(`/trips/create?prompt=${encodeURIComponent(aiPrompt.trim())}`);
  };

  const activeTrip = trips[0];
  const userName = user?.firstName || user?.fullName?.split(' ')[0] || 'Explorer';

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* 1. Header: Crisp greeting & action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome, {userName}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Plan, budget, and navigate your journeys.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDemo}
              disabled={seeding}
              className="rounded-xl text-xs font-semibold gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{seeding ? 'Seeding...' : 'Demo Data'}</span>
            </Button>
            <Link href="/trips/create">
              <Button size="sm" className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white gap-1.5 font-semibold shadow-xs">
                <Plus className="w-4 h-4" />
                <span>New Trip</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Fast AI Planning Dock */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Trip Builder</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiPlan()}
              placeholder="Where to? e.g., 7 days in Tokyo under ₹80,000 with friends..."
              className="w-full flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <Button
              onClick={handleAiPlan}
              className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl px-5 font-semibold text-xs h-10 shadow-xs shrink-0"
            >
              Generate Plan →
            </Button>
          </div>

          {/* Quick inspiration chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
            <span className="font-medium text-slate-400">Popular:</span>
            {[
              'Tokyo · 7 Days',
              'Swiss Alps · 6 Days',
              'Amalfi Coast · 5 Days',
              'Bali · 10 Days',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setAiPrompt(chip);
                  router.push(`/trips/create?prompt=${encodeURIComponent(chip)}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* 3. KPI Metrics (Billboard Scanning) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Trips</span>
              <Compass className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {trips.length}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Live synced
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Destinations</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {trips.reduce((acc, t) => acc + (t.stops?.length || 1), 0)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Saved stops</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Budget Tracked</span>
              <Wallet className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{trips.reduce((acc, t) => acc + (Number(t.budget_total) || 0), 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Across all trips</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Routes Optimized</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {Math.max(trips.length * 3, 4)}
            </div>
            <span className="text-[11px] text-blue-600 font-medium mt-1 block">
              Auto-arranged
            </span>
          </div>
        </div>

        {/* 4. Active / Featured Trip & Escapes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Trip Highlight */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-slate-900">Current Trip</h2>
              <Link href="/trips" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                All Trips ({trips.length}) →
              </Link>
            </div>

            {activeTrip ? (
              <MotionCard className="overflow-hidden border border-slate-200/80 rounded-2xl group shadow-xs">
                <div className="relative h-60 sm:h-64 w-full overflow-hidden">
                  <img
                    src={
                      activeTrip.cover_image_url ||
                      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80'
                    }
                    alt={activeTrip.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-800 shadow-xs">
                      {activeTrip.visibility === 'public' ? 'Public' : 'Private'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold">
                      {activeTrip.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
                      {activeTrip.title}
                    </h3>
                    <p className="text-xs text-slate-200 line-clamp-1">
                      {activeTrip.description || 'Custom multi-city journey.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                  <div className="flex items-center gap-5 text-xs text-slate-500 w-full sm:w-auto">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Start</span>
                      <span className="font-semibold text-slate-800">
                        {activeTrip.start_date || 'Upcoming'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Budget</span>
                      <span className="font-semibold text-slate-800">
                        ₹{Number(activeTrip.budget_total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Route</span>
                      <span className="font-semibold text-blue-600">
                        {activeTrip.stops?.length || 2} Stops
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link href={`/trips/${activeTrip.id}`} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 h-9">
                        <span>Open Trip</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/trips/${activeTrip.id}/view`} className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto rounded-xl text-xs font-semibold h-9 border-slate-200">
                        Overview
                      </Button>
                    </Link>
                  </div>
                </div>
              </MotionCard>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center flex flex-col items-center justify-center">
                <Compass className="w-10 h-10 text-blue-600 mb-3 stroke-1" />
                <h3 className="font-bold text-base text-slate-900">No trips yet</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 mb-5">
                  Plan your first journey with AI or load demo data in one click.
                </p>
                <div className="flex items-center gap-2.5">
                  <Button onClick={handleSeedDemo} disabled={seeding} variant="outline" className="rounded-xl text-xs font-semibold h-9">
                    {seeding ? 'Loading...' : 'Seed Demo'}
                  </Button>
                  <Link href="/trips/create">
                    <Button className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold h-9">
                      Create Trip →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Popular Destinations */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="font-bold text-base text-slate-900">Popular Escapes</h2>
            <div className="space-y-2.5">
              {[
                { name: 'Tokyo & Kyoto, Japan', tag: 'Culture', days: '7d', cost: '₹80k' },
                { name: 'Swiss Alps Grand Tour', tag: 'Scenic', days: '6d', cost: '₹1.2L' },
                { name: 'Amalfi Coast, Italy', tag: 'Coastal', days: '5d', cost: '₹90k' },
                { name: 'Bali & Ubud, Indonesia', tag: 'Tropical', days: '10d', cost: '₹45k' },
              ].map((item) => (
                <div
                  key={item.name}
                  onClick={() => router.push(`/trips/create?destination=${encodeURIComponent(item.name)}`)}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-500/40 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {item.tag}
                      </span>
                      <span>{item.days}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-600">{item.cost}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>

            {/* Quick Tip */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Tip</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Traveling to Japan during cherry blossom season? Book Shinkansen bullet train passes 30 days ahead to save up to 25%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

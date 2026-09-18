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
      <div className="space-y-8">
        {/* 1. Header & Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your centralized command hub for multi-city travel & smart budget tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDemo}
              disabled={seeding}
              className="rounded-xl text-xs font-semibold gap-1.5 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{seeding ? 'Seeding Demo...' : '1-Click Demo Seed'}</span>
            </Button>
            <Link href="/trips/create">
              <Button size="sm" className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white gap-1.5 font-semibold">
                <Plus className="w-4 h-4" />
                <span>New Trip</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. AI Trip Planning Input Box */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>AI Trip Copilot Prompt</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading mb-2">
              Where would you like to travel next?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mb-6">
              Describe your destination, duration, companions, and budget. Our AI creates an instant day-by-day itinerary.
            </p>

            <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-lg">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiPlan()}
                placeholder="e.g., 7 days in Japan under ₹80,000 with friends..."
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <Button
                onClick={handleAiPlan}
                className="bg-[#2563EB] hover:bg-blue-800 text-white rounded-xl px-5 font-bold text-xs h-10 shadow-sm"
              >
                Plan Trip →
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Travel Statistics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Trips</span>
              <Compass className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">
              {trips.length}
            </div>
            <span className="text-[11px] text-teal-600 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Live synced
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Destinations Visited</span>
              <MapPin className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">
              {trips.reduce((acc, t) => acc + (t.stops?.length || 1), 0)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Cities on your route</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Budget Tracked</span>
              <Wallet className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">
              ₹{trips.reduce((acc, t) => acc + (Number(t.budget_total) || 0), 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Auto-reconciled</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">AI Routes Optimized</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">
              {Math.max(trips.length * 3, 4)}
            </div>
            <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
              Algorithmic pathfinding
            </span>
          </div>
        </div>

        {/* 4. Active / Upcoming Trip Card & Recent Trips */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Trip Highlight */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 font-heading">Featured Trip</h3>
              <Link href="/trips" className="text-xs font-semibold text-blue-600 hover:underline">
                View All Trips ({trips.length}) →
              </Link>
            </div>

            {activeTrip ? (
              <MotionCard className="overflow-hidden group">
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <img
                    src={
                      activeTrip.cover_image_url ||
                      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80'
                    }
                    alt={activeTrip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-800 shadow-sm">
                      {activeTrip.visibility === 'public' ? '🌍 Public Trip' : '🔒 Private Trip'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                      {activeTrip.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <h4 className="text-2xl sm:text-3xl font-bold font-heading mb-1.5">
                      {activeTrip.title}
                    </h4>
                    <p className="text-xs text-slate-200 line-clamp-1 max-w-xl">
                      {activeTrip.description || 'Custom multi-city journey crafted with GlobeTrotter AI.'}
                    </p>
                  </div>
                </div>

                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-6 text-xs text-slate-500 w-full sm:w-auto">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Dates</span>
                      <span className="font-semibold text-slate-800">
                        {activeTrip.start_date || 'Oct 2026'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Budget</span>
                      <span className="font-semibold text-slate-800">
                        ₹{Number(activeTrip.budget_total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Cities</span>
                      <span className="font-semibold text-blue-600">
                        {activeTrip.stops?.length || 2} Stops
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link href={`/trips/${activeTrip.id}`} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold gap-2">
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/trips/${activeTrip.id}/view`} className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto rounded-xl text-xs font-semibold">
                        View Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </MotionCard>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center flex flex-col items-center justify-center">
                <Compass className="w-12 h-12 text-blue-600 mb-4 stroke-1" />
                <h4 className="font-bold text-lg text-slate-900 font-heading">No trips created yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
                  Get started by creating your first trip with our AI copilot or load a pre-built demo trip with one click.
                </p>
                <div className="flex items-center gap-3">
                  <Button onClick={handleSeedDemo} disabled={seeding} variant="outline" className="rounded-xl text-xs font-semibold">
                    {seeding ? 'Generating...' : 'Seed Demo Trip'}
                  </Button>
                  <Link href="/trips/create">
                    <Button className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold">
                      Create Your First Trip →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Quick Actions & Popular Destinations */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-bold text-lg text-slate-900 font-heading">Trending Escapes</h3>
            <div className="space-y-3">
              {[
                { name: 'Tokyo & Kyoto, Japan', tag: 'Culture', days: '7d', cost: '₹80k' },
                { name: 'Swiss Alps Grand Tour', tag: 'Luxury', days: '6d', cost: '₹1.2L' },
                { name: 'Amalfi Coast, Italy', tag: 'Romantic', days: '5d', cost: '₹90k' },
                { name: 'Ubud Tropical Nomad', tag: 'Adventure', days: '10d', cost: '₹45k' },
              ].map((item) => (
                <div
                  key={item.name}
                  onClick={() => router.push(`/trips/create?destination=${encodeURIComponent(item.name)}`)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {item.tag}
                      </span>
                      <span>{item.days}</span>
                      <span>•</span>
                      <span className="font-semibold text-teal-600">{item.cost}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>

            {/* Quick Copilot Tip */}
            <div className="p-5 rounded-3xl bg-teal-50/70 border border-teal-200/60 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-teal-700 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Copilot Travel Tip</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Traveling to Japan during cherry blossom season? Book Shinkansen bullet train passes 30 days ahead to save up to 25%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

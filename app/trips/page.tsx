'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Calendar,
  ChevronRight,
  Search,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { ButtonInButton } from '@/components/ui/button-in-button';
import { Trip } from '@/types/database';

const DEFAULT_TRIPS = [
  {
    id: 'demo',
    title: 'Tokyo & Kyoto Cherry Blossom Odyssey \'25',
    destination: 'Tokyo & Kyoto, Japan',
    start_date: '2025-05-14',
    end_date: '2025-05-21',
    status: 'active',
    estimated_cost_usd: 980,
    cover_image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    daysCount: 7,
    waypointsCount: 14,
  },
  {
    id: 'trip-2',
    title: 'Italian Dolomites High Alpine Hut Traverse',
    destination: 'Cortina d’Ampezzo, Italy',
    start_date: '2025-08-10',
    end_date: '2025-08-18',
    status: 'planning',
    estimated_cost_usd: 1350,
    cover_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    daysCount: 8,
    waypointsCount: 12,
  },
  {
    id: 'trip-3',
    title: 'Goa Coastal Architecture & Sunset Shacks',
    destination: 'Goa, India',
    start_date: '2025-11-04',
    end_date: '2025-11-09',
    status: 'completed',
    estimated_cost_usd: 480,
    cover_image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    daysCount: 5,
    waypointsCount: 9,
  },
];

export default function TripsListingPage() {
  const [trips, setTrips] = useState(DEFAULT_TRIPS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'planning' | 'completed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadUserTrips() {
      try {
        const res = await fetch('/api/trips');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const mapped = json.data.map((t: Trip) => ({
              id: t.id,
              title: t.title,
              destination: t.destination,
              start_date: t.start_date || '2025-05-14',
              end_date: t.end_date || '2025-05-21',
              status: t.status || 'planning',
              estimated_cost_usd: t.estimated_cost_usd || 850,
              cover_image_url: t.cover_image_url || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
              daysCount: 7,
              waypointsCount: 10,
            }));
            setTrips(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load trips', err);
      }
    }
    loadUserTrips();
  }, []);

  const filtered = trips.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-6 max-w-[1720px] mx-auto gap-8">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.05] dark:border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest">
              My Travel Workspaces
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Trips &amp; Itineraries
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your upcoming adventures, collaborative roadmaps, and past expeditions.
            </p>
          </div>

          <Link href="/trips/create">
            <ButtonInButton variant="primary" size="default">
              Plan New Trip with AI
            </ButtonInButton>
          </Link>
        </div>

        {/* CONTROLS DOCK: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title or destination..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
            {(['all', 'active', 'planning', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* TRIPS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((trip) => (
            <DoubleBezel
              key={trip.id}
              innerClassName="p-5 bg-white dark:bg-slate-900 flex flex-col justify-between group"
            >
              <div>
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-3.5 bg-slate-100">
                  <Image
                    src={trip.cover_image_url}
                    alt={trip.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    trip.status === 'active'
                      ? 'bg-teal-500 text-white'
                      : trip.status === 'completed'
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {trip.status}
                  </span>

                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-mono">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-semibold">{trip.destination}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                  {trip.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{trip.start_date}</span>
                  </span>
                  <span>•</span>
                  <span>{trip.daysCount} Days</span>
                  <span>•</span>
                  <span>{trip.waypointsCount} Spots</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  ${trip.estimated_cost_usd} USD
                </span>

                <div className="flex items-center gap-2">
                  <Link href={`/trips/${trip.id}/view`}>
                    <Button variant="outline" size="sm" className="rounded-full text-xs h-8 px-3 border-black/[0.08]">
                      View
                    </Button>
                  </Link>
                  <Link href={`/trips/${trip.id}`}>
                    <Button size="sm" className="rounded-full text-xs h-8 px-3.5 bg-blue-600 hover:bg-blue-700 text-white gap-1">
                      <span>Builder</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </DoubleBezel>
          ))}
        </div>

      </div>
    </AppShell>
  );
}

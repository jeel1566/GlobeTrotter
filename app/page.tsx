'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Route,
  Wallet,
  MapPin,
  Star,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const QUICK_TAGS = [
  { label: 'Tokyo, Japan', prompt: 'Solo 7-day cultural journey through Tokyo and Kyoto under ₹80,000' },
  { label: 'Amalfi Coast, Italy', prompt: 'Romantic 5-day getaway in Amalfi Coast with cliffside sunset dining' },
  { label: 'Swiss Alps', prompt: 'Luxury 6-day ski escape to Zermatt and Lauterbrunnen' },
  { label: 'Bali, Indonesia', prompt: '2-week tropical adventure in Ubud and Canggu' },
  { label: 'Goa, India', prompt: '5-day coastal beaches and Portuguese heritage in Goa' },
];

const POPULAR_DESTINATIONS = [
  {
    name: 'Kyoto & Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
    tag: 'Cultural',
    duration: '7 Days',
    budget: '₹75,000',
    rating: '4.95',
  },
  {
    name: 'Zermatt, Switzerland',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80',
    tag: 'Alps',
    duration: '6 Days',
    budget: '₹1,20,000',
    rating: '4.98',
  },
  {
    name: 'Ubud, Bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    tag: 'Tropical',
    duration: '10 Days',
    budget: '₹45,000',
    rating: '4.91',
  },
  {
    name: 'Amalfi, Italy',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&auto=format&fit=crop&q=80',
    tag: 'Coastline',
    duration: '8 Days',
    budget: '₹95,000',
    rating: '4.96',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [searchPrompt, setSearchPrompt] = useState('');

  const handleGenerate = (promptText?: string) => {
    const text = promptText || searchPrompt;
    if (!text.trim()) return;
    router.push(`/trips/create?prompt=${encodeURIComponent(text.trim())}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col font-sans">
      {/* 1. Slim Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 font-heading">
              GlobeTrotter
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500">
            <Link href="/explore" className="hover:text-blue-600 transition-colors">Explore</Link>
            <Link href="/community" className="hover:text-blue-600 transition-colors">Community</Link>
            <a href="#destinations" className="hover:text-blue-600 transition-colors">Destinations</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-slate-700">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs font-semibold px-4 h-8 gap-1.5">
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs font-semibold px-4 h-8 gap-1.5 mr-2">
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: High Impact, Zero Word Clutter */}
      <section className="relative w-full pt-16 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Subtle pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 mb-6 text-[11px] font-semibold">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Smart AI Travel OS &bull; Live Maps &bull; Real Budgets</span>
        </div>

        {/* Crisp Headline */}
        <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-4">
          Where to next?
        </h1>

        <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed mb-8">
          Plan multi-city trips in seconds. AI routing, real-world OpenStreetMap discovery, and real-time expense tracking.
        </p>

        {/* Centered Search Dock */}
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-200 p-2 flex flex-col gap-2.5">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. 7 days in Japan under ₹80,000, or weekend in Goa..."
              className="w-full h-11 pl-10 pr-28 rounded-xl bg-slate-50 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-200/60"
            />
            <button
              onClick={() => handleGenerate()}
              className="absolute right-1.5 h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <span>Plan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Destination Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs text-slate-500">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1 shrink-0">Popular:</span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag.label}
                onClick={() => {
                  setSearchPrompt(tag.prompt);
                  handleGenerate(tag.prompt);
                }}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[11px] font-medium transition-colors shrink-0"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Core Stats */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-12 pt-8 border-t border-slate-100 w-full max-w-lg">
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">120K+</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Trips Planned</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-blue-600 font-mono">100%</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Free &amp; Open Map</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">Zero</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Double Counting</div>
          </div>
        </div>
      </section>

      {/* 3. Three Pillars (Billboard Scan: 1 Line each) */}
      <section className="w-full py-12 px-6 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Route className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI Route Engine</h3>
                <p className="text-[11px] text-slate-500">Clusters stops geographically to avoid backtracks</p>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-50 text-teal-700 text-[10px] font-mono font-bold self-start">
              +38% transit efficiency
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Map &amp; Social Radar</h3>
                <p className="text-[11px] text-slate-500">Real OpenStreetMap pins + Reddit &amp; Instagram trends</p>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-50 text-indigo-700 text-[10px] font-mono font-bold self-start">
              Ahmedabad &bull; Shibuya &bull; Global
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Realtime Budget Ledger</h3>
                <p className="text-[11px] text-slate-500">Activities + flights + hotels with live balance</p>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-50 text-blue-700 text-[10px] font-mono font-bold self-start">
              Planned vs. Remaining
            </div>
          </div>
        </div>
      </section>

      {/* 4. Popular Destinations (Visual-First Cards) */}
      <section id="destinations" className="w-full py-16 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-heading">
              Popular Escapes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Curated travel itineraries ready to clone in one click</p>
          </div>
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-blue-600 hover:text-blue-700 gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              onClick={() => handleGenerate(`Trip to ${dest.name}`)}
              className="group p-2 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                  {dest.tag}
                </span>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-900 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  {dest.rating}
                </span>
              </div>

              <div className="p-2 pt-3 flex flex-col gap-2">
                <h4 className="font-bold text-xs text-slate-900 truncate">{dest.name}</h4>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">{dest.duration}</span>
                  <span className="font-bold text-slate-900">{dest.budget}</span>
                </div>
                <Button size="sm" className="w-full h-7 rounded-lg text-[11px] bg-slate-900 hover:bg-blue-600 text-white font-semibold transition-colors mt-1">
                  Plan Trip
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Minimal Footer */}
      <footer className="w-full bg-white border-t border-slate-100 py-8 px-6 text-xs text-slate-400 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <span>GlobeTrotter</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-400 font-normal">Intelligent travel planning</span>
          </div>
          <div className="flex gap-5 text-slate-500 font-medium">
            <Link href="/explore" className="hover:text-blue-600">Explore</Link>
            <Link href="/community" className="hover:text-blue-600">Community</Link>
            <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

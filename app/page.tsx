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
  Users,
  Calendar,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Spotlight } from '@/components/ui/spotlight';
import { MotionCard } from '@/components/ui/motion-card';

const QUICK_TAGS = [
  { label: 'Solo in Japan', prompt: 'Solo 7-day cultural journey through Tokyo and Kyoto under ₹80,000' },
  { label: 'Amalfi Coast', prompt: 'Romantic 5-day getaway in Amalfi Coast with cliffside sunset dining' },
  { label: 'Swiss Alps Ski', prompt: 'Luxury 6-day ski chalet escape to Zermatt & Lauterbrunnen' },
  { label: 'Bali Nomad', prompt: '2-week digital nomad exploration in Ubud & Canggu' },
  { label: 'Goa Beaches', prompt: '5-day coastal beaches & Portuguese heritage in Goa under ₹25,000' },
];

const POPULAR_DESTINATIONS = [
  {
    name: 'Kyoto & Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
    tag: 'Cultural Heritage',
    duration: '7 Days',
    budget: '₹75,000',
    rating: '4.95',
  },
  {
    name: 'Zermatt & Alps, Switzerland',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80',
    tag: 'Alpine Luxury',
    duration: '6 Days',
    budget: '₹1,20,000',
    rating: '4.98',
  },
  {
    name: 'Ubud & Canggu, Bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    tag: 'Tropical Escape',
    duration: '10 Days',
    budget: '₹45,000',
    rating: '4.91',
  },
  {
    name: 'Tuscany & Amalfi, Italy',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&auto=format&fit=crop&q=80',
    tag: 'Gastronomy & Coast',
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
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-heading">
                GlobeTrotter
              </span>
              <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase ml-2 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/60">
                AI Travel OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#destinations" className="hover:text-blue-600 transition-colors">Destinations</a>
            <Link href="/community" className="hover:text-blue-600 transition-colors">Community</Link>
            <Link href="/explore" className="hover:text-blue-600 transition-colors">Explore</Link>
          </nav>

          <div className="flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" className="font-semibold text-slate-700">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-sm gap-2">
                  <span>Start Planning Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-sm gap-2 mr-2">
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative w-full overflow-hidden pt-12 pb-24 px-6 lg:px-12 flex flex-col items-center">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#2563EB" />

        <div className="max-w-4xl text-center flex flex-col items-center z-10">
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 shadow-xs mb-6 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Next-Gen Travel OS — Powered by OpenAI & Real-time Places</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Turn Your Travel <br />
            <span className="bg-gradient-to-r from-[#2563EB] via-blue-600 to-[#14B8A6] bg-clip-text text-transparent">
              Dreams Into Reality
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed mb-10">
            The all-in-one AI travel workspace. Build day-by-day itineraries, track budgets, discover authentic local secrets, and clone community trips in seconds.
          </p>

          {/* AI Prompt Bar */}
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-xl border border-slate-200/80 p-3 sm:p-4 flex flex-col gap-3.5">
            <div className="relative flex items-center">
              <Sparkles className="absolute left-4 w-5 h-5 text-blue-600" />
              <input
                type="text"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g., Plan a 7-day trip to Japan under ₹80,000 with friends..."
                className="w-full h-14 pl-12 pr-36 sm:pr-40 rounded-2xl bg-slate-50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border border-slate-200/50 transition-all"
              />
              <button
                onClick={() => handleGenerate()}
                className="absolute right-2 h-10 px-5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <span>Generate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-slate-500">
              <span className="text-[11px] font-semibold text-slate-400 px-1 flex items-center gap-1 whitespace-nowrap">
                ⚡ Quick tags:
              </span>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => {
                    setSearchPrompt(tag.prompt);
                    handleGenerate(tag.prompt);
                  }}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-medium transition-colors whitespace-nowrap"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cinematic Mockup Canvas Preview */}
        <div className="w-full max-w-5xl mt-16 rounded-3xl bg-white shadow-2xl border border-slate-200/80 p-5 md:p-7 overflow-hidden relative z-10">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-teal-400" />
              </div>
              <span className="text-xs font-mono text-slate-500 font-medium ml-2">
                itinerary_grand_italy_2025.gt
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold flex items-center gap-1.5 border border-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 rounded-2xl overflow-hidden relative min-h-[320px] bg-slate-100 flex flex-col justify-between p-6">
              <img
                src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop&q=80"
                alt="Florence Tuscany Route"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="relative z-10 flex items-center justify-between text-white">
                <span className="bg-white/90 text-slate-900 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                  📍 Tuscany & Amalfi Route
                </span>
                <span className="bg-teal-600/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Planned: ₹95,000
                </span>
              </div>
              <div className="relative z-10 text-white">
                <h3 className="text-2xl font-bold font-heading">Day 3: Florence to Positano</h3>
                <p className="text-xs text-slate-200 mt-1">
                  Scenic coastal highway drive with sunset dining reservation
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                  <span>Uffizi Gallery FastPass</span>
                  <span className="text-blue-600">09:30 AM</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Audio tour confirmed • 2 Tickets</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                  <span>Trattoria ZaZa Truffle Lunch</span>
                  <span className="text-teal-600">01:00 PM</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Table reserved for 2 • AI Recommended</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 p-4">
                <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Copilot Insight</span>
                </div>
                <p className="text-xs text-slate-700">
                  High crowds expected at Duomo between 2–4 PM. Shifted Boboli Gardens visit to morning for optimal shade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Statistics Bar */}
      <section className="w-full bg-white border-y border-slate-200 py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#2563EB] font-heading">120,000+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Trips Planned Globally</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">99.4%</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Route Accuracy</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 font-heading flex items-center justify-center gap-1">
              <span>4.9</span>
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Rating on ProductHunt</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#14B8A6] font-heading">₹2.4 Cr+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Saved on Flight Budgets</div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="w-full py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Productivity Meets Wanderlust
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-heading mt-3 mb-4">
            Engineered like Linear. <br />
            Intuitive like Airbnb.
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Forget messy browser tabs, fragmented WhatsApp notes, and confusing spreadsheets. GlobeTrotter unifies logistics, maps, and budgeting in one responsive command hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MotionCard className="p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Route className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">AI Itinerary Engine</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Our algorithmic pathfinder clusters points of interest geographically. It minimizes commute times, optimizes opening hours, and prevents exhausting backtracks automatically.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Route Efficiency</span>
              <span className="text-teal-600 font-bold">+38% faster travel</span>
            </div>
          </MotionCard>

          <MotionCard className="p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">Smart Budget & Expense Tracking</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Automatic roll-up of activity costs, flight overheads, and accommodation deposits. Clear Planned vs. Remaining calculations so you never overspend.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Category Breakdown</span>
              <span className="text-blue-600 font-bold">Flights • Stays • Activities</span>
            </div>
          </MotionCard>

          <MotionCard className="p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">Community 1-Click Clone</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Browse battle-tested itineraries published by verified creators and solo explorers. Fork any public trip into your private workspace with a single click.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Verified Creators</span>
              <span className="text-orange-600 font-bold">1-Click Forking</span>
            </div>
          </MotionCard>

          <MotionCard className="p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">Smart Timeline & Calendar</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Switch seamlessly between Day, Week, and Timeline visualizers. Drag-and-drop reorder stops and activities with instantaneous resequencing.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Fluid Timeline</span>
              <span className="text-purple-600 font-bold">Drag-and-Drop</span>
            </div>
          </MotionCard>
        </div>
      </section>

      {/* 5. Popular Destinations */}
      <section id="destinations" className="w-full py-20 px-6 lg:px-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
                Curated Escapes
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading mt-2">
                Popular Destinations
              </h2>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="rounded-xl mt-4 md:mt-0 gap-2">
                <span>View All 50+ Cities</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_DESTINATIONS.map((dest) => (
              <MotionCard key={dest.name} className="overflow-hidden group cursor-pointer">
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-800 shadow-sm">
                    {dest.tag}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[11px] font-semibold text-white flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {dest.rating}
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-base text-slate-900 font-heading mb-1">{dest.name}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <span>{dest.duration}</span>
                    <span className="font-bold text-blue-600">From {dest.budget}</span>
                  </div>
                </div>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer CTA Section */}
      <section className="w-full py-20 px-6 lg:px-12 bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] text-white text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-4">
            Ready to plan your next adventure?
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-xl mb-8 leading-relaxed">
            Join over 120,000 travelers using GlobeTrotter AI to curate flawless multi-city journeys.
          </p>
          <Link href="/sign-up">
            <ShimmerButton
              shimmerColor="#ffffff"
              background="linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)"
              className="text-blue-700 font-bold px-8 py-4 text-base shadow-xl"
            >
              Start Planning Free Now →
            </ShimmerButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-10 px-6 lg:px-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
              GT
            </div>
            <span className="font-bold text-slate-900">GlobeTrotter AI</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <Link href="/explore" className="hover:text-blue-600">Explore</Link>
            <Link href="/community" className="hover:text-blue-600">Community</Link>
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

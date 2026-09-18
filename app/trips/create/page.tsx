'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  Heart,
  Flame,
  Baby,
  User,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { AIItineraryResult } from '@/types/database';

const TEMPLATES = [
  {
    id: 'solo',
    title: 'Solo Cultural Quest',
    desc: 'Deep local immersion, hostel cafes, and historic walks',
    icon: User,
    color: 'bg-blue-50 text-blue-600',
    prompt: 'Solo 5-day cultural and photography journey through Kyoto & Osaka on a moderate budget',
    days: 5,
    budget: 65000,
  },
  {
    id: 'adventure',
    title: 'High-Altitude Adventure',
    desc: 'Paragliding, trekking, mountain biking, and campfires',
    icon: Flame,
    color: 'bg-orange-50 text-orange-600',
    prompt: '6-day high thrills adventure in Manali & Solang Valley with rafting and trekking',
    days: 6,
    budget: 35000,
  },
  {
    id: 'honeymoon',
    title: 'Romantic Honeymoon',
    desc: 'Sunset dinners, private villas, and scenic coastal drives',
    icon: Heart,
    color: 'bg-rose-50 text-rose-600',
    prompt: 'Romantic 7-day luxury honeymoon in Amalfi Coast & Positano with private boat cruise',
    days: 7,
    budget: 120000,
  },
  {
    id: 'family',
    title: 'Family Explorer',
    desc: 'Kid-friendly parks, comfortable resorts, and relaxed pace',
    icon: Baby,
    color: 'bg-teal-50 text-teal-600',
    prompt: 'Family-friendly 5-day trip to Goa with beach resorts, water sports, and historic forts',
    days: 5,
    budget: 45000,
  },
];

function AITripCreatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState(searchParams.get('destination') || 'Japan');
  const [days, setDays] = useState(7);
  const [budget, setBudget] = useState(80000);
  const [prompt, setPrompt] = useState(
    searchParams.get('prompt') || 'I want a 7 day trip to Japan under ₹80,000 with friends'
  );
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<AIItineraryResult | null>(null);
  const [savingTrip, setSavingTrip] = useState(false);

  // Auto-generate if prompted from landing
  useEffect(() => {
    if (searchParams.get('prompt') || searchParams.get('destination')) {
      handleGenerate();
    }
  }, []);

  const handleSelectTemplate = (tpl: typeof TEMPLATES[0]) => {
    setPrompt(tpl.prompt);
    setDays(tpl.days);
    setBudget(tpl.budget);
    if (tpl.id === 'solo') setDestination('Kyoto, Japan');
    if (tpl.id === 'adventure') setDestination('Manali');
    if (tpl.id === 'honeymoon') setDestination('Amalfi, Italy');
    if (tpl.id === 'family') setDestination('Goa');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination || 'Japan',
          days: days,
          budget: budget,
          interests: ['culture', 'nature', 'food'],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setGeneratedResult(json.data);
      }
    } catch (e) {
      console.error('Generation failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAndSave = async () => {
    if (!generatedResult) return;
    setSavingTrip(true);

    try {
      // 1. Create trip row
      const tripRes = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${generatedResult.destination} Expedition (${days} Days)`,
          description: `AI-generated itinerary covering ${generatedResult.destination} with day-by-day activities.`,
          budget_total: budget,
          visibility: 'private',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + days * 86400000).toISOString().split('T')[0],
          cover_image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
        }),
      });

      if (!tripRes.ok) throw new Error('Failed to create trip');
      const tripJson = await tripRes.json();
      const newTripId = tripJson.data.id;

      // 2. Add Stops & Activities
      for (const day of generatedResult.days) {
        const stopRes = await fetch(`/api/trips/${newTripId}/stops`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: day.title || generatedResult.destination,
            country: generatedResult.destination,
            order_index: day.day - 1,
          }),
        });

        if (stopRes.ok) {
          const stopJson = await stopRes.json();
          const stopId = stopJson.data.id;

          for (const act of day.activities || []) {
            await fetch(`/api/trips/${newTripId}/stops/${stopId}/activities`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: act.title,
                category: act.category,
                cost: act.estimated_cost || 0,
                duration_minutes: act.duration_minutes || 90,
                notes: act.notes || null,
              }),
            });
          }
        }
      }

      // Navigate to Itinerary Builder
      router.push(`/trips/${newTripId}`);
    } catch (err) {
      console.error('Error saving generated trip:', err);
    } finally {
      setSavingTrip(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Copilot Trip Generator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            Design Your Trip with Pure AI Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Enter your natural travel desire or pick a curated template. Watch our AI cluster activities, balance budget, and optimize timelines.
          </p>
        </div>

        {/* 1. Large AI Prompt Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Trip Description / Prompt
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I want a 7 day trip to Japan under ₹80,000 with friends..."
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., Tokyo, Japan"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Duration (Days)</label>
              <input
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Total Budget (₹)</label>
              <input
                type="number"
                step={1000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing Itinerary (8s Circuit-Breaker)...' : 'Generate Full Itinerary →'}</span>
          </Button>
        </div>

        {/* 2. Curated Travel Templates */}
        <div>
          <h3 className="font-bold text-base text-slate-900 font-heading mb-4">
            Or Start From a Curated Template
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500/40 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl ${tpl.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 font-heading mb-1">{tpl.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{tpl.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>{tpl.days} Days</span>
                    <span className="text-blue-600">₹{tpl.budget.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Generated Results Preview Canvas */}
        {generatedResult && (
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  {generatedResult.fallback ? 'Verified Curated Itinerary' : 'AI Generated Itinerary'}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
                  {generatedResult.destination} — {generatedResult.days?.length || days} Day Journey
                </h3>
              </div>

              <Button
                onClick={handleAcceptAndSave}
                disabled={savingTrip}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6 shadow-md gap-2"
              >
                <span>{savingTrip ? 'Saving to Database...' : 'Save & Open Builder →'}</span>
              </Button>
            </div>

            {/* Day by day cards */}
            <div className="space-y-4">
              {generatedResult.days?.map((day) => (
                <div
                  key={day.day}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col md:flex-row gap-4 justify-between"
                >
                  <div className="md:w-1/3">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                      Day {day.day}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 font-heading mt-0.5">
                      {day.title}
                    </h4>
                  </div>

                  <div className="md:w-2/3 space-y-2">
                    {day.activities?.map((act, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white border border-slate-200/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="font-semibold text-slate-800">{act.title}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium text-[10px]">
                            {act.category}
                          </span>
                        </div>
                        <span className="font-bold text-slate-700">₹{act.estimated_cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function AITripCreatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <AITripCreatorContent />
    </Suspense>
  );
}

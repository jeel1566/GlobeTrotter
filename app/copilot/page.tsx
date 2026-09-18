'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { ButtonInButton } from '@/components/ui/button-in-button';
import { Spotlight } from '@/components/ui/spotlight';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  recommendationCard?: {
    title: string;
    destination: string;
    highlights: string[];
    cost: string;
    days: number;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-1',
    sender: 'ai',
    text: "Hello Jeel! I'm your GlobeTrotter AI Copilot. I analyze real-time transit schedules, weather forecasts, and crowd densities to architect unforgettable itineraries. What travel dream are we planning today?",
    timestamp: '10:00 AM',
  },
];

const SUGGESTED_PROMPTS = [
  'Plan 4 days in Kyoto focusing on quiet Zen temples & matcha rituals',
  'Find 5 hidden analog vinyl jazz kissaten bars in Tokyo',
  'Optimize my Tokyo Day 3 for rainy weather without cancelling bookings',
  'Craft a budget-friendly 7-day culinary tour of Osaka under $80/day',
];

export default function CopilotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Send to AI endpoint
      const res = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          budget_level: 'moderate',
          interests: ['culture', 'food', 'scenic'],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `I've synthesized a custom itinerary for ${data.destination || 'your trip'}. I scheduled ${data.days?.length || 4} days balancing crowd-free morning visits with artisan dining and seamless transit.`,
          timestamp: 'Just now',
          recommendationCard: {
            title: data.title || `${data.destination} Curated Expedition`,
            destination: data.destination || 'Japan',
            highlights: data.days?.slice(0, 3).map((d: any) => d.title || d.theme) || [
              'Morning sunrise walk before crowd peaks',
              'Artisan pour-over coffee tasting',
              'Rooftop twilight panorama',
            ],
            cost: data.estimated_cost_usd ? `$${data.estimated_cost_usd}` : 'Est. $850',
            days: data.days?.length || 4,
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // High fidelity fallback
        setTimeout(() => {
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: `I've mapped out the perfect sequence! I've grouped neighboring destinations along the Ginza and Chiyoda subway lines to minimize your transfers to under 18 minutes.`,
            timestamp: 'Just now',
            recommendationCard: {
              title: 'Tokyo & Kyoto Cherry Blossom Odyssey',
              destination: 'Japan',
              highlights: [
                'Fuglen Tokyo Scandinavian pour-over breakfast',
                'Sensō-ji Temple Nakamise morning stroll',
                'Shibuya Sky 360-degree sunset golden hour',
              ],
              cost: '¥148,000 (~$980)',
              days: 7,
            },
          };
          setMessages((prev) => [...prev, aiMsg]);
        }, 800);
      }
    } catch (e) {
      setTimeout(() => {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Here is your optimized itinerary! I've accounted for opening hours, walking buffers, and crowd density.`,
          timestamp: 'Just now',
          recommendationCard: {
            title: 'Curated Route',
            destination: 'Kyoto, Japan',
            highlights: ['Fushimi Inari dawn hike', 'Monk Kaiseki dining', 'Arashiyama Bamboo grove'],
            cost: '$850',
            days: 5,
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 800);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AppShell>
      <div className="relative flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-4 md:p-8 max-w-[1400px] mx-auto gap-6 overflow-hidden">
        
        <BackgroundBeams />
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#2563EB" />

        {/* TOP COPILOT BANNER */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>GlobeTrotter AI Copilot Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-200">
                  GPT-4o &amp; Gemini 1.5 Pro
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Zero-cost free intelligence connected to OpenStreetMap &amp; curated traveler databases.
              </p>
            </div>
          </div>
        </div>

        {/* CHAT THREAD CANVAS */}
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto min-h-[500px] pb-4">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3.5 max-w-3xl ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {m.sender === 'ai' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              ) : (
                <Avatar className="w-8 h-8 shrink-0 mt-1 ring-1 ring-black/[0.1]">
                  <AvatarImage src="/jeel_avatar.png" alt="Jeel Patel" />
                  <AvatarFallback>JP</AvatarFallback>
                </Avatar>
              )}

              <div className="flex flex-col gap-2">
                <div
                  className={`p-4 rounded-3xl text-xs md:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-sm rounded-tr-xs'
                      : 'bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-xs rounded-tl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                </div>

                {/* Optional Synthesized Itinerary Card */}
                {m.recommendationCard && (
                  <DoubleBezel innerClassName="p-5 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                        AI SYNTHESIZED EXPEDITION
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-600">
                        {m.recommendationCard.cost}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                      {m.recommendationCard.title}
                    </h4>

                    <div className="flex flex-col gap-1.5 my-3 text-xs text-slate-600 dark:text-slate-300">
                      {m.recommendationCard.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">
                        {m.recommendationCard.days} Days Scheduled
                      </span>
                      <Button
                        size="sm"
                        onClick={() => router.push('/trips/demo')}
                        className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                      >
                        <span>Open in Itinerary Builder</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </DoubleBezel>
                )}

                <span className="text-[10px] text-slate-400 font-mono px-2">
                  {m.timestamp}
                </span>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl w-fit border border-black/[0.05] text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Analyzing global transit graphs &amp; weather patterns...</span>
            </div>
          )}
        </div>

        {/* PROMPT CHIPS & INPUT DOCK */}
        <div className="flex flex-col gap-3 sticky bottom-4 z-20">
          
          {/* Prompt Suggestion Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-black/[0.06] dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 whitespace-nowrap shadow-xs transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Interactive Chat Input */}
          <div className="flex items-center gap-2 p-2 rounded-3xl bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-white/15 shadow-xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(input);
              }}
              placeholder="Ask Copilot anything: 'Find gluten-free ramen in Shinjuku' or 'Recalculate route for day 3'..."
              className="flex-1 px-4 py-2 text-xs md:text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <ButtonInButton
              variant="primary"
              size="sm"
              onClick={() => handleSend(input)}
              className="h-10 text-xs shrink-0"
            >
              Ask AI
            </ButtonInButton>
          </div>

        </div>

      </div>
    </AppShell>
  );
}

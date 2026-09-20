'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
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
    promptText?: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-1',
    sender: 'ai',
    text: "Hello! I'm your GlobeTrotter AI Copilot. I help structure day-by-day travel routes, suggest local activities, and estimate budgets using Groq and Gemini models. All generated itineraries are initial suggestions that you can review, edit, and save into your personal workspace.",
    timestamp: '10:00 AM',
  },
];

const SUGGESTED_PROMPTS = [
  'Plan 4 days in Kyoto focusing on quiet Zen temples & matcha rituals',
  'Find hidden analog vinyl jazz kissaten bars in Tokyo',
  'Plan a 5-day scenic mountain trail trip in Manali',
  'Craft a 3-day culinary tour of Goa under ₹15,000',
];

function extractDestinationFromText(text: string): string {
  const match = text.match(/(?:in|to|visit|for|around)\s+([A-Za-z\s]+?)(?:\s+(?:under|with|for|\d+|focusing|on|$))/i);
  if (match && match[1] && match[1].trim().length > 1) {
    return match[1].trim();
  }
  const clean = text.replace(/^(plan|find|craft|suggest|create)\s+/i, '').trim();
  return clean.split(' ')[0] || 'Kyoto';
}

function extractDaysFromText(text: string): number {
  const match = text.match(/(\d+)\s*(?:days?|d)/i);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    return Math.min(Math.max(num, 1), 10);
  }
  return 4;
}

export default function CopilotPage() {
  const router = useRouter();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const userName = user?.firstName || user?.fullName?.split(' ')[0] || 'Traveler';
  const userAvatar = user?.imageUrl || '';
  const userInitial = userName[0]?.toUpperCase() || 'T';

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const destination = extractDestinationFromText(userText);
    const days = extractDaysFromText(userText);

    try {
      // Send structured request to AI generator endpoint
      const res = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          days,
          budget: 25000,
          interests: ['culture', 'sightseeing', 'food'],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;

        const highlights = (data.days || []).slice(0, 3).map((d: any) => {
          const act = d.activities?.[0]?.title;
          return act ? `${d.theme || `Day ${d.day_number}`}: ${act}` : d.theme || `Day ${d.day_number}`;
        });

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `I've prepared a ${data.days?.length || days}-day route suggestion for ${data.destination || destination}. All generated stops and activities can be customized and saved into your trips.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendationCard: {
            title: data.title || `${destination} Itinerary Suggestion`,
            destination: data.destination || destination,
            highlights: highlights.length > 0 ? highlights : [
              'Morning landmark visits',
              'Local food & cultural stops',
              'Evening scenic views',
            ],
            cost: data.estimated_cost_usd ? `$${data.estimated_cost_usd}` : 'Estimated in Builder',
            days: data.days?.length || days,
            promptText: userText,
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Fallback transparent message
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `I've prepared a template route suggestion for ${destination}. You can inspect and tailor this itinerary directly in the creator form.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendationCard: {
            title: `${destination} Suggested Route`,
            destination,
            highlights: [
              'Recommended arrival & check-in',
              'City landmarks & local dining',
              'Cultural sights & departure plan',
            ],
            cost: 'Customizable in Builder',
            days,
            promptText: userText,
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Here is a suggested route structure for ${destination}. Open it in the trip creator to customize your exact dates and stops.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendationCard: {
          title: `${destination} Travel Plan`,
          destination,
          highlights: ['Arrival & orientation', 'Exploration & dining', 'Scenic excursion'],
          cost: 'Customizable in Builder',
          days,
          promptText: userText,
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
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
                <span>GlobeTrotter AI Assistant Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-200">
                  Groq &amp; Gemini Engine
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Interactive trip route suggestion assistant with transparent model fallback.
              </p>
            </div>
          </div>
        </div>

        {/* CHAT THREAD CANVAS */}
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto min-h-[480px] pb-4">
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
                  {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
                  <AvatarFallback className="text-xs bg-blue-600 text-white">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex flex-col gap-2">
                <div
                  className={`p-4 rounded-3xl text-xs md:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-xs rounded-tr-xs'
                      : 'bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-xs rounded-tl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                </div>

                {/* Synthesized Itinerary Card */}
                {m.recommendationCard && (
                  <DoubleBezel innerClassName="p-5 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                        AI SUGGESTION
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
                        {m.recommendationCard.days} Days Suggested
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/trips/create?destination=${encodeURIComponent(
                              m.recommendationCard?.destination || ''
                            )}&prompt=${encodeURIComponent(m.recommendationCard?.promptText || '')}`
                          )
                        }
                        className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                      >
                        <span>Open in Trip Creator</span>
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
              <span>Synthesizing day-by-day travel recommendations...</span>
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
              placeholder="Ask Copilot: 'Plan 4 days in Paris' or 'Find vegetarian cafes in Kyoto'..."
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

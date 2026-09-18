'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Sun,
  Cloud,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { ButtonInButton } from '@/components/ui/button-in-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface CalendarEvent {
  id: string;
  day: number; // 0 for Mon, 1 for Tue, ... 6 for Sun
  title: string;
  time: string;
  category: 'transit' | 'stay' | 'activity' | 'dining';
  color: string;
}

const WEEK_DAYS = [
  { name: 'MON', date: '14', temp: '23° / 15°', weather: 'sunny' },
  { name: 'TUE', date: '15', temp: '20° / 13°', weather: 'cloud' },
  { name: 'WED', date: '16', temp: '22° / 14°', weather: 'sunny', isToday: true },
  { name: 'THU', date: '17', temp: '24° / 16°', weather: 'sunny' },
  { name: 'FRI', date: '18', temp: '21° / 13°', weather: 'cloud' },
  { name: 'SAT', date: '19', temp: '23° / 15°', weather: 'sunny' },
  { name: 'SUN', date: '20', temp: '19° / 12°', weather: 'cloud' },
];

const EVENTS: CalendarEvent[] = [
  { id: '1', day: 0, title: 'JL 006 Touchdown NRT', time: '14:30', category: 'transit', color: 'bg-blue-600 text-white' },
  { id: '2', day: 0, title: 'Check-in: Hotel Gracery', time: '17:00', category: 'stay', color: 'bg-teal-600 text-white' },
  { id: '3', day: 0, title: 'Yakitori Alley Dinner', time: '19:30', category: 'dining', color: 'bg-amber-600 text-white' },
  { id: '4', day: 1, title: 'Meiji Shrine Morning', time: '09:00', category: 'activity', color: 'bg-indigo-600 text-white' },
  { id: '5', day: 1, title: 'Shibuya Scramble Crossing', time: '18:30', category: 'activity', color: 'bg-indigo-600 text-white' },
  { id: '6', day: 2, title: 'Fuglen Espresso', time: '09:00', category: 'dining', color: 'bg-amber-600 text-white' },
  { id: '7', day: 2, title: 'Sensō-ji Temple Asakusa', time: '10:30', category: 'activity', color: 'bg-indigo-600 text-white' },
  { id: '8', day: 2, title: 'Shibuya Sky Sunset (18:15)', time: '17:30', category: 'activity', color: 'bg-indigo-600 text-white' },
  { id: '9', day: 3, title: 'Shinkansen: Tokyo → Kyoto', time: '09:30', category: 'transit', color: 'bg-blue-600 text-white' },
  { id: '10', day: 3, title: 'Machiya Ryokan Check-in', time: '13:00', category: 'stay', color: 'bg-teal-600 text-white' },
  { id: '11', day: 4, title: 'Fushimi Inari Sunrise Hike', time: '06:30', category: 'activity', color: 'bg-indigo-600 text-white' },
  { id: '12', day: 4, title: 'Monk Kaiseki 7-Course', time: '19:00', category: 'dining', color: 'bg-amber-600 text-white' },
  { id: '13', day: 5, title: 'Arashiyama Bamboo Forest', time: '08:30', category: 'activity', color: 'bg-indigo-600 text-white' },
  { id: '14', day: 6, title: 'Nishiki Market Brunch', time: '10:30', category: 'dining', color: 'bg-amber-600 text-white' },
  { id: '15', day: 6, title: 'Haruka Express to KIX', time: '15:00', category: 'transit', color: 'bg-blue-600 text-white' },
];

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventList, setEventList] = useState(EVENTS);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDay, setNewEventDay] = useState(2);
  const [newEventTime, setNewEventTime] = useState('12:00');
  const [newEventCategory, setNewEventCategory] = useState<'transit' | 'stay' | 'activity' | 'dining'>('activity');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const colors = {
      transit: 'bg-blue-600 text-white',
      stay: 'bg-teal-600 text-white',
      activity: 'bg-indigo-600 text-white',
      dining: 'bg-amber-600 text-white',
    };

    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      day: Number(newEventDay),
      title: newEventTitle,
      time: newEventTime,
      category: newEventCategory,
      color: colors[newEventCategory],
    };

    setEventList([...eventList, newEv]);
    setIsAddEventOpen(false);
    setNewEventTitle('');
  };

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-6 max-w-[1720px] mx-auto gap-6">
        
        {/* TOP CONTROL BAR (Linear-style dense utility hub matching stitch_v2/07) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-black/[0.05] dark:border-white/10 shadow-sm">
          
          {/* Left: Trip Selector & Sync Status */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-black/[0.04] dark:border-white/5">
              <MapPin className="w-5 h-5 text-blue-600 ml-1" strokeWidth={1.5} />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Tokyo &amp; Kyoto Cherry Blossom &apos;25
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  May 14 – May 20, 2025
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-200">
                Confirmed
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Synced with GCal &amp; Apple iCal</span>
            </div>
          </div>

          {/* Center: Week Pagination */}
          <div className="flex items-center gap-2 self-start xl:self-auto">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-3 text-slate-900 dark:text-white font-mono">
                May 14 – 20, 2025
              </span>
              <button className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: View Modes & Add Event */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Month
              </button>
            </div>

            <Button
              onClick={() => setIsAddEventOpen(true)}
              className="rounded-full text-xs h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </Button>
          </div>

        </div>

        {/* ACTIVE LAYERS FILTER BAR */}
        <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Layers:
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Transit &amp; Flights (4)</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Stays &amp; Hotels (2)</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>Activities &amp; Entry (9)</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Dining Reservations (6)</span>
            </span>
          </div>

          <div className="font-mono text-[11px] text-slate-500 flex items-center gap-2">
            <span>Timezone: JST (UTC+9)</span>
            <span>•</span>
            <span className="text-teal-600 font-semibold">Auto-Adjusted from PDT</span>
          </div>
        </div>

        {/* 7-COLUMN CALENDAR VIEWPORT & SIDEBAR */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* 7-Columns Schedule Canvas (9 Cols) */}
          <div className="xl:col-span-9 bg-white dark:bg-slate-900 rounded-3xl border border-black/[0.05] dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header Day Row */}
            <div className="grid grid-cols-7 border-b border-black/[0.05] dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50 text-center">
              {WEEK_DAYS.map((wd, i) => (
                <div
                  key={i}
                  className={`py-3.5 px-2 flex flex-col items-center justify-center border-r border-black/[0.04] dark:border-white/5 last:border-r-0 ${
                    wd.isToday ? 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-600' : ''
                  }`}
                >
                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    {wd.name}
                  </span>
                  <span className={`text-base font-bold mt-0.5 ${wd.isToday ? 'text-blue-600' : 'text-slate-800 dark:text-slate-200'}`}>
                    {wd.date}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-1">
                    {wd.weather === 'sunny' ? (
                      <Sun className="w-3 h-3 text-amber-500" />
                    ) : (
                      <Cloud className="w-3 h-3 text-teal-500" />
                    )}
                    <span>{wd.temp}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Event Columns Grid */}
            <div className="grid grid-cols-7 min-h-[580px] divide-x divide-black/[0.04] dark:divide-white/5 p-2 bg-slate-50/30 dark:bg-slate-950/20">
              {WEEK_DAYS.map((_, dayIdx) => {
                const dayEvents = eventList.filter((e) => e.day === dayIdx);

                return (
                  <div key={dayIdx} className="flex flex-col gap-2 p-1.5">
                    {dayEvents.map((ev) => (
                      <motion.div
                        key={ev.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-2.5 rounded-xl text-xs font-semibold shadow-xs flex flex-col gap-0.5 ${ev.color}`}
                      >
                        <span className="text-[10px] opacity-80 font-mono">{ev.time}</span>
                        <span className="leading-tight line-clamp-2">{ev.title}</span>
                      </motion.div>
                    ))}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Utility Sidebar (3 Cols) */}
          <aside className="xl:col-span-3 flex flex-col gap-5">
            <DoubleBezel innerClassName="p-5 bg-white dark:bg-slate-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Flight Tracking &amp; Passes
              </h4>

              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-blue-600 font-bold">
                    <span>JL 006 (Japan Airlines)</span>
                    <span className="text-teal-600 font-mono">On Time</span>
                  </div>
                  <span className="text-slate-500">SFO 11:45 → NRT 14:30 (+1)</span>
                  <span className="text-[11px] font-mono text-slate-400">Terminal 2 • Gate 64</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-indigo-600 font-bold">
                    <span>Shinkansen Nozomi #215</span>
                    <span className="text-teal-600 font-mono">Reserved</span>
                  </div>
                  <span className="text-slate-500">Tokyo 09:30 → Kyoto 11:45</span>
                  <span className="text-[11px] font-mono text-slate-400">Car 7 • Seats 12A, 12B</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <ButtonInButton variant="glass" className="w-full h-11 text-xs">
                  Export to Google Calendar
                </ButtonInButton>
              </div>
            </DoubleBezel>
          </aside>

        </div>

        {/* DIALOG: ADD EVENT */}
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogContent className="sm:max-w-[440px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Add Calendar Event
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Create a reservation, flight leg, or custom scheduled activity.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateEvent} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flight Departure or Hotel Check-in"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Day
                  </label>
                  <select
                    value={newEventDay}
                    onChange={(e) => setNewEventDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {WEEK_DAYS.map((wd, idx) => (
                      <option key={idx} value={idx}>
                        {wd.name} (May {wd.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category Layer
                </label>
                <select
                  value={newEventCategory}
                  onChange={(e: any) => setNewEventCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activity">Activity &amp; Entry (Indigo)</option>
                  <option value="transit">Transit &amp; Flights (Blue)</option>
                  <option value="stay">Stays &amp; Hotels (Teal)</option>
                  <option value="dining">Dining Reservations (Amber)</option>
                </select>
              </div>

              <DialogFooter className="mt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddEventOpen(false)} className="rounded-full text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  Add to Calendar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AppShell>
  );
}

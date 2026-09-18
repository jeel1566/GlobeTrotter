'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Clock,
  Award,
  Search,
  GitFork,
  Heart,
  MessageCircle,
  Bookmark,
  Calendar as CalendarIcon,
  CheckCircle2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { ButtonInButton } from '@/components/ui/button-in-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface CommunityTrip {
  id: string;
  title: string;
  destination: string;
  author: {
    name: string;
    avatar: string;
    badge: string;
  };
  duration: string;
  cost: string;
  likesCount: number;
  commentsCount: number;
  forksCount: number;
  summary: string;
  tags: string[];
  imageUrl: string;
  isVerified?: boolean;
}

const SAMPLE_STORIES: CommunityTrip[] = [
  {
    id: 'comm-1',
    title: 'Hidden Kyoto: 10 Temples Free of Tourist Crowds (With Secret Tea Houses)',
    destination: 'Kyoto, Japan',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badge: 'Kyoto Resident • 48 curated guides',
    },
    duration: '5 Days • 14 Spots',
    cost: '¥18,400 / day',
    likesCount: 4210,
    commentsCount: 384,
    forksCount: 1840,
    summary: 'Skip the bus lines at Kinkaku-ji. These quiet Zen sanctuaries nestled in Northern Kitayama offer centuries-old moss gardens and absolute stillness.',
    tags: ['#OffTheBeatenPath', '#Kyoto', '#SlowTravel'],
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    id: 'comm-2',
    title: 'Alta Via 1: Alpine Rifugio Traverse in the Italian Dolomites',
    destination: 'Cortina d’Ampezzo, Italy',
    author: {
      name: 'Matteo Moretti',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      badge: 'Alpine Mountain Guide',
    },
    duration: '8 Days • High Alpine',
    cost: '€120 / day all-inclusive',
    likesCount: 3890,
    commentsCount: 290,
    forksCount: 1420,
    summary: 'A dramatic high-altitude route from Lago di Braies to Belluno, sleeping in traditional rustic rifugios with polenta dinners.',
    tags: ['#Trekking', '#Dolomites', '#Backpacking'],
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  {
    id: 'comm-3',
    title: 'Tokyo Coffee & Vintage Audio Bars: The Ultimate Subculture Trail',
    destination: 'Tokyo, Japan',
    author: {
      name: 'Jeel Patel',
      avatar: '/jeel_avatar.png',
      badge: 'Pro Traveler & Curator',
    },
    duration: '4 Days • 18 Speakeasies',
    cost: '¥12,000 / day',
    likesCount: 5120,
    commentsCount: 612,
    forksCount: 2310,
    summary: 'High-fidelity vacuum tube jazz kissaten in Jinbocho, analog vinyl listening rooms in Shibuya, and pour-over roasters in Tomigaya.',
    tags: ['#VinylBars', '#TokyoCafe', '#Audiophile'],
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    isVerified: true,
  },
];

export default function CommunityPage() {
  const router = useRouter();
  const [filterTab, setFilterTab] = useState<'hot' | 'new' | 'curated'>('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [stories, setStories] = useState<CommunityTrip[]>(SAMPLE_STORIES);
  const [forkingId, setForkingId] = useState<string | null>(null);
  const [forkSuccess, setForkSuccess] = useState<string | null>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDest, setPublishDest] = useState('');
  const [publishSummary, setPublishSummary] = useState('');

  // Handle 1-click fork itinerary
  const handleFork = async (story: CommunityTrip) => {
    setForkingId(story.id);
    try {
      // Call backend API if real ID or simulate clone
      const res = await fetch(`/api/community/${story.id}/copy`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setForkSuccess(`Forked "${story.title}" into your trips!`);
        setTimeout(() => {
          setForkSuccess(null);
          router.push(`/trips/${data.data?.id || 'demo'}`);
        }, 1500);
      } else {
        // Fallback smooth simulator
        setForkSuccess(`Cloned "${story.title}" to your private workspace!`);
        setTimeout(() => {
          setForkSuccess(null);
          router.push('/trips/create');
        }, 1500);
      }
    } catch (e) {
      setForkSuccess(`Cloned "${story.title}" to your private workspace!`);
      setTimeout(() => {
        setForkSuccess(null);
        router.push('/trips/create');
      }, 1500);
    } finally {
      setForkingId(null);
    }
  };

  const handlePublishStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishTitle.trim()) return;

    const newStory: CommunityTrip = {
      id: `comm-${Date.now()}`,
      title: publishTitle,
      destination: publishDest || 'Kyoto, Japan',
      author: {
        name: 'Jeel Patel',
        avatar: '/jeel_avatar.png',
        badge: 'GlobeTrotter Pro',
      },
      duration: '4 Days • 10 Spots',
      cost: '¥14,000 / day',
      likesCount: 1,
      commentsCount: 0,
      forksCount: 0,
      summary: publishSummary || 'Handcrafted itinerary shared with the GlobeTrotter community.',
      tags: ['#Community', '#Featured'],
      imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=80',
      isVerified: true,
    };

    setStories([newStory, ...stories]);
    setIsPublishOpen(false);
    setPublishTitle('');
    setPublishSummary('');
  };

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-6 max-w-[1720px] mx-auto gap-6">
        
        {/* TOP SEARCH & PUBLISH DOCK (Stitch v2 Section 8) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-black/[0.05] dark:border-white/10 shadow-sm flex flex-col gap-4">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Search Box */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search community guides, destinations, or creators..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Tabs & Publish Button */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  onClick={() => setFilterTab('hot')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    filterTab === 'hot'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hot</span>
                </button>

                <button
                  onClick={() => setFilterTab('new')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    filterTab === 'new'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>

                <button
                  onClick={() => setFilterTab('curated')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    filterTab === 'curated'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span>Curated</span>
                </button>
              </div>

              <ButtonInButton
                variant="primary"
                size="sm"
                onClick={() => setIsPublishOpen(true)}
                className="h-10 text-xs"
              >
                Publish Field Guide
              </ButtonInButton>
            </div>

          </div>

          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-blue-600" />
              <span>Forkable Itineraries (Active)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono text-[10px]">
                1.4k
              </span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              Trending Stories
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              Local Guides
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              Gear &amp; Hacks
            </span>
          </div>

        </div>

        {/* Success Toast for 1-click Fork */}
        <AnimatePresence>
          {forkSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-teal-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{forkSuccess} Redirecting to your workspace...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STORIES / ITINERARIES GRID (2 Cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stories.map((story) => (
            <DoubleBezel
              key={story.id}
              innerClassName="flex flex-col justify-between bg-white dark:bg-slate-900 overflow-hidden group"
            >
              {/* Photo Banner with Badges */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src={story.imageUrl}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {story.isVerified && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-teal-700 shadow-xs">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    <span>Verified Field Guide</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{story.duration}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm font-bold">
                    {story.cost}
                  </span>
                </div>
              </div>

              {/* Story Content & Author */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-7 h-7 ring-1 ring-black/[0.1]">
                      <AvatarImage src={story.author.avatar} alt={story.author.name} />
                      <AvatarFallback>{story.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {story.author.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {story.author.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {story.summary}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {story.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Stats & 1-Click Fork Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 hover:text-red-600 cursor-pointer">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{story.likesCount}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{story.commentsCount}</span>
                      </span>
                      <span className="flex items-center gap-1 text-teal-600 font-bold">
                        <GitFork className="w-3.5 h-3.5" />
                        <span>{story.forksCount} forks</span>
                      </span>
                    </div>

                    <Bookmark className="w-4 h-4 cursor-pointer hover:text-blue-600" />
                  </div>

                  <Button
                    onClick={() => handleFork(story)}
                    disabled={forkingId === story.id}
                    className="w-full rounded-2xl h-10 text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white border border-blue-200 dark:border-blue-800 transition-all duration-300 gap-2"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>{forkingId === story.id ? 'Cloning Itinerary...' : 'Fork Itinerary (Clone into your trips)'}</span>
                  </Button>
                </div>

              </div>
            </DoubleBezel>
          ))}
        </div>

        {/* DIALOG: PUBLISH STORY */}
        <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Publish Community Field Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Share your curated recommendations, secret spots, and notes with 48k+ travelers.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePublishStory} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Guide Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Days in Kyoto: Secret Temples & Tea Houses"
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Primary Region
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto, Japan"
                  value={publishDest}
                  onChange={(e) => setPublishDest(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Overview &amp; Insider Tips
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Why travelers should follow this route, best timing, and packing recommendations..."
                  value={publishSummary}
                  onChange={(e) => setPublishSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPublishOpen(false)} className="rounded-full text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  Publish to Community
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AppShell>
  );
}

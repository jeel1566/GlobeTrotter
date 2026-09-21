'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  Compass,
  LayoutDashboard,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  User,
  Sparkles,
  BarChart3,
  Plus,
  Search,
  Bot,
  Send,
  Menu,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trips', href: '/trips', icon: Compass },
  { name: 'Explore', href: '/explore', icon: MapPin },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
];

const ADMIN_NAV_ITEM: NavItem = {
  name: 'Admin',
  href: '/admin',
  icon: BarChart3,
  badge: 'Staff',
};

let cachedAdminStatus: boolean | null = null;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Admin status check: only users with admin role see Admin navigation
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (cachedAdminStatus !== null) return cachedAdminStatus;
    return (user?.publicMetadata as any)?.role === 'admin';
  });

  React.useEffect(() => {
    if ((user?.publicMetadata as any)?.role === 'admin') {
      cachedAdminStatus = true;
      setIsAdmin(true);
      return;
    }

    if (cachedAdminStatus !== null) {
      setIsAdmin(cachedAdminStatus);
      return;
    }

    let isMounted = true;
    async function checkRole() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const json = await res.json();
          cachedAdminStatus = !!json.isAdmin;
          if (isMounted) {
            setIsAdmin(cachedAdminStatus);
          }
        }
      } catch {
        // silent fail
      }
    }

    if (user) {
      checkRole();
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  const navItems = React.useMemo(() => {
    return isAdmin ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS;
  }, [isAdmin]);

  // Copilot Chat State
  const [copilotMessages, setCopilotMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; destination?: string }>
  >([
    {
      role: 'assistant',
      text: "Hello! I'm your GlobeTrotter AI Copilot. Where are you dreaming of traveling next? Ask me about destinations, local hidden gems, budgets, or building an itinerary.",
    },
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleSendCopilot = async () => {
    if (!copilotInput.trim() || isAiGenerating) return;
    const userMsg = copilotInput.trim();
    setCopilotInput('');
    const newHistory = [...copilotMessages, { role: 'user' as const, text: userMsg }];
    setCopilotMessages(newHistory);
    setIsAiGenerating(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCopilotMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.reply || 'I am ready to help you plan your journey!',
            destination: data.suggestedDestination || undefined,
          },
        ]);
      } else {
        setCopilotMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `I'm happy to help you with ${userMsg}! Ask me about budgets, best times to visit, or local experiences.`,
          },
        ]);
      }
    } catch {
      setCopilotMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Great choice! I have recommended spots and tips for ${userMsg}. What aspect would you like to know more about?`,
        },
      ]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Keyboard shortcut Cmd+K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row text-slate-800 antialiased">
      {/* 1. Left Navigation Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-slate-200/80 bg-white p-5 flex-shrink-0 min-h-screen sticky top-0 h-screen z-30">
        <div className="space-y-6">
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 px-1 pt-1 group">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none font-heading">
                GlobeTrotter
              </h1>
              <span className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase mt-1 inline-block">
                AI Travel OS
              </span>
            </div>
          </Link>

          {/* "+ Plan New Trip" CTA */}
          <Link href="/trips/create" className="block">
            <Button className="w-full bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-sm gap-2 font-semibold justify-center py-5">
              <Plus className="w-4 h-4" />
              <span>Create New Trip</span>
            </Button>
          </Link>

          {/* Main Navigation Menu */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {user?.fullName || user?.firstName || 'Traveler'}
                </span>
                {isAdmin && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 truncate">
                {user?.primaryEmailAddress?.emailAddress || 'Explorer'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
            title="Open AI Copilot"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
          {/* Mobile hamburger & brand */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
                GT
              </div>
              <span className="font-bold text-base font-heading text-slate-900">GlobeTrotter</span>
            </Link>
          </div>

          {/* Quick Search Palette Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200/60 w-80 transition-all text-left"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="flex-1">Search destinations, trips...</span>
            <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-400 shadow-xs">
              ⌘K
            </kbd>
          </button>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* AI Copilot Trigger Pill */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/60 text-xs font-semibold transition-all shadow-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            <Link href="/trips/create" className="hidden sm:block">
              <Button size="sm" className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>New Trip</span>
              </Button>
            </Link>

            <div className="md:hidden">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>

      {/* 3. Floating AI Copilot Assistant Button (Fixed Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsCopilotOpen(true)}
          className="relative group p-4 rounded-full bg-gradient-to-tr from-[#2563EB] via-blue-600 to-[#14B8A6] text-white shadow-[0_8px_30px_rgba(37,99,235,0.4)] flex items-center justify-center"
          title="Ask GlobeTrotter AI Copilot"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-400"></span>
          </span>
          <Bot className="w-6 h-6" />
        </motion.button>
      </div>

      {/* 4. AI Copilot Chat Drawer / Sheet */}
      <Sheet open={isCopilotOpen} onOpenChange={setIsCopilotOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col bg-white">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-teal-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 font-heading text-lg">AI Travel Copilot</h3>
                <span className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  Ready to optimize your journey
                </span>
              </div>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {copilotMessages.map((msg, idx) => (
              <div
                key={idx}
                className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}
              >
                <div
                  className={cn(
                    'max-w-[88%] rounded-2xl p-3.5 text-sm leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-slate-100/90 text-slate-800 border border-slate-200/80'
                  )}
                >
                  {msg.text}

                  {msg.destination && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-2">
                      <Link
                        href={`/trips/create?destination=${encodeURIComponent(msg.destination)}&prompt=${encodeURIComponent(`Trip to ${msg.destination}`)}`}
                        onClick={() => setIsCopilotOpen(false)}
                      >
                        <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 gap-1.5 shadow-xs font-semibold">
                          <Sparkles className="w-3 h-3" />
                          <span>Plan Trip to {msg.destination} →</span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isAiGenerating && (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-3 bg-slate-50 border border-slate-200/60 rounded-2xl w-fit">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>Copilot is thinking...</span>
              </div>
            )}
          </div>

          {/* Copilot Input Footer */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2 bg-slate-100/90 rounded-2xl p-1.5 border border-slate-200/80 focus-within:border-blue-500/50 focus-within:bg-white transition-all">
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
                placeholder="Ask anything: '5-day trip to Tokyo under ₹60k'..."
                className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <Button
                size="sm"
                onClick={handleSendCopilot}
                disabled={isAiGenerating || !copilotInput.trim()}
                className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white h-9 px-3"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 5. Command Search Dialog (Cmd+K) */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput placeholder="Type a destination, city, or feature..." />
        <CommandList>
          <CommandEmpty>No destinations found.</CommandEmpty>
          <CommandGroup heading="Quick Navigation">
            <CommandItem onSelect={() => { router.push('/dashboard'); setIsSearchOpen(false); }}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/trips/create'); setIsSearchOpen(false); }}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create AI Trip</span>
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/explore'); setIsSearchOpen(false); }}>
              <MapPin className="mr-2 h-4 w-4" />
              <span>Explore Destinations & Map</span>
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/community'); setIsSearchOpen(false); }}>
              <Users className="mr-2 h-4 w-4" />
              <span>Community Stories</span>
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/calendar'); setIsSearchOpen(false); }}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Trip Calendar</span>
            </CommandItem>
            {isAdmin && (
              <CommandItem onSelect={() => { router.push('/admin'); setIsSearchOpen(false); }}>
                <BarChart3 className="mr-2 h-4 w-4 text-purple-600" />
                <span>Admin & System Telemetry</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* 6. Mobile Navigation Drawer */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold">
              GT
            </div>
            <span className="font-bold text-lg font-heading">GlobeTrotter</span>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 font-medium text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

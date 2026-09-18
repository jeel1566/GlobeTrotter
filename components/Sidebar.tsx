"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Luggage,
  CalendarDays,
  Wallet,
  Compass,
  User,
  Settings,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface SidebarProps {
  onOpenAI?: () => void;
}

export default function Sidebar({ onOpenAI }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "My Trips", href: "/trips", icon: Luggage },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Budget", href: "/budget", icon: Wallet },
    { name: "Community", href: "/community", icon: Compass },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/" && (pathname === "/" || pathname === "/dashboard")) return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full p-6">
      <div className="space-y-7">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3.5 group px-1">
          <div className="relative p-1 rounded-2xl bg-black/[0.03] ring-1 ring-black/[0.06] transition-transform duration-500 ease-luxury group-hover:scale-105">
            <div className="w-10 h-10 rounded-[calc(1rem-2px)] bg-obsidian-900 flex items-center justify-center text-[#faf9f6] shadow-hardware">
              <svg className="w-5 h-5 text-brand-200" fill="currentColor" viewBox="0 0 36 36">
                <path d="M18 4L5 27h26L18 4zm0 6.5l8.5 14.5H9.5L18 10.5z" opacity="0.9" />
                <path d="M12 21l3-5 5 8H8l4-3z" fill="#1aa898" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-obsidian-900 leading-none block font-sans">
              GlobeTrotter
            </span>
            <span className="text-[10px] text-obsidian-900/40 uppercase tracking-[0.2em] font-semibold mt-1 block">
              Autonomous Travel
            </span>
          </div>
        </Link>

        {/* Ask AI Copilot Button - Button-in-Button Architecture */}
        {onOpenAI && (
          <button
            onClick={onOpenAI}
            className="w-full group relative p-1.5 pl-4 pr-1.5 rounded-full bg-obsidian-900 text-white flex items-center justify-between shadow-hardware hover:bg-obsidian-850 active:scale-[0.98] transition-all duration-500 ease-luxury"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide text-[#faf9f6]">
                Ask AI Copilot
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 ease-luxury group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" strokeWidth={1.4} />
            </div>
          </button>
        )}

        {/* Primary Navigation - Doppelrand Active Styling */}
        <nav aria-label="Main Navigation" className="space-y-1">
          <p className="px-3 text-[10px] uppercase tracking-[0.2em] font-bold text-obsidian-900/35 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-xs tracking-tight transition-all duration-500 ease-luxury ${
                  active
                    ? "bg-white text-obsidian-900 font-semibold shadow-hardware ring-1 ring-black/[0.05]"
                    : "text-obsidian-900/60 hover:text-obsidian-900 hover:bg-black/[0.03]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors duration-300 ${
                      active ? "text-obsidian-900" : "text-obsidian-900/40 group-hover:text-obsidian-900"
                    }`}
                    strokeWidth={1.3}
                  />
                  <span>{item.name}</span>
                </div>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-5 pt-5 border-t border-black/[0.05]">
        {/* Doppelrand Inspirational Editorial Card */}
        <div className="p-1 rounded-[1.75rem] bg-black/[0.03] ring-1 ring-black/[0.04]">
          <div className="relative rounded-[calc(1.75rem-0.25rem)] overflow-hidden min-h-[145px] p-4 flex flex-col justify-between bg-obsidian-950 text-white shadow-hardware group">
            <img
              alt="Coastal atmosphere"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-700 ease-luxury"
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent" />
            
            <div className="relative z-10">
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[9px] uppercase tracking-[0.18em] font-medium text-brand-200 border border-white/10">
                Philosophy
              </span>
            </div>

            <div className="relative z-10 font-serif italic text-lg font-normal leading-snug text-white/95">
              &ldquo;Good plans lead to great stories.&rdquo;
            </div>

            <div className="relative z-10 flex items-center justify-between text-[10px] text-white/60 font-sans font-medium">
              <span>Autumn 2026</span>
              <span className="text-brand-300">Edition No. 04</span>
            </div>
          </div>
        </div>

        {/* Quick Settings & Help */}
        <div className="flex items-center justify-between px-2 text-[11px] text-obsidian-900/40">
          <button className="flex items-center gap-1.5 hover:text-obsidian-900 transition-colors duration-300">
            <Settings className="w-3.5 h-3.5" strokeWidth={1.3} />
            <span>Preferences</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-obsidian-900 transition-colors duration-300">
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.3} />
            <span>Concierge</span>
          </button>
        </div>

        {/* Doppelrand Traveler Identity Pill */}
        <Link
          href="/profile"
          className="group p-1 rounded-2xl bg-black/[0.02] ring-1 ring-black/[0.04] hover:bg-black/[0.04] transition-all duration-500 ease-luxury block"
        >
          <div className="rounded-[calc(1rem-2px)] bg-white p-2.5 flex items-center justify-between shadow-hardware">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Jeel Patel"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-black/[0.08]"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-obsidian-900 truncate group-hover:text-brand-700 transition-colors">
                  Jeel Patel
                </p>
                <p className="text-[10px] text-obsidian-900/40 truncate">Solo Explorer</p>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-obsidian-900/30 group-hover:text-obsidian-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={1.4} />
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Island Top Bar */}
      <div className="md:hidden sticky top-3 z-40 px-4 mb-2">
        <div className="flex items-center justify-between p-3 px-4 rounded-full bg-white/85 backdrop-blur-xl border border-black/[0.06] shadow-hardware">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-obsidian-900 flex items-center justify-center text-white">
              <svg className="w-4 h-4 text-brand-200" fill="currentColor" viewBox="0 0 36 36">
                <path d="M18 4L5 27h26L18 4zm0 6.5l8.5 14.5H9.5L18 10.5z" opacity="0.9" />
                <path d="M12 21l3-5 5 8H8l4-3z" fill="#1aa898" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight text-obsidian-900 font-sans">
              GlobeTrotter
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {onOpenAI && (
              <button
                onClick={onOpenAI}
                className="w-8 h-8 rounded-full bg-obsidian-900 text-white flex items-center justify-center shadow-hardware"
                aria-label="Ask AI Copilot"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-200" strokeWidth={1.4} />
              </button>
            )}
            
            {/* Hamburger Button with Custom Fluid Morph */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 rounded-full bg-black/[0.04] text-obsidian-900 flex flex-col items-center justify-center gap-1.5"
              aria-label="Toggle Navigation Menu"
            >
              <span
                className={`w-4 h-0.5 bg-obsidian-900 rounded-full transition-transform duration-300 ease-luxury ${
                  mobileOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-4 h-0.5 bg-obsidian-900 rounded-full transition-opacity duration-300 ease-luxury ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`w-4 h-0.5 bg-obsidian-900 rounded-full transition-transform duration-300 ease-luxury ${
                  mobileOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Persistent Architectural Column */}
      <aside
        className="hidden md:flex w-72 bg-canvas border-r border-black/[0.05] flex-col flex-shrink-0 min-h-[100dvh] sticky top-0 h-[100dvh] overflow-y-auto"
        data-purpose="sidebar"
      >
        {navContent}
      </aside>

      {/* Mobile High-Glass Modal Reveal */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-300">
          <div
            className="fixed inset-0 bg-obsidian-950/60 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-canvas h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-500 ease-luxury border-r border-black/[0.06]">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}

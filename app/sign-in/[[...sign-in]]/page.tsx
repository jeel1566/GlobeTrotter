import React from 'react';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { Compass, Sparkles, CheckCircle2, Quote } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAFAFA]">
      {/* Left: Cinematic Travel Photography & Social Proof */}
      <div className="relative w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden min-h-[460px] lg:min-h-screen">
        {/* Mount Fuji Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />
        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-900/30" />
        <div className="absolute inset-0 bg-blue-900/15 mix-blend-overlay" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 font-heading text-lg">GlobeTrotter</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              AI OS
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Mount Fuji, JP · 05:48 JST</span>
          </div>
        </div>

        {/* Center Tagline */}
        <div className="relative z-10 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Featured in Vogue Travel & TechCrunch</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight font-heading max-w-lg">
            Plan, wander, and conquer borders.
          </h2>
        </div>

        {/* Inspirational Quote Card with Explorer Avatars */}
        <div className="relative z-10 bg-white/85 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/40 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm italic font-medium text-slate-900 leading-snug">
                &quot;Travel is the only thing you buy that makes you richer.&quot;
              </p>
              <span className="text-xs text-slate-500 mt-1 block">— Anonymous Explorer</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img
                  className="w-7 h-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Explorer"
                />
                <img
                  className="w-7 h-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Explorer"
                />
                <img
                  className="w-7 h-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="Explorer"
                />
                <div className="w-7 h-7 rounded-full ring-2 ring-white bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold">
                  +48k
                </div>
              </div>
              <span className="font-semibold text-slate-700">48,000+ Explorers Joined</span>
            </div>
            <div className="flex items-center gap-1 text-teal-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>99.98% Sync Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Clerk Sign-In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md flex flex-col items-center">
          <SignIn routing="path" path="/sign-in" />
        </div>
      </div>
    </div>
  );
}

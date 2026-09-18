import React from 'react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { Compass, Sparkles, CheckCircle2, Quote } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAFAFA]">
      {/* Left: Cinematic Travel Photography & Social Proof */}
      <div className="relative w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden min-h-[460px] lg:min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />
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
            <span>Join 48,000+ Smart Explorers</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight font-heading max-w-lg">
            Start building your dream journey in seconds.
          </h2>
        </div>

        {/* Quote Card */}
        <div className="relative z-10 bg-white/85 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/40 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm italic font-medium text-slate-900 leading-snug">
                &quot;Not all those who wander are lost.&quot;
              </p>
              <span className="text-xs text-slate-500 mt-1 block">— J.R.R. Tolkien</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
            <div className="flex items-center gap-1 text-blue-600 font-semibold">
              <span>Free Account • No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1 text-teal-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Instant Cloud Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Clerk Sign-Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md flex flex-col items-center">
          <SignUp routing="path" path="/sign-up" />
        </div>
      </div>
    </div>
  );
}

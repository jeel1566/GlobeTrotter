'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden select-none -z-10',
        className
      )}
    >
      <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[130px] mix-blend-multiply pointer-events-none" />
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.025] stroke-slate-950 dark:stroke-white pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="luxury-grid-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 48 0 L 0 0 0 48" fill="none" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#luxury-grid-pattern)" />
      </svg>
    </div>
  );
}

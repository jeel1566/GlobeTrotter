import React from 'react';
import { cn } from '@/lib/utils';

interface DoubleBezelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glow?: boolean;
}

/**
 * Double-Bezel (Doppelrand) hardware enclosure from high-end-visual-design.
 * Features an outer machined shell with hairline borders,
 * concentric padding, and an inner specular-highlight core.
 */
export function DoubleBezel({
  children,
  className,
  innerClassName,
  glow = false,
  ...props
}: DoubleBezelProps) {
  return (
    <div
      className={cn(
        'relative p-2 rounded-[2rem] bg-gradient-to-b from-black/[0.04] to-black/[0.01] dark:from-white/[0.06] dark:to-white/[0.02]',
        'ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)]',
        'transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group',
        glow && 'hover:ring-blue-500/30 hover:shadow-[0_16px_50px_rgba(37,99,235,0.08)]',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative rounded-[calc(2rem-0.5rem)] bg-white dark:bg-slate-900 overflow-hidden',
          'border border-black/[0.03] dark:border-white/[0.06]',
          'shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

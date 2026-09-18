'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonInButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'dark' | 'glass';
  size?: 'default' | 'lg' | 'sm';
}

/**
 * Button-in-Button Trailing Icon & Island Button Architecture
 * Features fully rounded pill geometry, magnetic kinetic tension, and nested circular trailing icon wrapper.
 */
export function ButtonInButton({
  children,
  icon,
  variant = 'primary',
  size = 'default',
  className,
  ...props
}: ButtonInButtonProps) {
  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_25px_rgba(37,99,235,0.25)] ring-1 ring-blue-400/30',
    secondary:
      'bg-teal-500 hover:bg-teal-600 text-white shadow-[0_10px_25px_rgba(20,184,166,0.25)] ring-1 ring-teal-300/30',
    dark:
      'bg-slate-900 hover:bg-black text-white shadow-[0_10px_25px_rgba(15,23,42,0.2)] ring-1 ring-white/10',
    glass:
      'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-white backdrop-blur-xl ring-1 ring-black/[0.08] dark:ring-white/15 shadow-[0_8px_20px_rgba(0,0,0,0.04)]',
  };

  const iconCircleStyles = {
    primary: 'bg-white/15 text-white',
    secondary: 'bg-white/15 text-white',
    dark: 'bg-white/10 text-white',
    glass: 'bg-black/[0.06] dark:bg-white/10 text-slate-900 dark:text-white',
  };

  const sizeStyles = {
    sm: 'h-10 pl-4 pr-1 text-xs',
    default: 'h-12 pl-6 pr-1.5 text-sm',
    lg: 'h-14 pl-8 pr-2 text-base',
  };

  const iconSizeStyles = {
    sm: 'w-7 h-7',
    default: 'w-9 h-9',
    lg: 'w-10 h-10',
  };

  return (
    <button
      className={cn(
        'group relative inline-flex items-center justify-between rounded-full font-semibold',
        'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <span className="tracking-tight whitespace-nowrap">{children}</span>
      <div
        className={cn(
          'rounded-full flex items-center justify-center ml-3 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105',
          iconCircleStyles[variant],
          iconSizeStyles[size]
        )}
      >
        {icon || <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />}
      </div>
    </button>
  );
}

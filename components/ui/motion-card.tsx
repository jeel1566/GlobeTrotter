'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MotionCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
}

export function MotionCard({
  children,
  className,
  hoverScale = 1.015,
  ...props
}: MotionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: hoverScale }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(15,118,110,0.08)] hover:border-teal-600/30 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

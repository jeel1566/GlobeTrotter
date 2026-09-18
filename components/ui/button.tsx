'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#0F766E] text-white shadow-[0_2px_10px_rgba(15,118,110,0.25)] hover:bg-[#0D3D38] hover:shadow-[0_4px_16px_rgba(15,118,110,0.35)]',
        destructive:
          'bg-red-500 text-white shadow-sm hover:bg-red-600',
        outline:
          'border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300',
        secondary:
          'bg-[#E6F3F1] text-[#0F766E] hover:bg-[#D9E9E6]',
        ghost:
          'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
        link:
          'text-[#0F766E] underline-offset-4 hover:underline',
        accent:
          'bg-amber-500 text-white shadow-[0_2px_10px_rgba(245,158,11,0.25)] hover:bg-amber-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-6 text-base',
        icon: 'h-9 w-9 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

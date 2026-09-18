'use client';

import * as React from 'react';
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet';
import { cn } from '@/lib/utils';

export function Drawer({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (_open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children}
    </Sheet>
  );
}

export const DrawerTrigger = SheetTrigger;
export const DrawerClose = SheetClose;

export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SheetContent>
>(({ className, children, ...props }, ref) => (
  <SheetContent
    side="bottom"
    ref={ref}
    className={cn('max-h-[85vh] overflow-y-auto rounded-t-[2.5rem] px-6 py-8', className)}
    {...props}
  >
    <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-300" />
    {children}
  </SheetContent>
));
DrawerContent.displayName = 'DrawerContent';

export const DrawerHeader = SheetHeader;
export const DrawerFooter = SheetFooter;
export const DrawerTitle = SheetTitle;
export const DrawerDescription = SheetDescription;

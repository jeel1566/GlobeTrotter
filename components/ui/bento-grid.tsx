import React from 'react';
import { cn } from '@/lib/utils';

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'grid md:auto-rows-[19rem] grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  onClick,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input p-5 bg-white border border-slate-200/80 justify-between flex flex-col space-y-4 hover:border-teal-500/40 cursor-pointer',
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-1 transition duration-200">
        {icon}
        <div className="font-bold text-slate-800 mb-1 mt-2 text-base">
          {title}
        </div>
        <div className="font-normal text-slate-500 text-xs line-clamp-2">
          {description}
        </div>
      </div>
    </div>
  );
};

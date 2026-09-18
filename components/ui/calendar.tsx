'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';

export interface CalendarProps {
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  mode?: string;
}

export function Calendar({
  selectedDate,
  onSelectDate,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selectedDate || new Date());

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className={cn('p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm w-fit', className)}>
      <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 py-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate && onSelectDate(day)}
              className={cn(
                'h-9 w-9 text-xs rounded-xl flex items-center justify-center font-medium transition-all',
                !isCurrentMonth && 'text-slate-300',
                isCurrentMonth && !isSelected && 'text-slate-700 hover:bg-slate-100',
                isCurrentDay && !isSelected && 'border border-teal-600 font-bold text-teal-700',
                isSelected && 'bg-[#0F766E] text-white font-bold shadow-md'
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

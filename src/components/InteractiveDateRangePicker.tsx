import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (startDate: string, endDate: string) => void;
  minDate?: string;
}

export const InteractiveDateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  minDate = '2026-08-14'
}) => {
  // Parse initial month from startDate or default to August 2026
  const initialDate = startDate ? new Date(startDate + 'T00:00:00') : new Date('2026-08-01T00:00:00');
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper formatting YYYY-MM-DD
  const formatDateString = (y: number, m: number, d: number): string => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Days array
  const calendarDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean; isFriday: boolean; isSaturday: boolean }> = [];

  // Pad previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const pDay = prevMonthDays - i;
    const pDate = new Date(year, month - 1, pDay);
    const dateStr = formatDateString(pDate.getFullYear(), pDate.getMonth(), pDay);
    calendarDays.push({
      dateStr,
      dayNum: pDay,
      isCurrentMonth: false,
      isFriday: pDate.getDay() === 5,
      isSaturday: pDate.getDay() === 6
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = formatDateString(year, month, d);
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isFriday: dateObj.getDay() === 5,
      isSaturday: dateObj.getDay() === 6
    });
  }

  // Handle cell click
  const handleDateClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      // First click: select start date (if Friday, auto set Sunday check-out, or set start date)
      const clickedObj = new Date(dateStr + 'T00:00:00');
      const day = clickedObj.getDay();
      
      if (day === 5) {
        // If Friday clicked, auto-select Friday to Sunday range for convenience
        const sunObj = new Date(clickedObj.getTime() + 2 * 24 * 3600 * 1000);
        const sunStr = formatDateString(sunObj.getFullYear(), sunObj.getMonth(), sunObj.getDate());
        onChange(dateStr, sunStr);
      } else {
        // Single start date selected, set checkOut to next day
        const nextObj = new Date(clickedObj.getTime() + 24 * 3600 * 1000);
        const nextStr = formatDateString(nextObj.getFullYear(), nextObj.getMonth(), nextObj.getDate());
        onChange(dateStr, nextStr);
      }
    } else {
      // Second click: select end date
      if (dateStr < startDate) {
        onChange(dateStr, startDate);
      } else {
        onChange(startDate, dateStr);
      }
    }
  };

  // Helper check if in range
  const isInRange = (dateStr: string) => {
    if (startDate && endDate) {
      return dateStr >= startDate && dateStr <= endDate;
    }
    if (startDate && hoverDate) {
      const start = startDate < hoverDate ? startDate : hoverDate;
      const end = startDate < hoverDate ? hoverDate : startDate;
      return dateStr >= start && dateStr <= end;
    }
    return false;
  };

  // Calculate total nights
  const getNightsCount = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const diffTime = end.getTime() - start.getTime();
    return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  };

  const nights = getNightsCount();

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#FF385C]" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-white font-display">
            {monthName}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span className="text-rose-500 font-extrabold">Fri 🕯️</span>
        <span className="text-rose-500 font-extrabold">Sat ⛪</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((d, idx) => {
          const isSelectedStart = d.dateStr === startDate;
          const isSelectedEnd = d.dateStr === endDate;
          const range = isInRange(d.dateStr);

          let bgClass = 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60';
          
          if (isSelectedStart || isSelectedEnd) {
            bgClass = 'bg-[#FF385C] text-white font-extrabold shadow-md scale-105 z-10';
          } else if (range) {
            bgClass = 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 font-bold';
          } else if (!d.isCurrentMonth) {
            bgClass = 'bg-transparent text-slate-300 dark:text-slate-700 opacity-40';
          } else if (d.isFriday || d.isSaturday) {
            bgClass = 'bg-rose-50/80 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 font-semibold border border-rose-200/50 dark:border-rose-900/50';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDateClick(d.dateStr)}
              onMouseEnter={() => setHoverDate(d.dateStr)}
              onMouseLeave={() => setHoverDate(null)}
              className={`relative h-10 rounded-xl flex flex-col items-center justify-center text-xs transition-all ${bgClass}`}
            >
              <span>{d.dayNum}</span>
              {(d.isFriday || d.isSaturday) && d.isCurrentMonth && !isSelectedStart && !isSelectedEnd && (
                <span className="w-1 h-1 rounded-full bg-rose-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Range Summary Bar */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {startDate} <span className="text-slate-400 font-normal">to</span> {endDate}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[#FF385C] font-extrabold text-[10px]">
            {nights} {nights === 1 ? 'Night' : 'Nights'}
          </span>
        </div>

        <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-[#FF385C]" />
          <span>Click Friday for automatic Sabbath weekend range</span>
        </div>
      </div>
    </div>
  );
};

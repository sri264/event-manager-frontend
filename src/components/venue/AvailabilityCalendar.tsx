import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { PriceUnit } from '@/types/venue';

const ISO = 'YYYY-MM-DD';
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface AvailabilityCalendarProps {
  booked: string[];
  priceUnit: PriceUnit;
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  maxUnits?: number;
}

/** The occupied dates a range covers: every day for halls/pools, every night (not checkout) for rooms. */
const occupiedDates = (start: string, end: string, unit: PriceUnit) => {
  const dates: string[] = [];
  const last = unit === 'night' ? dayjs(end).subtract(1, 'day') : dayjs(end);
  for (let d = dayjs(start); !d.isAfter(last); d = d.add(1, 'day')) dates.push(d.format(ISO));
  return dates;
};

export function AvailabilityCalendar({
  booked,
  priceUnit,
  start,
  end,
  onChange,
  maxUnits = 30,
}: AvailabilityCalendarProps) {
  const bookedSet = useMemo(() => new Set(booked), [booked]);
  const today = dayjs().format(ISO);
  const [month, setMonth] = useState(() => dayjs(start || today).startOf('month'));
  const [picking, setPicking] = useState(() => !!start);

  const cells = useMemo(() => {
    const first = month.startOf('month');
    const blanks = Array.from({ length: first.day() }, () => null);
    const days = Array.from({ length: month.daysInMonth() }, (_, i) =>
      first.add(i, 'day').format(ISO),
    );
    return [...blanks, ...days];
  }, [month]);

  const isNight = priceUnit === 'night';

  const select = (date: string) => {
    if (date < today) return;
    if (!picking || !start || date < start || (isNight && date === start)) {
      if (bookedSet.has(date)) return;
      const defaultEnd = isNight ? dayjs(date).add(1, 'day').format(ISO) : date;
      onChange(date, defaultEnd);
      setPicking(true);
      return;
    }
    const units = isNight ? dayjs(date).diff(start, 'day') : dayjs(date).diff(start, 'day') + 1;
    const clash = occupiedDates(start, date, priceUnit).some(d => bookedSet.has(d));
    if (clash || units > maxUnits) {
      if (!bookedSet.has(date)) {
        onChange(date, isNight ? dayjs(date).add(1, 'day').format(ISO) : date);
      }
      return;
    }
    onChange(start, date);
    setPicking(false);
  };

  const inRange = (date: string) => start && end && date >= start && date <= end;
  const canGoBack = month.isAfter(dayjs().startOf('month'));

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(m => m.subtract(1, 'month'))}
          disabled={!canGoBack}
          className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-bold text-navy">{month.format('MMMM YYYY')}</p>
        <button
          type="button"
          onClick={() => setMonth(m => m.add(1, 'month'))}
          className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map(day => (
          <span key={day} className="py-1 font-semibold text-muted-foreground">
            {day}
          </span>
        ))}
        {cells.map((date, index) => {
          if (!date) return <span key={`blank-${index}`} />;
          const past = date < today;
          const taken = bookedSet.has(date);
          const edge = date === start || date === end;
          return (
            <button
              key={date}
              type="button"
              disabled={past || (taken && !isNight)}
              onClick={() => select(date)}
              title={taken ? 'Already booked' : undefined}
              className={cn(
                'aspect-square rounded-lg text-sm font-medium transition-colors',
                past && 'cursor-not-allowed text-slate-300',
                !past &&
                  taken &&
                  'bg-rose-50 text-rose-400 line-through disabled:cursor-not-allowed',
                !past && !taken && 'hover:bg-secondary',
                inRange(date) && !edge && 'bg-primary/15 text-primary',
                edge && 'bg-primary text-white hover:bg-primary',
              )}
            >
              {dayjs(date).date()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-rose-100" /> Booked
        </span>
        <span>
          {picking
            ? isNight
              ? 'Now pick your check-out date'
              : 'Pick an end date (or keep a single day)'
            : ''}
        </span>
      </div>
    </div>
  );
}

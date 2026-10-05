import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ErrorState, Spinner } from '@/components/common/DataStates';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { dashboardApi } from '@/lib/api/admin';
import { adminVenuesApi } from '@/lib/api/venues';
import { VENUE_TYPE_LABEL } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types/models';
import { BookingViewModal } from './components/BookingViewModal';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CHIP: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  COMPLETED: 'bg-primary/10 text-primary border-primary/20',
};

export default function AdminCalendarPage() {
  const [month, setMonth] = useState(() => dayjs().startOf('month'));
  const [venueId, setVenueId] = useState('');
  const [viewId, setViewId] = useState<number | null>(null);
  const monthKey = month.format('YYYY-MM');

  const venues = useQuery({
    queryKey: ['admin', 'venues', 'picker-all'],
    queryFn: () => adminVenuesApi.list({ status: 'all', limit: 100 }),
  });
  const query = useQuery({
    queryKey: ['admin', 'calendar', monthKey, venueId],
    queryFn: () => dashboardApi.calendar(monthKey, Number(venueId) || undefined),
    placeholderData: keepPreviousData,
  });

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of query.data?.bookings ?? []) {
      for (
        let d = dayjs(booking.startDate);
        !d.isAfter(booking.endDate, 'day');
        d = d.add(1, 'day')
      ) {
        const key = d.format('YYYY-MM-DD');
        map.set(key, [...(map.get(key) ?? []), booking]);
      }
    }
    return map;
  }, [query.data]);

  const cells = useMemo(() => {
    const first = month.startOf('month');
    const blanks = Array.from({ length: first.day() }, () => null);
    const days = Array.from({ length: month.daysInMonth() }, (_, i) => first.add(i, 'day'));
    return [...blanks, ...days];
  }, [month]);

  const today = dayjs().format('YYYY-MM-DD');

  return (
    <div>
      <PageHeader
        title="Booking Calendar"
        description="See every pending, confirmed and completed booking by day."
      />

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth(m => m.subtract(1, 'month'))}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </Button>
          <p className="w-40 text-center text-lg font-bold text-navy">
            {month.format('MMMM YYYY')}
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth(m => m.add(1, 'month'))}
            aria-label="Next month"
          >
            <ChevronRight />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMonth(dayjs().startOf('month'))}>
            Today
          </Button>
        </div>
        <div className="sm:ml-auto sm:w-72">
          <Select
            value={venueId}
            onChange={event => setVenueId(event.target.value)}
            aria-label="Venue"
          >
            <option value="">All venues</option>
            {venues.data?.items.map(venue => (
              <option key={venue.id} value={venue.id}>
                {venue.name} · {VENUE_TYPE_LABEL[venue.type]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {Object.entries(CHIP).map(([status, cls]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={cn('h-3 w-3 rounded border', cls)} />{' '}
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        ))}
        <span>{query.data ? `${query.data.bookings.length} bookings this month` : ''}</span>
      </div>

      {query.isLoading ? (
        <Spinner />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-card">
          <div className="grid min-w-[760px] grid-cols-7">
            {WEEKDAYS.map(day => (
              <div
                key={day}
                className="border-b bg-muted/50 py-2 text-center text-xs font-semibold uppercase text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {cells.map((date, index) => {
              if (!date)
                return (
                  <div key={`b-${index}`} className="min-h-[110px] border-b border-r bg-muted/20" />
                );
              const key = date.format('YYYY-MM-DD');
              const items = byDate.get(key) ?? [];
              return (
                <div
                  key={key}
                  className={cn(
                    'min-h-[110px] border-b border-r p-1.5',
                    key === today && 'bg-primary/5',
                  )}
                >
                  <p
                    className={cn(
                      'mb-1 text-xs font-semibold',
                      key === today ? 'text-primary' : 'text-slate-500',
                    )}
                  >
                    {date.date()}
                  </p>
                  <div className="space-y-1">
                    {items.slice(0, 3).map(booking => (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => setViewId(booking.id)}
                        className={cn(
                          'block w-full truncate rounded border px-1.5 py-0.5 text-left text-[11px] font-medium hover:brightness-95',
                          CHIP[booking.status],
                        )}
                        title={`${booking.venue.name} · ${booking.customer?.name} · ${booking.eventType}`}
                      >
                        {booking.venue.name}
                      </button>
                    ))}
                    {items.length > 3 && (
                      <p className="px-1 text-[11px] font-semibold text-muted-foreground">
                        +{items.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BookingViewModal bookingId={viewId} onClose={() => setViewId(null)} />
    </div>
  );
}

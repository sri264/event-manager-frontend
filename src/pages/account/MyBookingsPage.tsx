import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookingCard } from '@/components/booking/BookingCard';
import { EmptyState, ErrorState } from '@/components/common/DataStates';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { bookingsApi } from '@/lib/api/bookings';
import { cn } from '@/lib/utils';
import type { BookingTab } from '@/types/models';

const TABS: { value: BookingTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function MyBookingsPage() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find(t => t.value === params.get('tab'))?.value ?? 'all') as BookingTab;
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search.trim());

  const query = useQuery({
    queryKey: ['my', 'bookings', tab, page, debounced, 6],
    queryFn: () => bookingsApi.mine({ tab, page, limit: 6, search: debounced }),
    placeholderData: keepPreviousData,
  });

  const update = (next: Record<string, string | number>) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => merged.set(key, String(value)));
    setParams(merged, { replace: true });
  };

  return (
    <div>
      <PageHeader
        title="My Bookings"
        description="View, pay, manage and download invoices for your bookings."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl border bg-white p-1 scrollbar-none">
          {TABS.map(item => (
            <button
              key={item.value}
              type="button"
              onClick={() => update({ tab: item.value, page: 1 })}
              className={cn(
                'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                tab === item.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-muted',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              if (page !== 1) update({ page: 1 });
            }}
            placeholder="Search venue or booking ID"
            className="bg-white pl-9"
          />
        </div>
      </div>

      <div className="space-y-4">
        {query.isLoading ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.data?.items.length ? (
          <>
            {query.data.items.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
            <div className="rounded-2xl border bg-white">
              <Pagination
                page={query.data.page}
                totalPages={query.data.totalPages}
                total={query.data.total}
                onChange={next => update({ page: next })}
              />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border bg-white">
            <EmptyState
              title={
                debounced
                  ? 'No bookings match your search'
                  : `No ${tab === 'all' ? '' : tab} bookings`
              }
              description="Your bookings will appear here once you reserve a venue."
              action={
                <Button asChild>
                  <Link to="/halls">Explore venues</Link>
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

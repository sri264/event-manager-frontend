import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Search,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BookingCard } from '@/components/booking/BookingCard';
import { EmptyState, ErrorState } from '@/components/common/DataStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector } from '@/hooks/redux';
import { bookingsApi } from '@/lib/api/bookings';
import { formatDateRange, formatINR } from '@/lib/format';
import { resolveImage } from '@/lib/image';

export default function AccountDashboardPage() {
  const user = useAppSelector(state => state.auth.user);
  const summary = useQuery({ queryKey: ['my', 'summary'], queryFn: bookingsApi.summary });
  const recent = useQuery({
    queryKey: ['my', 'bookings', 'all', 1, '', 3],
    queryFn: () => bookingsApi.mine({ tab: 'all', page: 1, limit: 3 }),
  });

  const next = summary.data?.nextBooking;

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name.split(' ')[0] ?? 'there'} 👋`}
        description="Here's an overview of your bookings and payments."
        actions={
          <Button asChild>
            <Link to="/halls">
              <Search /> Book a venue
            </Link>
          </Button>
        }
      />

      {summary.isError ? (
        <ErrorState error={summary.error} onRetry={() => summary.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.isLoading || !summary.data ? (
            Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[104px] rounded-2xl" />
            ))
          ) : (
            <>
              <StatCard label="Total Bookings" value={summary.data.total} icon={CalendarCheck} />
              <StatCard
                label="Upcoming"
                value={summary.data.upcoming}
                icon={CalendarClock}
                tone="amber"
              />
              <StatCard
                label="Completed"
                value={summary.data.completed}
                icon={CheckCircle2}
                tone="green"
              />
              <StatCard
                label="Total Spent"
                value={formatINR(summary.data.totalSpent)}
                icon={Wallet}
                tone="violet"
              />
            </>
          )}
        </div>
      )}

      {next && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 to-navy-700 text-white shadow-card">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <img
              src={resolveImage(next.venue.images?.[0])}
              alt=""
              className="h-28 w-full rounded-xl object-cover sm:w-44"
            />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                Your next event
              </p>
              <h2 className="mt-1 text-xl font-bold">{next.venue.name}</h2>
              <p className="mt-1 text-sm text-white/75">
                {formatDateRange(next.startDate, next.endDate)} · {next.eventType} · {next.guests}{' '}
                guests
              </p>
            </div>
            <Button asChild variant="white">
              <Link to={`/account/bookings/${next.id}`}>
                View booking <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy">Recent bookings</h2>
        <Link to="/account/bookings" className="text-sm font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-4 space-y-4">
        {recent.isLoading ? (
          Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
        ) : recent.isError ? (
          <ErrorState error={recent.error} onRetry={() => recent.refetch()} />
        ) : recent.data?.items.length ? (
          recent.data.items.map(booking => <BookingCard key={booking.id} booking={booking} />)
        ) : (
          <div className="rounded-2xl border bg-white">
            <EmptyState
              title="No bookings yet"
              description="Find the perfect hall, pool or room for your next celebration."
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

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  Building2,
  CalendarCheck,
  Clock,
  IndianRupee,
  LifeBuoy,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, Spinner } from '@/components/common/DataStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { dashboardApi } from '@/lib/api/admin';
import { formatDateRange, formatINR, VENUE_TYPE_LABEL } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/types/models';
import { BookingViewModal } from './components/BookingViewModal';

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-emerald-500',
  COMPLETED: 'bg-primary',
  CANCELLED: 'bg-rose-400',
};

export default function AdminDashboardPage() {
  const [viewId, setViewId] = useState<number | null>(null);
  const query = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: dashboardApi.overview });

  if (query.isLoading) return <Spinner />;
  if (query.isError || !query.data)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const { stats, statusBreakdown, typeBreakdown, revenueByMonth, recentBookings, todaysEvents } =
    query.data;
  const maxRevenue = Math.max(1, ...revenueByMonth.map(m => m.total));
  const statusTotal = Math.max(
    1,
    Object.values(statusBreakdown).reduce((a, b) => a + b, 0),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Overview for ${dayjs().format('dddd, D MMMM YYYY')}`}
        actions={
          <Button asChild>
            <Link to="/admin/bookings?new=1">
              <Plus /> New booking
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings}
          icon={CalendarCheck}
          hint={`${stats.bookingsThisMonth} created this month`}
        />
        <StatCard
          label="Revenue"
          value={formatINR(stats.revenue)}
          icon={IndianRupee}
          tone="green"
          hint={`${formatINR(stats.revenueThisMonth)} collected this month`}
        />
        <StatCard
          label="Customers"
          value={stats.customers}
          icon={Users}
          tone="violet"
          hint="Registered accounts"
        />
        <StatCard
          label="Active Venues"
          value={stats.activeVenues}
          icon={Building2}
          tone="amber"
          hint="Halls, pools and rooms"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/bookings?status=PENDING"
          className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-card transition hover:border-amber-300"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-navy">Pending bookings</span>
              <span className="block text-xs text-muted-foreground">
                Awaiting payment or confirmation
              </span>
            </span>
          </span>
          <span className="text-2xl font-extrabold text-navy">{stats.pendingBookings}</span>
        </Link>
        <Link
          to="/admin/support?status=OPEN"
          className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-card transition hover:border-rose-300"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-600">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-navy">Open support requests</span>
              <span className="block text-xs text-muted-foreground">Open and in progress</span>
            </span>
          </span>
          <span className="text-2xl font-extrabold text-navy">{stats.openTickets}</span>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border bg-white shadow-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-bold text-navy">Recent Bookings</h2>
            <Link
              to="/admin/bookings"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <Table>
            <THead>
              <tr>
                <TH>Customer</TH>
                <TH>Venue</TH>
                <TH>Date</TH>
                <TH className="text-right">Amount</TH>
                <TH>Status</TH>
              </tr>
            </THead>
            <TBody>
              {recentBookings.map(booking => (
                <TR
                  key={booking.id}
                  className="cursor-pointer"
                  onClick={() => setViewId(booking.id)}
                >
                  <TD>
                    <p className="font-semibold">{booking.customer?.name}</p>
                    <p className="text-xs text-muted-foreground">#{booking.bookingCode}</p>
                  </TD>
                  <TD>
                    <p>{booking.venue.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {VENUE_TYPE_LABEL[booking.venue.type]}
                    </p>
                  </TD>
                  <TD className="whitespace-nowrap">
                    {formatDateRange(booking.startDate, booking.endDate)}
                  </TD>
                  <TD className="text-right font-semibold">{formatINR(booking.totalAmount)}</TD>
                  <TD>
                    <StatusBadge status={booking.status} />
                  </TD>
                </TR>
              ))}
              {!recentBookings.length && (
                <tr>
                  <TD colSpan={5} className="py-10 text-center text-muted-foreground">
                    No bookings yet
                  </TD>
                </tr>
              )}
            </TBody>
          </Table>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-bold text-navy">
            <TrendingUp className="h-4 w-4 text-primary" /> Revenue (last 6 months)
          </h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {revenueByMonth.map(item => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {item.total ? `₹${Math.round(item.total / 1000)}k` : '–'}
                </span>
                <div className="flex h-36 w-full items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-sky-400 transition-all"
                    style={{ height: `${Math.max(2, (item.total / maxRevenue) * 100)}%` }}
                    title={formatINR(item.total)}
                  />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {dayjs(`${item.month}-01`).format('MMM')}
                </span>
              </div>
            ))}
          </div>

          <h3 className="mt-8 text-sm font-bold text-navy">Bookings by status</h3>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-muted">
            {(Object.keys(statusBreakdown) as BookingStatus[]).map(status => (
              <div
                key={status}
                className={STATUS_COLORS[status]}
                style={{ width: `${(statusBreakdown[status] / statusTotal) * 100}%` }}
              />
            ))}
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {(Object.keys(statusBreakdown) as BookingStatus[]).map(status => (
              <li key={status} className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_COLORS[status])} />
                <span className="capitalize text-slate-600">{status.toLowerCase()}</span>
                <b className="ml-auto">{statusBreakdown[status]}</b>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {(['hall', 'pool', 'room'] as const).map(type => (
              <div key={type} className="rounded-xl bg-muted/60 p-2">
                <p className="text-lg font-extrabold text-navy">{typeBreakdown[type] ?? 0}</p>
                <p className="text-[11px] text-muted-foreground">{VENUE_TYPE_LABEL[type]}s</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-card">
        <h2 className="font-bold text-navy">Today&apos;s events ({todaysEvents.length})</h2>
        {todaysEvents.length ? (
          <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {todaysEvents.map(booking => (
              <li key={booking.id}>
                <button
                  type="button"
                  onClick={() => setViewId(booking.id)}
                  className="w-full rounded-xl border p-4 text-left transition hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-navy">{booking.venue.name}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {booking.eventType} · {booking.guests} guests
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.customer?.name} · {booking.contactPhone}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No events scheduled for today.</p>
        )}
      </section>

      <BookingViewModal bookingId={viewId} onClose={() => setViewId(null)} />
    </div>
  );
}

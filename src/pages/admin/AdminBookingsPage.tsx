import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Eye, Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState, Spinner } from '@/components/common/DataStates';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import { adminBookingsApi, type AdminBookingFilters } from '@/lib/api/bookings';
import { formatDate, formatDateRange, formatINR, VENUE_TYPE_LABEL } from '@/lib/format';
import type { BookingStatus } from '@/types/models';
import type { VenueType } from '@/types/venue';
import { AdminBookingFormModal } from './components/AdminBookingFormModal';
import { BookingViewModal } from './components/BookingViewModal';

export default function AdminBookingsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const debounced = useDebounce(search.trim());
  const [viewId, setViewId] = useState<number | null>(null);
  const [creating, setCreating] = useState(params.get('new') === '1');

  const get = (key: string) => params.get(key) ?? '';
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (get('search') !== debounced) setParam('search', debounced);
  }, [debounced]);

  useEffect(() => {
    if (params.get('new')) setParam('new', '');
  }, []);

  const filters: AdminBookingFilters = {
    status: (get('status') as BookingStatus) || undefined,
    venueType: (get('venueType') as VenueType) || undefined,
    customerId: Number(get('customerId')) || undefined,
    venueId: Number(get('venueId')) || undefined,
    from: get('from') || undefined,
    to: get('to') || undefined,
    search: get('search') || undefined,
    page: Number(get('page')) || 1,
    limit: 10,
  };

  const query = useQuery({
    queryKey: ['admin', 'bookings', filters],
    queryFn: () => adminBookingsApi.list(filters),
    placeholderData: keepPreviousData,
  });

  const hasFilters = ['status', 'venueType', 'customerId', 'venueId', 'from', 'to', 'search'].some(
    key => params.get(key),
  );

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Search, view, create and manage every booking."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> New booking
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 rounded-2xl border bg-white p-4 shadow-card md:grid-cols-3 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Booking ID, customer, phone, venue"
            className="pl-9"
          />
        </div>
        <Select
          value={get('status')}
          onChange={event => setParam('status', event.target.value)}
          aria-label="Status"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
        <Select
          value={get('venueType')}
          onChange={event => setParam('venueType', event.target.value)}
          aria-label="Venue type"
        >
          <option value="">All venue types</option>
          <option value="hall">Function halls</option>
          <option value="pool">Swimming pools</option>
          <option value="room">Rooms</option>
        </Select>
        <Input
          type="date"
          value={get('from')}
          onChange={event => setParam('from', event.target.value)}
          aria-label="From date"
          title="Event from"
        />
        <Input
          type="date"
          value={get('to')}
          onChange={event => setParam('to', event.target.value)}
          aria-label="To date"
          title="Event to"
        />
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch('');
              setParams({}, { replace: true });
            }}
          >
            <X /> Clear
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-card">
        {query.isLoading ? (
          <Spinner />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : !query.data?.items.length ? (
          <EmptyState
            title="No bookings found"
            description={hasFilters ? 'Try changing the filters.' : undefined}
          />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Booking</TH>
                  <TH>Customer</TH>
                  <TH>Venue</TH>
                  <TH>Event date</TH>
                  <TH className="text-right">Amount</TH>
                  <TH>Status</TH>
                  <TH>Payment</TH>
                  <TH />
                </tr>
              </THead>
              <TBody>
                {query.data.items.map(booking => (
                  <TR
                    key={booking.id}
                    className="cursor-pointer"
                    onClick={() => setViewId(booking.id)}
                  >
                    <TD>
                      <p className="font-semibold text-primary">#{booking.bookingCode}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(booking.createdAt)}
                      </p>
                    </TD>
                    <TD>
                      <p className="font-medium">{booking.customer?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.customer?.phone ?? booking.customer?.email}
                      </p>
                    </TD>
                    <TD>
                      <p>{booking.venue.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {VENUE_TYPE_LABEL[booking.venue.type]}
                      </p>
                    </TD>
                    <TD className="whitespace-nowrap">
                      {formatDateRange(booking.startDate, booking.endDate)}
                      <p className="text-xs text-muted-foreground">
                        {booking.eventType} · {booking.guests} guests
                      </p>
                    </TD>
                    <TD className="text-right font-semibold">{formatINR(booking.totalAmount)}</TD>
                    <TD>
                      <StatusBadge status={booking.status} />
                    </TD>
                    <TD>
                      <StatusBadge status={booking.paymentStatus} />
                    </TD>
                    <TD>
                      <Button size="icon" variant="ghost" aria-label="View booking">
                        <Eye />
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Pagination
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              onChange={page => setParam('page', String(page))}
            />
          </>
        )}
      </div>

      <BookingViewModal bookingId={viewId} onClose={() => setViewId(null)} />
      <AdminBookingFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={id => setViewId(id)}
      />
    </div>
  );
}

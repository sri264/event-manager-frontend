import { CalendarDays, Download, MapPin, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDateRange, formatINR, unitLabel, VENUE_TYPE_LABEL } from '@/lib/format';
import { resolveImage } from '@/lib/image';
import type { Booking } from '@/types/models';

export function BookingCard({ booking }: { booking: Booking }) {
  const { venue } = booking;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-card sm:flex-row">
      <img
        src={resolveImage(venue.images?.[0])}
        alt={venue.name}
        loading="lazy"
        className="h-40 w-full shrink-0 rounded-xl object-cover sm:h-32 sm:w-44"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {VENUE_TYPE_LABEL[venue.type]} · #{booking.bookingCode}
            </p>
            <h3 className="truncate text-lg font-bold text-navy">{venue.name}</h3>
          </div>
          <StatusBadge status={booking.status} customerView />
        </div>

        <ul className="grid gap-1.5 text-sm text-slate-600 sm:grid-cols-2">
          {venue.location && (
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> {venue.location}
            </li>
          )}
          <li className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {formatDateRange(booking.startDate, booking.endDate)}
            {venue.priceUnit && (
              <span className="text-muted-foreground">
                ({unitLabel(venue.priceUnit, booking.units)})
              </span>
            )}
          </li>
          <li className="flex items-center gap-2 sm:col-span-2">
            <PartyPopper className="h-4 w-4 text-primary" />
            {booking.eventType} · {booking.guests} guests
          </li>
        </ul>
      </div>

      <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t pt-3 sm:w-44 sm:flex-col sm:items-end sm:justify-between sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
        <div className="sm:text-right">
          <p className="text-xs text-muted-foreground">Total amount</p>
          <p className="text-xl font-extrabold text-navy">{formatINR(booking.totalAmount)}</p>
          {booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' && (
            <StatusBadge status={booking.paymentStatus} className="mt-1" />
          )}
        </div>
        <div className="flex gap-2 sm:w-full sm:flex-col">
          <Button asChild size="sm" className="sm:w-full">
            <Link to={`/account/bookings/${booking.id}`}>View Details</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="sm:w-full">
            <Link to={`/account/bookings/${booking.id}/invoice`} target="_blank">
              <Download /> Invoice
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

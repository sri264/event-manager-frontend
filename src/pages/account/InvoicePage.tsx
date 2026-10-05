import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, Spinner } from '@/components/common/DataStates';
import { Logo } from '@/components/common/Logo';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { settingsApi } from '@/lib/api/admin';
import { bookingsApi } from '@/lib/api/bookings';
import {
  formatDate,
  formatDateRange,
  formatDateTime,
  formatINRPrecise,
  PAYMENT_METHOD_LABEL,
  unitLabel,
  VENUE_TYPE_LABEL,
} from '@/lib/format';

export default function InvoicePage() {
  const id = Number(useParams().id);
  const query = useQuery({
    queryKey: ['my', 'booking', id],
    queryFn: () => bookingsApi.mineById(id),
  });
  const settings = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: settingsApi.public,
    staleTime: 300_000,
  });

  useEffect(() => {
    if (query.data) document.title = `Invoice ${query.data.bookingCode} · EventNest`;
  }, [query.data]);

  if (query.isLoading) return <Spinner className="min-h-screen items-center" />;
  if (query.isError || !query.data) {
    return (
      <ErrorState className="min-h-screen" error={query.error} onRetry={() => query.refetch()} />
    );
  }

  const booking = query.data;
  const business = settings.data;
  const priceUnit = booking.venue.priceUnit ?? 'day';
  const halfGst = booking.gstAmount / 2;

  return (
    <div className="min-h-screen bg-muted/50 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-3xl justify-between px-4 print:hidden">
        <Button asChild variant="ghost">
          <Link to={`/account/bookings/${booking.id}`}>
            <ArrowLeft /> Back to booking
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer /> Print / Save as PDF
        </Button>
      </div>

      <article className="mx-auto max-w-3xl bg-white p-8 shadow-card print:max-w-none print:p-0 print:shadow-none sm:p-12">
        <header className="flex flex-col justify-between gap-6 border-b pb-6 sm:flex-row">
          <div>
            <Logo />
            <div className="mt-3 text-sm text-muted-foreground">
              <p className="font-semibold text-slate-700">
                {business?.businessName ?? 'EventNest'}
              </p>
              {business?.address && <p>{business.address}</p>}
              {business?.supportEmail && <p>{business.supportEmail}</p>}
              {business?.supportPhone && <p>{business.supportPhone}</p>}
            </div>
          </div>
          <div className="sm:text-right">
            <h1 className="text-3xl font-extrabold tracking-tight text-navy">INVOICE</h1>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Invoice no:</span>{' '}
              <b>INV-{booking.bookingCode}</b>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Date:</span> {formatDate(booking.createdAt)}
            </p>
            <div className="mt-2 flex gap-2 sm:justify-end">
              <StatusBadge status={booking.status} />
              <StatusBadge status={booking.paymentStatus} />
            </div>
          </div>
        </header>

        <section className="grid gap-6 border-b py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Billed to
            </p>
            <p className="mt-1 font-semibold">{booking.customer?.name ?? booking.contactName}</p>
            {booking.customer?.email && <p className="text-sm">{booking.customer.email}</p>}
            <p className="text-sm">{booking.customer?.phone ?? booking.contactPhone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Venue
            </p>
            <p className="mt-1 font-semibold">{booking.venue.name}</p>
            <p className="text-sm">{VENUE_TYPE_LABEL[booking.venue.type]}</p>
            {booking.venue.address && <p className="text-sm">{booking.venue.address}</p>}
          </div>
        </section>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Rate</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">
                <p className="font-semibold">
                  {booking.venue.name} · {booking.eventType}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateRange(booking.startDate, booking.endDate)} · {booking.guests} guests
                </p>
              </td>
              <td className="py-3 text-right">{formatINRPrecise(booking.unitPrice)}</td>
              <td className="py-3 text-right">{unitLabel(priceUnit, booking.units)}</td>
              <td className="py-3 text-right font-medium">
                {formatINRPrecise(booking.baseAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="ml-auto mt-4 w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINRPrecise(booking.baseAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CGST ({booking.gstPercent / 2}%)</span>
            <span>{formatINRPrecise(halfGst)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SGST ({booking.gstPercent / 2}%)</span>
            <span>{formatINRPrecise(booking.gstAmount - halfGst)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-extrabold text-navy">
            <span>Total</span>
            <span>{formatINRPrecise(booking.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>Amount paid</span>
            <span>{formatINRPrecise(booking.amountPaid)}</span>
          </div>
          {booking.balanceDue > 0 && (
            <div className="flex justify-between font-semibold text-amber-700">
              <span>Balance due</span>
              <span>{formatINRPrecise(booking.balanceDue)}</span>
            </div>
          )}
        </div>

        {booking.payments.length > 0 && (
          <section className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Transactions
            </p>
            <ul className="mt-2 divide-y rounded-lg border text-sm">
              {booking.payments.map(payment => (
                <li key={payment.id} className="flex flex-wrap justify-between gap-2 px-3 py-2">
                  <span>
                    {formatDateTime(payment.paidAt)} · {PAYMENT_METHOD_LABEL[payment.method]} ·{' '}
                    {payment.transactionRef}
                  </span>
                  <span className="font-medium">
                    {formatINRPrecise(payment.amount)}{' '}
                    {payment.status === 'REFUNDED' && '(refunded)'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-10 border-t pt-4 text-xs text-muted-foreground">
          {business?.cancellationPolicy && <p className="mb-2">{business.cancellationPolicy}</p>}
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </footer>
      </article>
    </div>
  );
}

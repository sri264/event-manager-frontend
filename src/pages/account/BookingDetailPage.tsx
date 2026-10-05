import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Download,
  LifeBuoy,
  MapPin,
  Pencil,
  Phone,
  Star,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { EditBookingModal } from '@/components/booking/EditBookingModal';
import { PayModal } from '@/components/booking/PayModal';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { ReviewModal } from '@/components/booking/ReviewModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState, Spinner } from '@/components/common/DataStates';
import { RatingStars } from '@/components/common/RatingStars';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { settingsApi } from '@/lib/api/admin';
import { bookingsApi } from '@/lib/api/bookings';
import { getErrorMessage } from '@/lib/api/client';
import {
  formatDate,
  formatDateRange,
  formatDateTime,
  formatINRPrecise,
  PAYMENT_METHOD_LABEL,
  unitLabel,
  VENUE_TYPE_LABEL,
} from '@/lib/format';
import { resolveImage } from '@/lib/image';

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-bold text-navy">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  const id = Number(useParams().id);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<'pay' | 'edit' | 'cancel' | 'review' | null>(null);

  const query = useQuery({
    queryKey: ['my', 'booking', id],
    queryFn: () => bookingsApi.mineById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
  const settings = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: settingsApi.public,
    staleTime: 300_000,
  });

  const openPayOnArrival = (location.state as { openPay?: boolean } | null)?.openPay;
  useEffect(() => {
    if (openPayOnArrival && query.data?.canPay) {
      setDialog('pay');
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [openPayOnArrival, query.data?.canPay, navigate, location.pathname]);

  const cancel = useMutation({
    mutationFn: (reason: string) => bookingsApi.cancelMine(id, reason || undefined),
    onSuccess: booking => {
      const refunded = booking.paymentStatus === 'REFUNDED';
      toast.success(
        refunded ? 'Booking cancelled. Your refund has been initiated.' : 'Booking cancelled',
      );
      void queryClient.invalidateQueries({ queryKey: ['my'] });
      setDialog(null);
    },
    onError: error => toast.error(getErrorMessage(error)),
  });

  if (query.isLoading) return <Spinner />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        error={query.error ?? new Error('Booking not found')}
        onRetry={() => query.refetch()}
      />
    );
  }

  const booking = query.data;
  const { venue } = booking;
  const priceUnit = venue.priceUnit ?? 'day';
  const freeDays = settings.data?.freeCancellationDays ?? 0;
  const daysToEvent = dayjs(booking.startDate).diff(dayjs().startOf('day'), 'day');
  const refundable = booking.amountPaid > 0 && daysToEvent >= freeDays;

  return (
    <div className="space-y-6">
      <Link
        to="/account/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to my bookings
      </Link>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-card">
        <div className="flex flex-col gap-5 p-5 sm:flex-row">
          <img
            src={resolveImage(venue.images?.[0])}
            alt={venue.name}
            className="h-44 w-full rounded-xl object-cover sm:h-36 sm:w-56"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={booking.status} customerView />
              {booking.status !== 'CANCELLED' && <StatusBadge status={booking.paymentStatus} />}
              {booking.status === 'CANCELLED' && booking.paymentStatus === 'REFUNDED' && (
                <StatusBadge status="REFUNDED" />
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-navy">{venue.name}</h1>
            <p className="text-sm text-muted-foreground">
              {VENUE_TYPE_LABEL[venue.type]} · Booking #{booking.bookingCode} · Booked on{' '}
              {formatDate(booking.createdAt)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {booking.canPay && (
                <Button onClick={() => setDialog('pay')}>
                  <CreditCard /> Pay {formatINRPrecise(booking.balanceDue)}
                </Button>
              )}
              {booking.canEdit && (
                <Button variant="outline" onClick={() => setDialog('edit')}>
                  <Pencil /> Edit details
                </Button>
              )}
              {(booking.canReview || booking.review) && (
                <Button variant="outline" onClick={() => setDialog('review')}>
                  <Star /> {booking.review ? 'Edit review' : 'Write a review'}
                </Button>
              )}
              <Button asChild variant="outline">
                <Link to={`/account/bookings/${booking.id}/invoice`} target="_blank">
                  <Download /> Download Invoice
                </Link>
              </Button>
              {booking.canCancel && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDialog('cancel')}
                >
                  <XCircle /> Cancel booking
                </Button>
              )}
            </div>
          </div>
        </div>
        {booking.status === 'PENDING' && booking.canPay && (
          <div className="border-t bg-amber-50 px-5 py-3 text-sm text-amber-800">
            Complete the payment to confirm this booking. Unpaid bookings are cancelled
            automatically on the event date.
          </div>
        )}
        {booking.status === 'CANCELLED' && (
          <div className="border-t bg-rose-50 px-5 py-3 text-sm text-rose-800">
            Cancelled on {formatDateTime(booking.cancelledAt)}
            {booking.cancellationReason && <> · {booking.cancellationReason}</>}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card title="Event details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info
                icon={CalendarDays}
                label="Dates"
                value={`${formatDateRange(booking.startDate, booking.endDate)} (${unitLabel(priceUnit, booking.units)})`}
              />
              <Info
                icon={Users}
                label="Event & guests"
                value={`${booking.eventType} · ${booking.guests} guests`}
              />
              <Info
                icon={MapPin}
                label="Venue address"
                value={venue.address || venue.location || '—'}
              />
              <Info icon={UserRound} label="Contact person" value={booking.contactName} />
              <Info icon={Phone} label="Contact phone" value={booking.contactPhone} />
            </div>
            {booking.notes && (
              <div className="mt-4 rounded-xl bg-muted/60 p-3 text-sm">
                <p className="text-xs font-semibold text-muted-foreground">Special requests</p>
                <p className="mt-1 whitespace-pre-line">{booking.notes}</p>
              </div>
            )}
          </Card>

          <Card title="Payment history">
            {booking.payments.length ? (
              <ul className="divide-y">
                {booking.payments.map(payment => (
                  <li
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {PAYMENT_METHOD_LABEL[payment.method]} · {payment.transactionRef}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(payment.paidAt)}
                        {payment.refundedAt && ` · Refunded ${formatDateTime(payment.refundedAt)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{formatINRPrecise(payment.amount)}</span>
                      <StatusBadge status={payment.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            )}
          </Card>

          {booking.review && (
            <Card title="Your review">
              <RatingStars value={booking.review.rating} />
              <p className="mt-2 text-sm text-slate-700">{booking.review.comment}</p>
              {!booking.review.isVisible && (
                <p className="mt-2 text-xs text-muted-foreground">
                  This review is currently hidden by the venue team.
                </p>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Price summary">
            <PriceBreakdown
              unitPrice={booking.unitPrice}
              units={booking.units}
              priceUnit={priceUnit}
              baseAmount={booking.baseAmount}
              gstPercent={booking.gstPercent}
              gstAmount={booking.gstAmount}
              totalAmount={booking.totalAmount}
              amountPaid={booking.amountPaid}
              balanceDue={booking.balanceDue}
            />
          </Card>
          <div className="rounded-2xl border bg-white p-5 shadow-card">
            <p className="font-bold text-navy">Need help with this booking?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Rescheduling, decoration or billing questions.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to={`/account/support?bookingId=${booking.id}`}>
                <LifeBuoy /> Contact support
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <PayModal booking={booking} open={dialog === 'pay'} onClose={() => setDialog(null)} />
      <EditBookingModal
        booking={booking}
        open={dialog === 'edit'}
        onClose={() => setDialog(null)}
      />
      <ReviewModal booking={booking} open={dialog === 'review'} onClose={() => setDialog(null)} />
      <ConfirmDialog
        open={dialog === 'cancel'}
        onClose={() => setDialog(null)}
        onConfirm={reason => cancel.mutate(reason)}
        loading={cancel.isPending}
        destructive
        withReason
        title="Cancel this booking?"
        confirmLabel="Yes, cancel booking"
        description={
          booking.amountPaid > 0 ? (
            refundable ? (
              <>
                You&apos;re cancelling {daysToEvent} days before the event, so the paid amount of{' '}
                <b>{formatINRPrecise(booking.amountPaid)}</b> will be refunded in full.
              </>
            ) : (
              <>
                Free cancellation ends {freeDays} days before the event. Cancelling now means the
                paid amount of <b>{formatINRPrecise(booking.amountPaid)}</b> is{' '}
                <b>not refundable</b>.
              </>
            )
          ) : (
            'This booking has no payments, so nothing will be charged.'
          )
        }
      />
    </div>
  );
}

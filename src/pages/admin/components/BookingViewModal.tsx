import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Ban, CheckCheck, CheckCircle2, IndianRupee, Pencil, RotateCcw, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState, Spinner } from '@/components/common/DataStates';
import { RatingStars } from '@/components/common/RatingStars';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { adminBookingsApi } from '@/lib/api/bookings';
import { getErrorMessage } from '@/lib/api/client';
import { adminPaymentsApi } from '@/lib/api/payments';
import {
  formatDate,
  formatDateRange,
  formatDateTime,
  formatINRPrecise,
  PAYMENT_METHOD_LABEL,
  unitLabel,
  VENUE_TYPE_LABEL,
} from '@/lib/format';
import type { BookingStatus, Payment } from '@/types/models';
import { AdminBookingFormModal } from './AdminBookingFormModal';
import { RecordPaymentModal } from './RecordPaymentModal';

interface BookingViewModalProps {
  bookingId: number | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export function BookingViewModal({ bookingId, onClose }: BookingViewModalProps) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<
    'edit' | 'pay' | 'cancel' | 'complete' | 'confirm' | 'pending' | null
  >(null);
  const [refunding, setRefunding] = useState<Payment | null>(null);

  const query = useQuery({
    queryKey: ['admin', 'booking', bookingId],
    queryFn: () => adminBookingsApi.get(bookingId!),
    enabled: bookingId !== null,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['venues'] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: BookingStatus; reason?: string }) =>
      adminBookingsApi.setStatus(bookingId!, status, reason),
    onSuccess: booking => {
      toast.success(`Booking marked as ${booking.status.toLowerCase()}`);
      refresh();
      setAction(null);
    },
    onError: error => toast.error(getErrorMessage(error)),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => adminPaymentsApi.refund(id, note),
    onSuccess: () => {
      toast.success('Payment refunded');
      refresh();
      setRefunding(null);
    },
    onError: error => toast.error(getErrorMessage(error)),
  });

  const booking = query.data;
  const open = booking?.status === 'PENDING' || booking?.status === 'CONFIRMED';
  const started = booking ? booking.startDate <= dayjs().format('YYYY-MM-DD') : false;

  return (
    <>
      <Modal
        open={bookingId !== null}
        onClose={onClose}
        size="xl"
        title={booking ? `Booking #${booking.bookingCode}` : 'Booking'}
        description={booking ? `Created ${formatDateTime(booking.createdAt)}` : undefined}
      >
        {query.isLoading ? (
          <Spinner />
        ) : query.isError || !booking ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={booking.status} />
              <StatusBadge status={booking.paymentStatus} />
              <div className="ml-auto flex flex-wrap gap-2">
                {open && (
                  <Button size="sm" variant="outline" onClick={() => setAction('edit')}>
                    <Pencil /> Edit
                  </Button>
                )}
                {booking.canPay && (
                  <Button size="sm" variant="outline" onClick={() => setAction('pay')}>
                    <IndianRupee /> Record payment
                  </Button>
                )}
                {booking.status === 'PENDING' && (
                  <Button size="sm" variant="outline" onClick={() => setAction('confirm')}>
                    <CheckCircle2 /> Confirm
                  </Button>
                )}
                {booking.status === 'CONFIRMED' && booking.paymentStatus !== 'PAID' && (
                  <Button size="sm" variant="outline" onClick={() => setAction('pending')}>
                    <Undo2 /> Move to pending
                  </Button>
                )}
                {booking.status === 'CONFIRMED' && started && (
                  <Button size="sm" variant="outline" onClick={() => setAction('complete')}>
                    <CheckCheck /> Mark completed
                  </Button>
                )}
                {open && (
                  <Button size="sm" variant="destructive" onClick={() => setAction('cancel')}>
                    <Ban /> Cancel
                  </Button>
                )}
              </div>
            </div>

            {booking.status === 'CANCELLED' && (
              <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                Cancelled {formatDateTime(booking.cancelledAt)} · {booking.cancellationReason}
              </p>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <section>
                <h3 className="mb-2 text-sm font-bold text-navy">Customer</h3>
                <dl className="divide-y rounded-xl border px-4">
                  <Row label="Name" value={booking.customer?.name} />
                  <Row label="Email" value={booking.customer?.email} />
                  <Row label="Phone" value={booking.customer?.phone ?? '—'} />
                  <Row
                    label="Contact person"
                    value={`${booking.contactName} · ${booking.contactPhone}`}
                  />
                </dl>
                <h3 className="mb-2 mt-5 text-sm font-bold text-navy">Event</h3>
                <dl className="divide-y rounded-xl border px-4">
                  <Row
                    label="Venue"
                    value={`${booking.venue.name} (${VENUE_TYPE_LABEL[booking.venue.type]})`}
                  />
                  <Row
                    label="Dates"
                    value={`${formatDateRange(booking.startDate, booking.endDate)} · ${unitLabel(booking.venue.priceUnit ?? 'day', booking.units)}`}
                  />
                  <Row label="Event type" value={booking.eventType} />
                  <Row label="Guests" value={booking.guests} />
                </dl>
                {booking.notes && (
                  <p className="mt-3 whitespace-pre-line rounded-xl bg-muted/60 p-3 text-sm">
                    {booking.notes}
                  </p>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-sm font-bold text-navy">Amount</h3>
                <div className="rounded-xl border p-4">
                  <PriceBreakdown
                    unitPrice={booking.unitPrice}
                    units={booking.units}
                    priceUnit={booking.venue.priceUnit ?? 'day'}
                    baseAmount={booking.baseAmount}
                    gstPercent={booking.gstPercent}
                    gstAmount={booking.gstAmount}
                    totalAmount={booking.totalAmount}
                    amountPaid={booking.amountPaid}
                    balanceDue={booking.balanceDue}
                  />
                </div>

                <h3 className="mb-2 mt-5 text-sm font-bold text-navy">Payments</h3>
                {booking.payments.length ? (
                  <ul className="divide-y rounded-xl border">
                    {booking.payments.map(payment => (
                      <li
                        key={payment.id}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold">
                            {formatINRPrecise(payment.amount)} ·{' '}
                            {PAYMENT_METHOD_LABEL[payment.method]}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {payment.transactionRef} · {formatDate(payment.paidAt)}
                            {payment.note && ` · ${payment.note}`}
                          </p>
                        </div>
                        {payment.status === 'SUCCESS' ? (
                          <Button size="sm" variant="ghost" onClick={() => setRefunding(payment)}>
                            <RotateCcw /> Refund
                          </Button>
                        ) : (
                          <StatusBadge status={payment.status} />
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No payments recorded.</p>
                )}

                {booking.review && (
                  <>
                    <h3 className="mb-2 mt-5 text-sm font-bold text-navy">Customer review</h3>
                    <div className="rounded-xl border p-3 text-sm">
                      <RatingStars value={booking.review.rating} size="sm" />
                      <p className="mt-1">{booking.review.comment}</p>
                    </div>
                  </>
                )}
              </section>
            </div>
          </div>
        )}
      </Modal>

      {booking && (
        <>
          <AdminBookingFormModal
            open={action === 'edit'}
            onClose={() => setAction(null)}
            booking={booking}
          />
          <RecordPaymentModal
            booking={booking}
            open={action === 'pay'}
            onClose={() => setAction(null)}
          />
          <ConfirmDialog
            open={action === 'cancel'}
            onClose={() => setAction(null)}
            onConfirm={reason =>
              statusMutation.mutate({ status: 'CANCELLED', reason: reason || undefined })
            }
            loading={statusMutation.isPending}
            destructive
            withReason
            title="Cancel booking?"
            confirmLabel="Cancel booking"
            description={
              booking.amountPaid > 0
                ? `All successful payments (${formatINRPrecise(booking.amountPaid)}) will be refunded to the customer.`
                : 'The dates will be released for other customers.'
            }
          />
          <ConfirmDialog
            open={action === 'confirm'}
            onClose={() => setAction(null)}
            onConfirm={() => statusMutation.mutate({ status: 'CONFIRMED' })}
            loading={statusMutation.isPending}
            title="Confirm booking?"
            confirmLabel="Confirm"
            description={
              booking.balanceDue > 0
                ? `The booking will be confirmed with ${formatINRPrecise(booking.balanceDue)} still due.`
                : 'The booking will be marked as confirmed.'
            }
          />
          <ConfirmDialog
            open={action === 'pending'}
            onClose={() => setAction(null)}
            onConfirm={() => statusMutation.mutate({ status: 'PENDING' })}
            loading={statusMutation.isPending}
            title="Move back to pending?"
            confirmLabel="Move to pending"
            description="Unpaid pending bookings are cancelled automatically once the event date passes."
          />
          <ConfirmDialog
            open={action === 'complete'}
            onClose={() => setAction(null)}
            onConfirm={() => statusMutation.mutate({ status: 'COMPLETED' })}
            loading={statusMutation.isPending}
            title="Mark as completed?"
            confirmLabel="Mark completed"
            description="The customer will be able to leave a review for this booking."
          />
          <ConfirmDialog
            open={!!refunding}
            onClose={() => setRefunding(null)}
            onConfirm={note =>
              refunding && refundMutation.mutate({ id: refunding.id, note: note || undefined })
            }
            loading={refundMutation.isPending}
            destructive
            withReason
            reasonPlaceholder="Refund note (optional)"
            title="Refund this payment?"
            confirmLabel="Refund"
            description={
              refunding
                ? `${formatINRPrecise(refunding.amount)} via ${PAYMENT_METHOD_LABEL[refunding.method]} (${refunding.transactionRef}) will be marked as refunded.`
                : ''
            }
          />
        </>
      )}
    </>
  );
}

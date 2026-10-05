import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, CreditCard, Lock, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { getErrorMessage } from '@/lib/api/client';
import { paymentsApi } from '@/lib/api/payments';
import { formatINRPrecise } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BookingDetail, PaymentMethod } from '@/types/models';

const METHODS: { value: PaymentMethod; label: string; hint: string; icon: typeof CreditCard }[] = [
  { value: 'UPI', label: 'UPI', hint: 'GPay, PhonePe, Paytm', icon: Smartphone },
  {
    value: 'CARD',
    label: 'Credit / Debit Card',
    hint: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
  },
  { value: 'NET_BANKING', label: 'Net Banking', hint: 'All major banks', icon: Building2 },
];

interface PayModalProps {
  booking: BookingDetail;
  open: boolean;
  onClose: () => void;
}

export function PayModal({ booking, open, onClose }: PayModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const queryClient = useQueryClient();

  const pay = useMutation({
    mutationFn: () => paymentsApi.pay(booking.id, method),
    onSuccess: result => {
      toast.success(`Payment successful · Ref ${result.payment.transactionRef}`);
      void queryClient.invalidateQueries({ queryKey: ['my'] });
      onClose();
    },
    onError: error => toast.error(getErrorMessage(error)),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Complete payment"
      description={`Booking #${booking.bookingCode} · ${booking.venue.name}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pay.isPending}>
            Cancel
          </Button>
          <Button onClick={() => pay.mutate()} disabled={pay.isPending}>
            <Lock /> {pay.isPending ? 'Processing…' : `Pay ${formatINRPrecise(booking.balanceDue)}`}
          </Button>
        </>
      }
    >
      <div className="rounded-xl bg-secondary/60 p-4">
        <p className="text-sm text-muted-foreground">Amount payable</p>
        <p className="text-3xl font-extrabold text-navy">{formatINRPrecise(booking.balanceDue)}</p>
      </div>
      <p className="mb-2 mt-5 text-sm font-semibold">Choose a payment method</p>
      <div className="space-y-2">
        {METHODS.map(item => (
          <label
            key={item.value}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors',
              method === item.value
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'hover:bg-muted/50',
            )}
          >
            <input
              type="radio"
              name="method"
              className="sr-only"
              checked={method === item.value}
              onChange={() => setMethod(item.value)}
            />
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-sm">
              <item.icon className="h-5 w-5 text-primary" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block text-xs text-muted-foreground">{item.hint}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> Demo gateway: payments are simulated and confirmed
        instantly.
      </p>
    </Modal>
  );
}

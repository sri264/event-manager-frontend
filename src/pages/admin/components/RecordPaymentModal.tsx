import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { getErrorMessage } from '@/lib/api/client';
import { adminPaymentsApi } from '@/lib/api/payments';
import { formatINRPrecise, PAYMENT_METHOD_LABEL } from '@/lib/format';
import type { BookingDetail, PaymentMethod } from '@/types/models';

interface RecordPaymentModalProps {
  booking: BookingDetail;
  open: boolean;
  onClose: () => void;
}

export function RecordPaymentModal({ booking, open, onClose }: RecordPaymentModalProps) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(String(booking.balanceDue));
      setMethod('CASH');
      setNote('');
      setError('');
    }
  }, [open, booking.balanceDue]);

  const submit = async () => {
    const value = Number(amount);
    if (!value || value < 1) return setError('Enter an amount of at least ₹1');
    if (value > booking.balanceDue)
      return setError(
        `Amount cannot exceed the balance of ${formatINRPrecise(booking.balanceDue)}`,
      );
    setSaving(true);
    try {
      const result = await adminPaymentsApi.record({
        bookingId: booking.id,
        amount: Math.round(value * 100) / 100,
        method,
        note: note.trim() || undefined,
      });
      toast.success(`Payment recorded · ${result.payment.transactionRef}`);
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record a payment"
      description={`#${booking.bookingCode} · balance ${formatINRPrecise(booking.balanceDue)}`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Record payment'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Amount (₹)" htmlFor="amount" error={error} required>
          <Input
            id="amount"
            type="number"
            min={1}
            step="0.01"
            max={booking.balanceDue}
            value={amount}
            onChange={event => {
              setAmount(event.target.value);
              setError('');
            }}
          />
        </FormField>
        <FormField label="Method" htmlFor="method" required>
          <Select
            id="method"
            value={method}
            onChange={event => setMethod(event.target.value as PaymentMethod)}
          >
            {Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Note" htmlFor="note">
          <Input
            id="note"
            maxLength={255}
            value={note}
            onChange={event => setNote(event.target.value)}
            placeholder="Receipt no., remarks…"
          />
        </FormField>
      </div>
    </Modal>
  );
}

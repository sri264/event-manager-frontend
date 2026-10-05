import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { BookingStatus, PaymentStatus, TicketStatus, TransactionStatus } from '@/types/models';

type Variant = NonNullable<BadgeProps['variant']>;

const META: Record<string, { label: string; variant: Variant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  UNPAID: { label: 'Unpaid', variant: 'warning' },
  PAID: { label: 'Paid', variant: 'success' },
  REFUNDED: { label: 'Refunded', variant: 'muted' },
  SUCCESS: { label: 'Success', variant: 'success' },
  OPEN: { label: 'Open', variant: 'warning' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' },
  RESOLVED: { label: 'Resolved', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'muted' },
};

interface StatusBadgeProps {
  status: BookingStatus | PaymentStatus | TicketStatus | TransactionStatus;
  /** Shows "Upcoming" instead of Pending/Confirmed, as on the customer screens. */
  customerView?: boolean;
  className?: string;
}

export function StatusBadge({ status, customerView, className }: StatusBadgeProps) {
  const meta = META[status] ?? { label: status, variant: 'muted' as Variant };
  const label =
    customerView && status === 'CONFIRMED'
      ? 'Upcoming'
      : customerView && status === 'PENDING'
        ? 'Payment Pending'
        : meta.label;
  return (
    <Badge variant={meta.variant} className={className}>
      {label}
    </Badge>
  );
}

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, IndianRupee, Receipt, RotateCcw, Search, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState, ErrorState, Spinner } from '@/components/common/DataStates';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import { getErrorMessage } from '@/lib/api/client';
import { adminPaymentsApi, type AdminPaymentFilters } from '@/lib/api/payments';
import { formatDateTime, formatINR, formatINRPrecise, PAYMENT_METHOD_LABEL } from '@/lib/format';
import type { Payment, PaymentMethod, TransactionStatus } from '@/types/models';
import { BookingViewModal } from './components/BookingViewModal';

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search.trim());
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [refunding, setRefunding] = useState<Payment | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const filters: AdminPaymentFilters = {
    search: debounced || undefined,
    status: (status as TransactionStatus) || undefined,
    method: (method as PaymentMethod) || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit: 10,
  };
  const query = useQuery({
    queryKey: ['admin', 'payments', filters],
    queryFn: () => adminPaymentsApi.list(filters),
    placeholderData: keepPreviousData,
  });

  const refund = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => adminPaymentsApi.refund(id, note),
    onSuccess: () => {
      toast.success('Payment refunded');
      setRefunding(null);
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: error => toast.error(getErrorMessage(error)),
  });

  const summary = query.data?.summary;
  const resetPage =
    <T,>(setter: (v: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };
  const hasFilters = !!(search || status || method || from || to);

  return (
    <div>
      <PageHeader title="Payments" description="All transactions, refunds and revenue." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Collected"
          value={formatINR(summary?.collected ?? 0)}
          icon={IndianRupee}
          tone="green"
        />
        <StatCard label="Successful payments" value={summary?.successCount ?? 0} icon={Receipt} />
        <StatCard
          label="Refunded"
          value={formatINR(summary?.refunded ?? 0)}
          icon={ArrowDownLeft}
          tone="rose"
        />
        <StatCard label="Refunds" value={summary?.refundCount ?? 0} icon={RotateCcw} tone="amber" />
      </div>

      <div className="mb-4 grid gap-3 rounded-2xl border bg-white p-4 shadow-card md:grid-cols-3 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={event => resetPage(setSearch)(event.target.value)}
            placeholder="Txn ref, booking ID, customer, venue"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={event => resetPage(setStatus)(event.target.value)}
          aria-label="Status"
        >
          <option value="">All statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="REFUNDED">Refunded</option>
        </Select>
        <Select
          value={method}
          onChange={event => resetPage(setMethod)(event.target.value)}
          aria-label="Method"
        >
          <option value="">All methods</option>
          {Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          value={from}
          onChange={event => resetPage(setFrom)(event.target.value)}
          aria-label="Paid from"
        />
        <Input
          type="date"
          value={to}
          onChange={event => resetPage(setTo)(event.target.value)}
          aria-label="Paid to"
        />
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch('');
              setStatus('');
              setMethod('');
              setFrom('');
              setTo('');
              setPage(1);
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
          <EmptyState title="No payments found" />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Paid on</TH>
                  <TH>Transaction</TH>
                  <TH>Booking</TH>
                  <TH>Customer</TH>
                  <TH>Method</TH>
                  <TH className="text-right">Amount</TH>
                  <TH>Status</TH>
                  <TH />
                </tr>
              </THead>
              <TBody>
                {query.data.items.map(payment => (
                  <TR key={payment.id}>
                    <TD className="whitespace-nowrap">{formatDateTime(payment.paidAt)}</TD>
                    <TD>
                      <p className="font-mono text-xs">{payment.transactionRef}</p>
                      {payment.note && (
                        <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                          {payment.note}
                        </p>
                      )}
                    </TD>
                    <TD>
                      <button
                        type="button"
                        onClick={() => setBookingId(payment.bookingId)}
                        className="font-semibold text-primary hover:underline"
                      >
                        #{payment.booking?.bookingCode}
                      </button>
                      <p className="text-xs text-muted-foreground">
                        {payment.booking?.venue?.name}
                      </p>
                    </TD>
                    <TD>
                      <p>{payment.booking?.customer?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.booking?.customer?.email}
                      </p>
                    </TD>
                    <TD>{PAYMENT_METHOD_LABEL[payment.method]}</TD>
                    <TD className="text-right font-semibold">{formatINRPrecise(payment.amount)}</TD>
                    <TD>
                      <StatusBadge status={payment.status} />
                    </TD>
                    <TD>
                      {payment.status === 'SUCCESS' && (
                        <Button size="sm" variant="ghost" onClick={() => setRefunding(payment)}>
                          <RotateCcw /> Refund
                        </Button>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Pagination
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              onChange={setPage}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!refunding}
        onClose={() => setRefunding(null)}
        onConfirm={note =>
          refunding && refund.mutate({ id: refunding.id, note: note || undefined })
        }
        loading={refund.isPending}
        destructive
        withReason
        reasonPlaceholder="Refund note (optional)"
        title="Refund this payment?"
        confirmLabel="Refund"
        description={
          refunding
            ? `${formatINRPrecise(refunding.amount)} (${refunding.transactionRef}) will be marked as refunded. The booking's payment status will be recalculated.`
            : ''
        }
      />
      <BookingViewModal bookingId={bookingId} onClose={() => setBookingId(null)} />
    </div>
  );
}

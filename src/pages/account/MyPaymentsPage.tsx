import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, Spinner } from '@/components/common/DataStates';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { paymentsApi } from '@/lib/api/payments';
import { formatDateTime, formatINRPrecise, PAYMENT_METHOD_LABEL } from '@/lib/format';

export default function MyPaymentsPage() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['my', 'payments', page],
    queryFn: () => paymentsApi.mine({ page, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <PageHeader
        title="Payments"
        description="All payments and refunds made against your bookings."
      />
      <div className="overflow-hidden rounded-2xl border bg-white shadow-card">
        {query.isLoading ? (
          <Spinner />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : !query.data?.items.length ? (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Payments you make will appear here."
          />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Booking</TH>
                  <TH>Method</TH>
                  <TH>Transaction ref</TH>
                  <TH className="text-right">Amount</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <TBody>
                {query.data.items.map(payment => (
                  <TR key={payment.id}>
                    <TD className="whitespace-nowrap">{formatDateTime(payment.paidAt)}</TD>
                    <TD>
                      <Link
                        to={`/account/bookings/${payment.bookingId}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        #{payment.booking?.bookingCode}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {payment.booking?.venue?.name}
                      </p>
                    </TD>
                    <TD>{PAYMENT_METHOD_LABEL[payment.method]}</TD>
                    <TD className="font-mono text-xs">{payment.transactionRef}</TD>
                    <TD className="text-right font-semibold">{formatINRPrecise(payment.amount)}</TD>
                    <TD>
                      <StatusBadge status={payment.status} />
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
    </div>
  );
}

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, MessageSquareReply, Phone, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { EmptyState, ErrorState, Spinner } from '@/components/common/DataStates';
import { FormField } from '@/components/common/FormField';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/useDebounce';
import { adminSupportApi } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/api/client';
import { formatDateTime } from '@/lib/format';
import type { TicketStatus } from '@/types/models';
import { BookingViewModal } from './components/BookingViewModal';

const STATUSES: { value: TicketStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

function TicketModal({
  id,
  onClose,
  onOpenBooking,
}: {
  id: number | null;
  onClose: () => void;
  onOpenBooking: (id: number) => void;
}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<TicketStatus>('OPEN');
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);

  const query = useQuery({
    queryKey: ['admin', 'ticket', id],
    queryFn: () => adminSupportApi.get(id!),
    enabled: id !== null,
  });
  const ticket = query.data;

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status === 'OPEN' ? 'RESOLVED' : ticket.status);
      setReply(ticket.adminReply ?? '');
    }
  }, [ticket]);

  const save = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      const trimmed = reply.trim();
      await adminSupportApi.update(ticket.id, {
        status,
        ...(trimmed && trimmed !== ticket.adminReply ? { adminReply: trimmed } : {}),
      });
      toast.success('Ticket updated');
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={id !== null}
      onClose={onClose}
      size="lg"
      title={ticket?.subject ?? 'Support request'}
      description={ticket ? `Received ${formatDateTime(ticket.createdAt)}` : undefined}
      footer={
        ticket && (
          <>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={save} disabled={saving}>
              <MessageSquareReply /> {saving ? 'Saving…' : 'Save & reply'}
            </Button>
          </>
        )
      }
    >
      {query.isLoading ? (
        <Spinner />
      ) : query.isError || !ticket ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge status={ticket.status} />
            <Badge variant={ticket.userId ? 'default' : 'muted'}>
              {ticket.userId ? 'Customer' : 'Website enquiry'}
            </Badge>
            {ticket.booking && (
              <button
                type="button"
                onClick={() => onOpenBooking(ticket.booking!.id)}
                className="font-semibold text-primary hover:underline"
              >
                Booking #{ticket.booking.bookingCode}
              </button>
            )}
          </div>
          <div className="rounded-xl border p-4">
            <p className="font-semibold text-navy">{ticket.name}</p>
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-600">
              <a
                href={`mailto:${ticket.email}`}
                className="flex items-center gap-1.5 hover:text-primary"
              >
                <Mail className="h-4 w-4" /> {ticket.email}
              </a>
              {ticket.phone && (
                <a
                  href={`tel:${ticket.phone}`}
                  className="flex items-center gap-1.5 hover:text-primary"
                >
                  <Phone className="h-4 w-4" /> {ticket.phone}
                </a>
              )}
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{ticket.message}</p>
          </div>
          {ticket.repliedAt && (
            <p className="text-xs text-muted-foreground">
              Last replied {formatDateTime(ticket.repliedAt)}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <FormField label="Status" htmlFor="t-status">
              <Select
                id="t-status"
                value={status}
                onChange={event => setStatus(event.target.value as TicketStatus)}
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              label="Reply to customer"
              htmlFor="t-reply"
              hint="Visible to the customer in their Support page"
            >
              <Textarea
                id="t-reply"
                rows={5}
                maxLength={3000}
                value={reply}
                onChange={event => setReply(event.target.value)}
              />
            </FormField>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AdminSupportPage() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search.trim());
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [page, setPage] = useState(1);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const filters = {
    search: debounced,
    status: (status as TicketStatus) || undefined,
    page,
    limit: 10,
  };
  const query = useQuery({
    queryKey: ['admin', 'tickets', filters],
    queryFn: () => adminSupportApi.list(filters),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <PageHeader title="Support" description="Customer requests and website enquiries." />

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-card sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search subject, name or email"
            className="pl-9"
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={status}
            onChange={event => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Status"
          >
            <option value="">All statuses</option>
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-card">
        {query.isLoading ? (
          <Spinner />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : !query.data?.items.length ? (
          <EmptyState title="No support requests" />
        ) : (
          <>
            <ul className="divide-y">
              {query.data.items.map(ticket => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    onClick={() => setTicketId(ticket.id)}
                    className="flex w-full flex-col gap-2 px-5 py-4 text-left transition hover:bg-muted/40 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-navy">{ticket.subject}</p>
                      <p className="truncate text-sm text-slate-600">{ticket.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.name} · {ticket.email} · {formatDateTime(ticket.createdAt)}
                        {ticket.booking && ` · #${ticket.booking.bookingCode}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {ticket.adminReply && <Badge variant="muted">Replied</Badge>}
                      <StatusBadge status={ticket.status} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <Pagination
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              onChange={setPage}
            />
          </>
        )}
      </div>

      <TicketModal
        id={ticketId}
        onClose={() => setTicketId(null)}
        onOpenBooking={id => setBookingId(id)}
      />
      <BookingViewModal bookingId={bookingId} onClose={() => setBookingId(null)} />
    </div>
  );
}

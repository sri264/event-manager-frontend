import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { LifeBuoy, MessageSquareReply, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { EmptyState, ErrorState, Spinner } from '@/components/common/DataStates';
import { FormField } from '@/components/common/FormField';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supportApi } from '@/lib/api/admin';
import { bookingsApi } from '@/lib/api/bookings';
import { handleFormError } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';

const schema = z.object({
  subject: z.string().trim().min(1, 'Subject is required').max(150),
  message: z.string().trim().min(10, 'Please describe your issue in a few words').max(3000),
  bookingId: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export default function SupportPage() {
  const [params] = useSearchParams();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const tickets = useQuery({
    queryKey: ['my', 'tickets', page],
    queryFn: () => supportApi.mine({ page, limit: 5 }),
    placeholderData: keepPreviousData,
  });
  const bookings = useQuery({
    queryKey: ['my', 'bookings', 'all', 1, '', 50],
    queryFn: () => bookingsApi.mine({ tab: 'all', page: 1, limit: 50 }),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { subject: '', message: '', bookingId: '' },
  });

  const presetBooking = params.get('bookingId');
  useEffect(() => {
    if (presetBooking && bookings.data) setValue('bookingId', presetBooking);
  }, [presetBooking, bookings.data, setValue]);

  const onSubmit = async (values: Values) => {
    try {
      await supportApi.create({
        subject: values.subject,
        message: values.message,
        bookingId: values.bookingId ? Number(values.bookingId) : undefined,
      });
      toast.success('Your request has been sent. We usually reply within a few hours.');
      reset({ subject: '', message: '', bookingId: '' });
      setPage(1);
      void queryClient.invalidateQueries({ queryKey: ['my', 'tickets'] });
    } catch (error) {
      handleFormError(error, setError, ['subject', 'message', 'bookingId']);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Support" description="Raise a request and track replies from our team." />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border bg-white p-6 shadow-card"
        noValidate
      >
        <h2 className="font-bold text-navy">New request</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label="Subject" htmlFor="subject" error={errors.subject?.message} required>
            <Input id="subject" placeholder="e.g. Change event timing" {...register('subject')} />
          </FormField>
          <FormField label="Related booking" htmlFor="bookingId" error={errors.bookingId?.message}>
            <Select id="bookingId" {...register('bookingId')}>
              <option value="">Not related to a booking</option>
              {bookings.data?.items.map(booking => (
                <option key={booking.id} value={booking.id}>
                  #{booking.bookingCode} · {booking.venue.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Message"
            htmlFor="message"
            error={errors.message?.message}
            required
            className="sm:col-span-2"
          >
            <Textarea
              id="message"
              rows={5}
              placeholder="How can we help?"
              {...register('message')}
            />
          </FormField>
        </div>
        <Button type="submit" className="mt-5" disabled={isSubmitting}>
          <Send /> {isSubmitting ? 'Sending…' : 'Submit request'}
        </Button>
      </form>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-card">
        <h2 className="border-b px-6 py-4 font-bold text-navy">My requests</h2>
        {tickets.isLoading ? (
          <Spinner />
        ) : tickets.isError ? (
          <ErrorState error={tickets.error} onRetry={() => tickets.refetch()} />
        ) : !tickets.data?.items.length ? (
          <EmptyState
            icon={LifeBuoy}
            title="No support requests"
            description="Requests you raise will appear here."
          />
        ) : (
          <>
            <ul className="divide-y">
              {tickets.data.items.map(ticket => (
                <li key={ticket.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-navy">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(ticket.createdAt)}
                        {ticket.booking && ` · Booking #${ticket.booking.bookingCode}`}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                    {ticket.message}
                  </p>
                  {ticket.adminReply && (
                    <div className="mt-3 rounded-xl border-l-4 border-primary bg-secondary/60 p-3 text-sm">
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <MessageSquareReply className="h-3.5 w-3.5" /> EventNest team ·{' '}
                        {formatDateTime(ticket.repliedAt)}
                      </p>
                      <p className="whitespace-pre-line text-slate-700">{ticket.adminReply}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <Pagination
              page={tickets.data.page}
              totalPages={tickets.data.totalPages}
              total={tickets.data.total}
              onChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}

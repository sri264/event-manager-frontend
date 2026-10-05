import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ArrowLeft, CalendarCheck, CheckCircle2, MapPin, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BookingDetailsFields } from '@/components/booking/BookingDetailsForm';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { ErrorState, Spinner } from '@/components/common/DataStates';
import { Button } from '@/components/ui/button';
import { AvailabilityCalendar } from '@/components/venue/AvailabilityCalendar';
import { useAppSelector } from '@/hooks/redux';
import { useBookedDates, useVenueQuote } from '@/hooks/useVenueQuote';
import { bookingsApi } from '@/lib/api/bookings';
import { getErrorMessage } from '@/lib/api/client';
import { venuesApi } from '@/lib/api/venues';
import { handleFormError } from '@/lib/errors';
import { capacityLabel, formatDate, formatDateRange, VENUE_TYPE_LABEL } from '@/lib/format';
import { resolveImage } from '@/lib/image';
import { cn } from '@/lib/utils';
import { bookingDetailsSchema, type BookingDetailsValues } from '@/lib/validation';

const FIELDS = ['guests', 'eventType', 'contactName', 'contactPhone', 'notes'] as const;

export default function BookingPage() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAppSelector(state => state.auth.user);

  const venueQuery = useQuery({
    queryKey: ['venues', 'slug', slug],
    queryFn: () => venuesApi.bySlug(slug),
  });
  const venue = venueQuery.data;
  const today = dayjs().format('YYYY-MM-DD');
  const paramStart = params.get('start') ?? '';
  const [range, setRange] = useState({
    start: paramStart >= today ? paramStart : '',
    end: paramStart >= today ? (params.get('end') ?? '') : '',
  });

  const booked = useBookedDates(venue?.id);
  const quote = useVenueQuote(venue?.id, range.start, range.end);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingDetailsValues>({
    resolver: zodResolver(bookingDetailsSchema),
    values: {
      guests: Number(params.get('guests')) || 1,
      eventType: venue?.type === 'room' ? 'Stay' : venue?.type === 'pool' ? 'Pool Party' : '',
      contactName: user?.name ?? '',
      contactPhone: user?.phone ?? '',
      notes: '',
    },
    resetOptions: { keepDirtyValues: true },
  });

  if (venueQuery.isLoading) return <Spinner className="min-h-[60vh] items-center" />;
  if (venueQuery.isError || !venue) {
    return (
      <ErrorState
        className="min-h-[60vh]"
        error={venueQuery.error}
        onRetry={() => venueQuery.refetch()}
      />
    );
  }

  const isNight = venue.priceUnit === 'night';
  const canSubmit = !!quote.data?.available && !isSubmitting;

  const onSubmit = async (values: BookingDetailsValues) => {
    if (!range.start || !range.end) {
      toast.error('Please select your dates first');
      return;
    }
    if (values.guests > venue.capacity) {
      setError('guests', { message: `Maximum ${venue.capacity} guests for this venue` });
      return;
    }
    try {
      const booking = await bookingsApi.create({
        venueId: venue.id,
        startDate: range.start,
        endDate: range.end,
        ...values,
        notes: values.notes || undefined,
      });
      toast.success(`Booking #${booking.bookingCode} created. Complete the payment to confirm it.`);
      void queryClient.invalidateQueries({ queryKey: ['my'] });
      void queryClient.invalidateQueries({ queryKey: ['venues', venue.id] });
      navigate(`/account/bookings/${booking.id}`, { replace: true, state: { openPay: true } });
    } catch (error) {
      void queryClient.invalidateQueries({ queryKey: ['venues', venue.id] });
      handleFormError(error, setError, FIELDS);
    }
  };

  return (
    <div className="bg-muted/40">
      <div className="container py-8">
        <Link
          to={`/facilities/${venue.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to venue
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-navy">Book your venue</h1>
        <p className="text-sm text-muted-foreground">
          Pick your dates, add event details and confirm.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-6">
            <section className="rounded-2xl border bg-white p-5 shadow-card">
              <h2 className="mb-1 flex items-center gap-2 font-bold text-navy">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-white">
                  1
                </span>
                {isNight ? 'Choose check-in & check-out' : 'Choose your dates'}
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Dates shown in red are already booked.
              </p>
              <div className="max-w-md">
                <AvailabilityCalendar
                  booked={booked.data ?? []}
                  priceUnit={venue.priceUnit}
                  start={range.start}
                  end={range.end}
                  onChange={(start, end) => setRange({ start, end })}
                />
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-navy">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-white">
                  2
                </span>
                Event & contact details
              </h2>
              <BookingDetailsFields
                register={register}
                errors={errors}
                maxGuests={venue.capacity}
              />
            </section>
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border bg-white p-5 shadow-card lg:sticky lg:top-24">
            <div className="flex gap-3">
              <img
                src={resolveImage(venue.images[0])}
                alt=""
                className="h-20 w-24 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {VENUE_TYPE_LABEL[venue.type]}
                </p>
                <p className="font-bold text-navy">{venue.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {venue.location} ·{' '}
                  {capacityLabel(venue.type, venue.capacity)}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-muted/60 p-3 text-sm">
              <p className="flex items-center gap-2 font-semibold text-navy">
                <CalendarCheck className="h-4 w-4 text-primary" />
                {range.start
                  ? isNight
                    ? `${formatDate(range.start)} → ${formatDate(range.end)}`
                    : formatDateRange(range.start, range.end)
                  : 'No dates selected'}
              </p>
            </div>

            {quote.isFetching && !quote.data && (
              <p className="text-sm text-muted-foreground">Calculating price…</p>
            )}
            {quote.isError && (
              <p className="text-sm font-medium text-destructive">{getErrorMessage(quote.error)}</p>
            )}
            {quote.data && (
              <>
                <p
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-semibold',
                    quote.data.available ? 'text-emerald-600' : 'text-destructive',
                  )}
                >
                  {quote.data.available ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {quote.data.available ? 'Available' : 'These dates are no longer available'}
                </p>
                <PriceBreakdown {...quote.data} />
              </>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
              {isSubmitting ? 'Creating booking…' : 'Confirm & continue to payment'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Your booking is held as <b>pending</b> until payment is completed.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}

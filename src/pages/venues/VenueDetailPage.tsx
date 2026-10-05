import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck, Star, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState, Spinner } from '@/components/common/DataStates';
import { Pagination } from '@/components/common/Pagination';
import { RatingStars } from '@/components/common/RatingStars';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { Button } from '@/components/ui/button';
import { AvailabilityCalendar } from '@/components/venue/AvailabilityCalendar';
import { useAppSelector } from '@/hooks/redux';
import { useBookedDates, useVenueQuote } from '@/hooks/useVenueQuote';
import { reviewsApi } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/api/client';
import { venuesApi } from '@/lib/api/venues';
import {
  capacityLabel,
  formatDate,
  formatDateRange,
  formatINR,
  initials,
  VENUE_TYPE_LABEL,
  VENUE_TYPE_ROUTE,
} from '@/lib/format';
import { resolveImage } from '@/lib/image';
import { cn } from '@/lib/utils';

export default function VenueDetailPage() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const auth = useAppSelector(state => state.auth);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);

  const venueQuery = useQuery({
    queryKey: ['venues', 'slug', slug],
    queryFn: () => venuesApi.bySlug(slug),
  });
  const venue = venueQuery.data;
  const isNight = venue?.priceUnit === 'night';

  const hinted = params.get('date');
  const initialStart = hinted && hinted >= dayjs().format('YYYY-MM-DD') ? hinted : '';
  const [range, setRange] = useState({ start: initialStart, end: '' });
  const start = range.start;
  const end =
    range.end ||
    (start && venue ? (isNight ? dayjs(start).add(1, 'day').format('YYYY-MM-DD') : start) : '');

  const booked = useBookedDates(venue?.id);
  const quote = useVenueQuote(venue?.id, start, end);
  const reviews = useQuery({
    queryKey: ['reviews', 'venue', venue?.id, reviewPage],
    queryFn: () => reviewsApi.forVenue(venue!.id, reviewPage),
    enabled: !!venue,
    placeholderData: keepPreviousData,
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

  const images = venue.images.length ? venue.images : [''];
  const bookingQuery = start && end ? `?start=${start}&end=${end}` : '';
  const bookUrl = `/book/${venue.slug}${bookingQuery}`;
  const isAdmin = auth.user?.role === 'ADMIN';
  const isCustomer = auth.status === 'authenticated' && auth.user?.role === 'CUSTOMER';

  return (
    <div className="container py-8">
      <Link
        to={VENUE_TYPE_ROUTE[venue.type]}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> All {VENUE_TYPE_LABEL[venue.type].toLowerCase()}s
      </Link>

      <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {VENUE_TYPE_LABEL[venue.type]}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-navy sm:text-4xl">{venue.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <b className="text-navy">{venue.reviewCount ? venue.rating.toFixed(1) : 'New'}</b> (
              {venue.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" /> {venue.address}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" /> {capacityLabel(venue.type, venue.capacity)}
            </span>
          </div>
        </div>
        <p className="text-3xl font-extrabold text-navy">
          {formatINR(venue.price)}
          <span className="text-sm font-medium text-muted-foreground">
            {' '}
            / {venue.priceUnit} + GST
          </span>
        </p>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_200px]">
        <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <img
            src={resolveImage(images[activeImage])}
            alt={venue.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none lg:flex-col">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              className={cn(
                'h-20 w-28 shrink-0 overflow-hidden rounded-xl ring-2 transition lg:h-28 lg:w-full',
                index === activeImage
                  ? 'ring-primary'
                  : 'ring-transparent opacity-75 hover:opacity-100',
              )}
            >
              <img src={resolveImage(image)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-navy">About this venue</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">
              {venue.description}
            </p>
          </section>

          {venue.amenities.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-navy">Amenities</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {venue.amenities.map(amenity => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {amenity}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-xl font-bold text-navy">
              Guest reviews {reviews.data ? `(${reviews.data.total})` : ''}
            </h2>
            <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
              {reviews.isLoading ? (
                <Spinner />
              ) : !reviews.data?.items.length ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No reviews yet. Be the first to book and review!
                </p>
              ) : (
                <>
                  <ul className="divide-y">
                    {reviews.data.items.map(review => (
                      <li key={review.id} className="flex gap-4 p-5">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {initials(review.customer?.name ?? 'Guest')}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-navy">
                              {review.customer?.name ?? 'Guest'}
                            </p>
                            <RatingStars value={review.rating} size="sm" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {review.booking?.eventType} · {formatDate(review.createdAt)}
                          </p>
                          <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Pagination
                    page={reviews.data.page}
                    totalPages={reviews.data.totalPages}
                    total={reviews.data.total}
                    onChange={setReviewPage}
                  />
                </>
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border bg-white p-5 shadow-card lg:sticky lg:top-24">
          <div>
            <h2 className="font-bold text-navy">Check availability</h2>
            <p className="text-xs text-muted-foreground">
              {isNight
                ? 'Select check-in, then check-out.'
                : 'Select a day, or a start and end day.'}
            </p>
          </div>
          <AvailabilityCalendar
            booked={booked.data ?? []}
            priceUnit={venue.priceUnit}
            start={start}
            end={end}
            onChange={(s, e) => setRange({ start: s, end: e })}
          />

          {start && (
            <div className="rounded-xl bg-muted/60 p-3 text-sm">
              <p className="font-semibold text-navy">
                {isNight
                  ? `Check-in ${formatDate(start)} · Check-out ${formatDate(end)}`
                  : formatDateRange(start, end)}
              </p>
            </div>
          )}

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
                {quote.data.available
                  ? 'Available for your dates'
                  : 'Not available for these dates'}
              </p>
              <PriceBreakdown {...quote.data} />
            </>
          )}

          {isAdmin ? (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              You&apos;re signed in as an admin. Create bookings for customers from the admin panel.
            </p>
          ) : (
            <Button
              asChild={!!quote.data?.available}
              size="lg"
              className="w-full"
              disabled={!quote.data?.available}
            >
              {quote.data?.available ? (
                <Link to={isCustomer ? bookUrl : `/login?redirect=${encodeURIComponent(bookUrl)}`}>
                  {isCustomer ? 'Book Now' : 'Login to Book'}
                </Link>
              ) : (
                <span>{start ? 'Choose available dates' : 'Select dates to book'}</span>
              )}
            </Button>
          )}
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure booking · Instant confirmation after
            payment
          </p>
        </aside>
      </div>
    </div>
  );
}

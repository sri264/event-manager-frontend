import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CalendarDays, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState } from '@/components/common/DataStates';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { VenueCard, VenueCardSkeleton } from '@/components/venue/VenueCard';
import { useDebounce } from '@/hooks/useDebounce';
import { venuesApi, type VenueFilters } from '@/lib/api/venues';
import { formatDate } from '@/lib/format';
import type { VenueType } from '@/types/venue';

const META: Record<VenueType, { title: string; subtitle: string; image: string }> = {
  hall: {
    title: 'Function Halls',
    subtitle: 'Elegant halls for weddings, receptions, parties and corporate events.',
    image:
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1800&q=70',
  },
  pool: {
    title: 'Swimming Pools',
    subtitle: 'Private pools for parties, family outings and celebrations.',
    image:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1800&q=70',
  },
  room: {
    title: 'Rooms',
    subtitle: 'Comfortable, elegant rooms and suites for your stay.',
    image:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1800&q=70',
  },
};

const SORTS: { value: NonNullable<VenueFilters['sort']>; label: string }[] = [
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
];

export default function VenueListPage({ type }: { type: VenueType }) {
  const meta = META[type];
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const debounced = useDebounce(search.trim());

  const location = params.get('location') ?? '';
  const guests = params.get('guests') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';
  const sort = (params.get('sort') as VenueFilters['sort']) || 'popular';
  const date = params.get('date') ?? '';
  const page = Number(params.get('page')) || 1;

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if ((params.get('search') ?? '') !== debounced) setParam('search', debounced);
  }, [debounced]);

  const locations = useQuery({ queryKey: ['venues', 'locations'], queryFn: venuesApi.locations });
  const filters: VenueFilters = {
    type,
    location: location || undefined,
    guests: Number(guests) || undefined,
    maxPrice: Number(maxPrice) || undefined,
    search: params.get('search') || undefined,
    sort,
    page,
    limit: 9,
  };
  const query = useQuery({
    queryKey: ['venues', 'list', filters],
    queryFn: () => venuesApi.list(filters),
    placeholderData: keepPreviousData,
  });

  const hasFilters = !!(location || guests || maxPrice || params.get('search') || date);

  return (
    <div>
      <section className="relative overflow-hidden bg-navy-900 py-16 text-white">
        <img
          src={meta.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/80 to-transparent" />
        <div className="container relative">
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">{meta.title}</h1>
          <p className="mt-3 max-w-xl text-white/80">{meta.subtitle}</p>
        </div>
      </section>

      <div className="container py-10">
        <div className="grid gap-3 rounded-2xl border bg-white p-4 shadow-card md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_0.8fr_0.9fr_1fr]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={`Search ${meta.title.toLowerCase()}`}
              className="pl-9"
            />
          </div>
          <Select
            value={location}
            onChange={event => setParam('location', event.target.value)}
            aria-label="Location"
          >
            <option value="">All locations</option>
            {locations.data?.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            min={1}
            value={guests}
            onChange={event => setParam('guests', event.target.value)}
            placeholder="Guests"
            aria-label="Guests"
          />
          <Input
            type="number"
            min={0}
            step={500}
            value={maxPrice}
            onChange={event => setParam('maxPrice', event.target.value)}
            placeholder="Max price ₹"
            aria-label="Maximum price"
          />
          <Select
            value={sort}
            onChange={event => setParam('sort', event.target.value)}
            aria-label="Sort by"
          >
            {SORTS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            {query.data
              ? `${query.data.total} ${query.data.total === 1 ? 'venue' : 'venues'} found`
              : 'Loading…'}
            {date && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
                <CalendarDays className="h-3.5 w-3.5" /> {formatDate(date)}: availability is checked
                on the venue page
              </span>
            )}
          </p>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setParams({}, { replace: true });
              }}
            >
              <X /> Clear filters
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {query.isLoading ? (
            Array.from({ length: 6 }, (_, i) => <VenueCardSkeleton key={i} />)
          ) : query.isError ? (
            <ErrorState
              className="col-span-full"
              error={query.error}
              onRetry={() => query.refetch()}
            />
          ) : query.data?.items.length ? (
            query.data.items.map(venue => (
              <VenueCard key={venue.id} venue={venue} dateHint={date} />
            ))
          ) : (
            <EmptyState
              className="col-span-full rounded-2xl border bg-white"
              title="No venues match your filters"
              description="Try another location, fewer guests or a higher budget."
            />
          )}
        </div>

        {query.data && query.data.totalPages > 1 && (
          <div className="mt-8 rounded-2xl border bg-white">
            <Pagination
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              onChange={next => setParam('page', String(next))}
            />
          </div>
        )}
      </div>
    </div>
  );
}

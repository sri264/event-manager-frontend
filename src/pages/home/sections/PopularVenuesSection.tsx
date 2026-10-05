import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Button } from '@/components/ui/button';
import { VenueCard, VenueCardSkeleton } from '@/components/venue/VenueCard';
import { venuesApi } from '@/lib/api/venues';

export function PopularVenuesSection() {
  const featured = useQuery({
    queryKey: ['venues', 'featured'],
    queryFn: () => venuesApi.list({ featured: true, limit: 4 }),
  });
  const popular = useQuery({
    queryKey: ['venues', 'popular'],
    queryFn: () => venuesApi.list({ sort: 'popular', limit: 4 }),
    enabled: featured.isSuccess && featured.data.items.length === 0,
  });
  const venues = featured.data?.items.length ? featured.data.items : (popular.data?.items ?? []);
  const loading = featured.isLoading || popular.isFetching;

  if (!loading && venues.length === 0) return null;

  return (
    <section className="container py-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          align="left"
          title="Popular Venues"
          description="Most booked venues loved by our customers."
        />
        <Reveal>
          <Button asChild variant="outline" className="border-primary/30 text-primary">
            <Link to="/halls">
              View All Venues <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => <VenueCardSkeleton key={i} />)
          : venues.map((venue, index) => (
              <Reveal key={venue.id} delay={index * 0.08} className="h-full">
                <VenueCard venue={venue} />
              </Reveal>
            ))}
      </div>
    </section>
  );
}

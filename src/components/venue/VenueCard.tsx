import { Heart, MapPin, Sparkles, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { capacityLabel, formatINR } from '@/lib/format';
import { resolveImage } from '@/lib/image';
import { cn } from '@/lib/utils';
import type { Venue } from '@/types/venue';

interface VenueCardProps {
  venue: Venue;
  className?: string;
  /** Pre-selects this date (YYYY-MM-DD) on the venue page. */
  dateHint?: string;
}

export function VenueCard({ venue, className, dateHint }: VenueCardProps) {
  const detailUrl = `/facilities/${venue.slug}${dateHint ? `?date=${dateHint}` : ''}`;
  const [saved, setSaved] = useState(false);

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={resolveImage(venue.images[0])}
          alt={venue.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <button
          type="button"
          aria-label={saved ? 'Remove from saved venues' : 'Save venue'}
          aria-pressed={saved}
          onClick={() => setSaved(value => !value)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-sm transition-transform hover:scale-110"
        >
          <Heart
            className={cn('h-4 w-4', saved ? 'fill-rose-500 text-rose-500' : 'text-slate-600')}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-navy">{venue.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="font-semibold text-foreground">
            {venue.reviewCount ? venue.rating.toFixed(1) : 'New'}
          </span>
          <span>({venue.reviewCount} reviews)</span>
        </div>

        <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /> {venue.location}
          </li>
          <li className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0 text-primary" />{' '}
            {capacityLabel(venue.type, venue.capacity)}
          </li>
          {venue.amenities.length > 0 && (
            <li className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{venue.amenities.slice(0, 3).join(', ')}</span>
            </li>
          )}
        </ul>

        <p className="mt-auto pt-4 text-xl font-extrabold text-navy">
          {formatINR(venue.price)}
          <span className="ml-1 text-xs font-medium text-muted-foreground">
            / {venue.priceUnit}
          </span>
        </p>

        <Button
          asChild
          variant="outline"
          className="mt-4 w-full border-primary/30 text-primary hover:bg-primary hover:text-white"
        >
          <Link to={detailUrl}>View Details</Link>
        </Button>
      </div>
    </article>
  );
}

export function VenueCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Crown, MapPin, Play, Search, Users } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { venuesApi } from '@/lib/api/venues';
import { cn } from '@/lib/utils';
import type { VenueType } from '@/types/venue';
import { CITIES, HERO_IMAGE, SPACE_TABS } from '../data';

function SearchCard() {
  const navigate = useNavigate();
  const { data: apiCities } = useQuery({
    queryKey: ['venues', 'locations'],
    queryFn: venuesApi.locations,
  });
  const cities = apiCities?.length ? apiCities : CITIES;
  const [type, setType] = useState<VenueType>('hall');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');

  const activeTab = SPACE_TABS.find(tab => tab.type === type) ?? SPACE_TABS[0];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (date) params.set('date', date);
    if (guests) params.set('guests', guests);
    navigate(`${activeTab.route}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl rounded-2xl bg-white p-3 text-foreground shadow-search sm:p-4"
    >
      <div
        role="tablist"
        aria-label="Venue type"
        className="mb-3 flex gap-2 overflow-x-auto scrollbar-none"
      >
        {SPACE_TABS.map(tab => {
          const active = tab.type === type;
          return (
            <button
              key={tab.type}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setType(tab.type)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted text-slate-600 hover:bg-secondary hover:text-primary',
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
        <label className="field-shell">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span className="sr-only">Location</span>
          <select value={location} onChange={event => setLocation(event.target.value)}>
            <option value="">All locations</option>
            {cities.map(city => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </label>

        <label className="field-shell">
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
          <span className="sr-only">Event date</span>
          <input
            type="date"
            value={date}
            min={dayjs().format('YYYY-MM-DD')}
            onChange={event => setDate(event.target.value)}
            className={cn(!date && 'text-muted-foreground')}
          />
        </label>

        <label className="field-shell">
          <Users className="h-4 w-4 shrink-0 text-primary" />
          <span className="sr-only">Guests</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="Guests"
            value={guests}
            onChange={event => setGuests(event.target.value)}
          />
        </label>

        <Button type="submit" size="lg" className="h-12 sm:col-span-2 lg:col-span-1">
          <Search /> Search Venues
        </Button>
      </div>
    </form>
  );
}

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white">
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-110 saturate-[1.15]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/70 via-navy-900/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-navy-900/50 to-transparent" />

      <div className="container relative flex min-h-[640px] flex-col justify-center pb-28 pt-32 lg:min-h-[720px]">
        <motion.p
          {...fadeUp(0)}
          className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-gold-300"
        >
          <Crown className="h-4 w-4" /> Celebrate life&apos;s special moments
        </motion.p>

        <motion.h1
          {...fadeUp(0.1)}
          className="max-w-2xl font-serif text-4xl font-bold leading-[1.1] [text-shadow:0_2px_16px_rgba(10,20,50,0.55)] sm:text-5xl lg:text-6xl"
        >
          Perfect Venues
          <br />
          for <span className="text-gold-400">Every Occasion</span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="mt-5 max-w-lg text-base text-white/95 [text-shadow:0_1px_10px_rgba(10,20,50,0.6)] sm:text-lg">
          Book function halls, swimming pools, rooms and more for weddings, parties, corporate
          events and family gatherings.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="mt-8">
          <SearchCard />
        </motion.div>

        <motion.a
          {...fadeUp(0.45)}
          href="#gallery"
          className="group mt-8 flex w-fit items-center gap-3 lg:absolute lg:bottom-28 lg:right-8 lg:mt-0"
        >
          <span className="relative grid h-14 w-14 place-items-center rounded-full bg-white text-navy shadow-lg transition-transform group-hover:scale-110">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
            <Play className="relative h-5 w-5 fill-navy" />
          </span>
          <span className="text-sm font-semibold leading-tight">
            Watch Our
            <br />
            Venue Tour
          </span>
        </motion.a>
      </div>
    </section>
  );
}

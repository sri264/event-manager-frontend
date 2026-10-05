import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/ui/button';
import { ABOUT_IMAGE, ABOUT_POINTS, STATS } from '../data';

export function AboutSection() {
  return (
    <section className="bg-secondary/50 py-20">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <Reveal y={32} className="relative">
          <div className="overflow-hidden rounded-3xl bg-muted shadow-search">
            <img
              src={ABOUT_IMAGE}
              alt="EventNest resort at dusk"
              loading="lazy"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-6 rounded-2xl bg-navy px-6 py-4 text-white shadow-lg sm:left-8">
            <p className="font-serif text-4xl font-bold">{STATS[0].value}</p>
            <p className="text-sm text-white/80">{STATS[0].label}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">About Us</p>
          <h2 className="font-serif text-3xl font-bold leading-tight text-navy sm:text-4xl">
            Creating Memorable Experiences
          </h2>
          <p className="mt-5 text-muted-foreground">
            We provide premium venues, swimming pools and comfortable rooms for weddings, parties,
            corporate events and family gatherings.
          </p>
          <p className="mt-3 text-muted-foreground">
            Our goal is to make your special moments truly unforgettable with excellent service and
            world-class facilities.
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {ABOUT_POINTS.map(point => (
              <li key={point.title} className="rounded-xl bg-white p-4 shadow-card">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">
                  <point.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold text-navy">{point.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{point.description}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-t pt-6">
            {STATS.slice(1).map(stat => (
              <div key={stat.label}>
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="font-serif text-2xl font-bold text-navy">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <Button asChild size="lg" className="mt-8">
            <Link to="/about">
              Learn More <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

import { CalendarCheck, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/ui/button';
import { env } from '@/config/env';
import { CTA_IMAGE } from '../data';

export function CtaSection() {
  return (
    <section className="container py-20">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl bg-navy px-6 py-14 text-center text-white sm:px-12">
          <img
            src={CTA_IMAGE}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900 via-navy-900/85 to-primary/60" />

          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl text-balance">
            Ready to Plan Your <span className="text-gold-400">Perfect Event?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Check live availability and reserve your venue in minutes, or talk to our team for a
            personalised recommendation.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/halls">
                <CalendarCheck /> Book a Venue
              </Link>
            </Button>
            {env.supportPhone && (
              <Button asChild size="lg" variant="white">
                <a href={`tel:${env.supportPhone.replace(/\s/g, '')}`}>
                  <Phone /> {env.supportPhone}
                </a>
              </Button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

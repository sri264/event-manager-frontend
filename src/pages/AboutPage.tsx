import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/ui/button';
import { ABOUT_IMAGE, ABOUT_POINTS, FACILITIES, STATS } from './home/data';

export default function AboutPage() {
  return (
    <div>
      <section className="bg-navy-900 py-16 text-white">
        <div className="container">
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">About EventNest</h1>
          <p className="mt-3 max-w-2xl text-white/80">
            We bring premium function halls, swimming pools and rooms together on one platform, so
            planning a celebration is as joyful as the event itself.
          </p>
        </div>
      </section>

      <section className="container grid items-center gap-10 py-16 lg:grid-cols-2">
        <Reveal>
          <img
            src={ABOUT_IMAGE}
            alt="EventNest venue"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-card"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our story</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-navy">
            Celebrate every moment, stress-free
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            EventNest started with a simple idea: booking a venue should take minutes, not weeks of
            phone calls. Today we manage curated halls, pools and rooms with real-time availability,
            transparent pricing and secure payments. Our team supports you from the first enquiry
            until the last guest leaves.
          </p>
          <ul className="mt-6 space-y-4">
            {ABOUT_POINTS.map(point => (
              <li key={point.title} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <point.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-navy">{point.title}</p>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="bg-secondary/50 py-14">
        <div className="container grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {STATS.map(stat => (
            <div key={stat.label}>
              <p className="font-serif text-4xl font-bold text-navy">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-center font-serif text-3xl font-bold text-navy">What we offer</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {FACILITIES.map(facility => (
            <Link
              key={facility.title}
              to={facility.to}
              className="group overflow-hidden rounded-2xl border bg-white shadow-card transition hover:-translate-y-1"
            >
              <img src={facility.image} alt="" className="aspect-[16/10] w-full object-cover" />
              <div className="p-5">
                <p className="font-bold text-navy">{facility.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{facility.description}</p>
                <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary">
                  {facility.linkLabel}{' '}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/contact">Talk to our team</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

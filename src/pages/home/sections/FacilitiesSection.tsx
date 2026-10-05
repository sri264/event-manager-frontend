import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeading } from '@/components/common/SectionHeading';
import { FACILITIES } from '../data';

export function FacilitiesSection() {
  return (
    <section className="container py-20">
      <SectionHeading
        eyebrow="Our Facilities"
        title="Explore Our Spaces"
        description="Choose from our premium facilities designed for every occasion."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {FACILITIES.map((facility, index) => (
          <Reveal key={facility.title} delay={index * 0.1}>
            <Link
              to={facility.to}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={facility.image}
                  alt={facility.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="relative flex flex-1 flex-col px-6 pb-6 pt-9">
                <span className="absolute -top-7 left-6 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-primary text-white shadow-md">
                  <facility.icon className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-xl font-bold text-navy">{facility.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{facility.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {facility.linkLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

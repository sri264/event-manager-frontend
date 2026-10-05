import { Reveal } from '@/components/common/Reveal';
import { SectionHeading } from '@/components/common/SectionHeading';
import { AMENITIES } from '../data';

export function AmenitiesSection() {
  return (
    <section className="border-y bg-white py-16">
      <div className="container">
        <SectionHeading eyebrow="Amenities" title="Everything You Need for a Perfect Event" />

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {AMENITIES.map((amenity, index) => (
            <li key={amenity.label}>
              <Reveal delay={index * 0.05}>
                <div className="group flex flex-col items-center gap-3 rounded-2xl p-4 text-center transition-colors hover:bg-secondary/60">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border bg-white text-primary shadow-sm transition-all group-hover:-translate-y-1 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    <amenity.icon className="h-6 w-6" />
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{amenity.label}</span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

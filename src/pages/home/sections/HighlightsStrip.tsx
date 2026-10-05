import { Reveal } from '@/components/common/Reveal';
import { HERO_HIGHLIGHTS } from '../data';

export function HighlightsStrip() {
  return (
    <section className="container relative z-10 -mt-14">
      <Reveal>
        <ul className="grid grid-cols-2 gap-y-6 rounded-2xl border bg-white p-5 shadow-card sm:p-6 lg:grid-cols-4 lg:divide-x">
          {HERO_HIGHLIGHTS.map(item => (
            <li key={item.title} className="flex items-center gap-3 px-2 lg:justify-center lg:px-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-navy">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

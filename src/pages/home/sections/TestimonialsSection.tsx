import { useQuery } from '@tanstack/react-query';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeading } from '@/components/common/SectionHeading';
import { cn } from '@/lib/utils';
import { reviewsApi } from '@/lib/api/admin';
import { initials } from '@/lib/format';
import { TESTIMONIALS, type Testimonial } from '../data';

export function TestimonialsSection() {
  const { data: reviews } = useQuery({
    queryKey: ['reviews', 'featured'],
    queryFn: reviewsApi.featured,
  });
  const items: Testimonial[] =
    reviews && reviews.length >= 3
      ? reviews.map(review => ({
          quote: review.comment,
          name: review.customer?.name ?? 'EventNest guest',
          occasion: review.booking?.eventType ?? review.venue?.name ?? 'Verified booking',
          rating: review.rating,
        }))
      : TESTIMONIALS;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 5000, stopOnMouseEnter: true, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      setSelected(emblaApi.selectedScrollSnap());
      setSnapCount(emblaApi.scrollSnapList().length);
    };
    sync();
    emblaApi.on('select', sync).on('reInit', sync);
    return () => {
      emblaApi.off('select', sync).off('reInit', sync);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="bg-secondary/50 py-20">
      <div className="container">
        <div className="relative">
          <SectionHeading
            eyebrow="Testimonials"
            title="What Our Customers Say"
            description="Real experiences from our happy customers."
          />
          <div className="mt-6 flex justify-center gap-2 md:absolute md:bottom-0 md:right-0 md:mt-0">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={scrollPrev}
              className="grid h-10 w-10 place-items-center rounded-full border bg-white text-navy shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={scrollNext}
              className="grid h-10 w-10 place-items-center rounded-full border bg-white text-navy shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Reveal className="mt-10">
          <div ref={emblaRef} className="-mx-3 overflow-hidden py-2">
            <div className="flex">
              {items.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="min-w-0 shrink-0 grow-0 basis-full px-3 md:basis-1/2 lg:basis-1/3"
                >
                  <figure className="relative flex h-full flex-col rounded-2xl bg-white p-6 shadow-card">
                    <Quote className="absolute right-5 top-5 h-8 w-8 text-secondary" />
                    <div className="flex gap-0.5" aria-label={`${item.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < item.rating ? 'fill-gold text-gold' : 'text-slate-300',
                          )}
                        />
                      ))}
                    </div>
                    <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt=""
                          loading="lazy"
                          className="h-11 w-11 rounded-full bg-muted object-cover"
                        />
                      ) : (
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {initials(item.name)}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-bold text-navy">{item.name}</p>
                        <p className="text-xs text-primary">{item.occasion}</p>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: snapCount }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                i === selected ? 'w-6 bg-primary' : 'w-2 bg-primary/25 hover:bg-primary/50',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

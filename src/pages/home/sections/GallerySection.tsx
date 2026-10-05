import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { cn } from '@/lib/utils';
import {
  GALLERY_FILTERS,
  GALLERY_IMAGES,
  galleryFull,
  galleryThumb,
  type GalleryCategory,
  type GalleryImage,
} from '../data';

const ALL_LIMIT = 8;

interface LightboxProps {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const image = images[index];
  const step = (delta: number) => onNavigate((index + delta + images.length) % images.length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onNavigate((index + 1) % images.length);
      if (event.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [index, images.length, onClose, onNavigate]);

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-label={image.alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/95 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X />
      </button>
      <button
        type="button"
        aria-label="Previous image"
        onClick={event => {
          event.stopPropagation();
          step(-1);
        }}
        className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
      >
        <ChevronLeft />
      </button>
      <motion.figure
        key={image.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl"
        onClick={event => event.stopPropagation()}
      >
        <img
          src={galleryFull(image.id)}
          alt={image.alt}
          className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
        />
        <figcaption className="mt-3 text-center text-sm text-white/80">
          {image.alt} · {index + 1} / {images.length}
        </figcaption>
      </motion.figure>
      <button
        type="button"
        aria-label="Next image"
        onClick={event => {
          event.stopPropagation();
          step(1);
        }}
        className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
      >
        <ChevronRight />
      </button>
    </motion.div>
  );
}

export function GallerySection() {
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const images = useMemo(
    () =>
      filter === 'all'
        ? GALLERY_IMAGES.slice(0, ALL_LIMIT)
        : GALLERY_IMAGES.filter(image => image.category === filter),
    [filter],
  );

  return (
    <section id="gallery" className="scroll-mt-20 bg-background py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Gallery"
          title="Moments from Our Venues"
          description="Take a look at some of the beautiful events and experiences at our venues."
        />

        <div className="mt-8 flex justify-center">
          <div className="flex gap-2 overflow-x-auto rounded-full border bg-white p-1.5 shadow-sm scrollbar-none">
            {GALLERY_FILTERS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={cn(
                  'relative shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                  filter === option.value ? 'text-white' : 'text-slate-600 hover:text-primary',
                )}
              >
                {filter === option.value && (
                  <motion.span
                    layoutId="gallery-filter"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.ul layout className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {images.map((image, index) => (
              <motion.li
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.35 }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted"
                  aria-label={`Open image: ${image.alt}`}
                >
                  <img
                    src={galleryThumb(image.id)}
                    alt={image.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-navy-900/70 via-transparent to-transparent p-3 text-left text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {image.alt}
                    <Expand className="h-4 w-4 shrink-0" />
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox
            images={images}
            index={openIndex}
            onClose={() => setOpenIndex(null)}
            onNavigate={setOpenIndex}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

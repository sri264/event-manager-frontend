import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  light?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'mb-2 text-xs font-bold uppercase tracking-[0.2em]',
            light ? 'text-gold-300' : 'text-primary',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'font-serif text-3xl font-bold leading-tight sm:text-4xl text-balance',
          light ? 'text-white' : 'text-navy',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-3 text-sm sm:text-base',
            light ? 'text-white/75' : 'text-muted-foreground',
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

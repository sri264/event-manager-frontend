import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-7 w-7' };

export function RatingStars({ value, onChange, size = 'md' }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-0.5" role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map(star => {
        const icon = (
          <Star
            className={cn(
              SIZES[size],
              star <= Math.round(value) ? 'fill-gold text-gold' : 'fill-slate-200 text-slate-200',
            )}
          />
        );
        return onChange ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            className="rounded p-0.5 transition-transform hover:scale-110"
          >
            {icon}
          </button>
        ) : (
          <span key={star}>{icon}</span>
        );
      })}
    </div>
  );
}

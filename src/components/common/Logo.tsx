import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  to?: string;
  light?: boolean;
  suffix?: string;
  className?: string;
}

export function Logo({ to = '/', light = false, suffix, className }: LogoProps) {
  return (
    <Link to={to} className={cn('flex items-center gap-2', className)} aria-label="EventNest home">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary shadow-sm">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden>
          <path
            d="M6 15.5 16 7l10 8.5V25a1 1 0 0 1-1 1h-5.5v-6.5h-7V26H7a1 1 0 0 1-1-1v-9.5Z"
            fill="#fff"
          />
        </svg>
      </span>
      <span
        className={cn('text-xl font-extrabold tracking-tight', light ? 'text-white' : 'text-navy')}
      >
        Event<span className="text-primary">Nest</span>
        {suffix && (
          <span
            className={cn(
              'ml-1.5 text-sm font-semibold',
              light ? 'text-white/70' : 'text-muted-foreground',
            )}
          >
            {suffix}
          </span>
        )}
      </span>
    </Link>
  );
}

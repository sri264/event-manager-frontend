import { CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from '@/components/common/Logo';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  title: string;
  subtitle: string;
  image: string;
  variant?: 'customer' | 'admin';
  children: ReactNode;
}

const CUSTOMER_POINTS = [
  { icon: CalendarCheck, text: 'Real-time availability for halls, pools & rooms' },
  { icon: ShieldCheck, text: 'Secure payments and instant confirmation' },
  { icon: Sparkles, text: 'Manage, edit or cancel bookings anytime' },
];

const ADMIN_POINTS = [
  { icon: CalendarCheck, text: 'Bookings, calendar and venue availability' },
  { icon: ShieldCheck, text: 'Payments, refunds and revenue tracking' },
  { icon: Sparkles, text: 'Customers, reviews and support requests' },
];

export function AuthShell({
  title,
  subtitle,
  image,
  variant = 'customer',
  children,
}: AuthShellProps) {
  const points = variant === 'admin' ? ADMIN_POINTS : CUSTOMER_POINTS;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className={cn(
            'absolute inset-0',
            variant === 'admin'
              ? 'bg-gradient-to-br from-navy-900/95 via-navy-900/85 to-navy-700/70'
              : 'bg-gradient-to-br from-navy-900/90 via-navy-900/60 to-primary/40',
          )}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo light suffix={variant === 'admin' ? 'Admin' : undefined} />
          <div>
            <h2 className="max-w-md font-serif text-4xl font-bold leading-tight">
              {variant === 'admin' ? (
                <>
                  Run every venue from <span className="text-gold-400">one place</span>
                </>
              ) : (
                <>
                  Celebrate life&apos;s <span className="text-gold-400">special moments</span>
                </>
              )}
            </h2>
            <ul className="mt-8 space-y-4">
              {points.map(point => (
                <li key={point.text} className="flex items-center gap-3 text-white/85">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10">
                    <point.icon className="h-4 w-4" />
                  </span>
                  {point.text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/50">© {new Date().getFullYear()} EventNest</p>
        </div>
      </div>

      <div className={cn('flex flex-col', variant === 'admin' ? 'bg-slate-50' : 'bg-background')}>
        <div className="p-6 lg:hidden">
          <Logo suffix={variant === 'admin' ? 'Admin' : undefined} />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-navy">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

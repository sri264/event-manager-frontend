import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: 'blue' | 'green' | 'amber' | 'violet' | 'rose';
}

const TONES = {
  blue: 'bg-primary/10 text-primary',
  green: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  violet: 'bg-violet-100 text-violet-600',
  rose: 'bg-rose-100 text-rose-600',
};

export function StatCard({ label, value, icon: Icon, hint, tone = 'blue' }: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-2xl font-extrabold text-navy">{value}</p>
        </div>
        <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', TONES[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

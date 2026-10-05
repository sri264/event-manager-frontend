import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api/client';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-4 py-14 text-center', className)}
    >
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <p className="font-semibold text-navy">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-4 py-14 text-center', className)}
    >
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <p className="font-semibold text-navy">Couldn&apos;t load this data</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center py-16', className)}>
      <span className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  );
}

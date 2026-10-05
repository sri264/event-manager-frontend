import { useQuery } from '@tanstack/react-query';
import { getHealth } from '@/lib/api/health';
import { cn } from '@/lib/utils';

export function ApiStatus({ className }: { className?: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 30_000,
    retry: false,
  });

  const ok = !isError && data?.database === 'up';
  const label = isLoading
    ? 'Checking server…'
    : isError
      ? 'Server offline'
      : ok
        ? 'All systems operational'
        : 'Database offline';

  return (
    <span className={cn('inline-flex items-center gap-2 text-xs', className)}>
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isLoading ? 'bg-amber-400' : ok ? 'bg-emerald-400' : 'bg-red-500',
        )}
      />
      {label}
    </span>
  );
}

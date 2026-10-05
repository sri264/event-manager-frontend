import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <p className="text-muted-foreground">
        Page {page} of {totalPages} · {total} records
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

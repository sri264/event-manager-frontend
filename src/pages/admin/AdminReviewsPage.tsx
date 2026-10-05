import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Search, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState, ErrorState, Spinner } from '@/components/common/DataStates';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { RatingStars } from '@/components/common/RatingStars';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { adminReviewsApi } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/api/client';
import { formatDate, initials, VENUE_TYPE_LABEL } from '@/lib/format';
import type { Review } from '@/types/models';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search.trim());
  const [rating, setRating] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Review | null>(null);

  const filters = {
    search: debounced,
    rating: Number(rating) || undefined,
    visibility,
    page,
    limit: 10,
  };
  const query = useQuery({
    queryKey: ['admin', 'reviews', filters],
    queryFn: () => adminReviewsApi.list(filters),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['reviews'] });
    void queryClient.invalidateQueries({ queryKey: ['venues'] });
  };

  const toggle = useMutation({
    mutationFn: (review: Review) => adminReviewsApi.setVisibility(review.id, !review.isVisible),
    onSuccess: review => {
      toast.success(
        review.isVisible ? 'Review is now visible' : 'Review hidden from the public site',
      );
      invalidate();
    },
    onError: error => toast.error(getErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (review: Review) => adminReviewsApi.remove(review.id),
    onSuccess: () => {
      toast.success('Review deleted');
      setDeleting(null);
      invalidate();
    },
    onError: error => toast.error(getErrorMessage(error)),
  });

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Moderate customer reviews. Hidden reviews don't count towards ratings."
      />

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-card md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search comment, customer or venue"
            className="pl-9"
          />
        </div>
        <div className="md:w-40">
          <Select
            value={rating}
            onChange={event => {
              setRating(event.target.value);
              setPage(1);
            }}
            aria-label="Rating"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map(r => (
              <option key={r} value={r}>
                {r} star{r > 1 ? 's' : ''}
              </option>
            ))}
          </Select>
        </div>
        <div className="md:w-40">
          <Select
            value={visibility}
            onChange={event => {
              setVisibility(event.target.value);
              setPage(1);
            }}
            aria-label="Visibility"
          >
            <option value="all">All reviews</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-card">
        {query.isLoading ? (
          <Spinner />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : !query.data?.items.length ? (
          <EmptyState icon={Star} title="No reviews found" />
        ) : (
          <>
            <ul className="divide-y">
              {query.data.items.map(review => (
                <li key={review.id} className="flex flex-col gap-4 p-5 md:flex-row">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {initials(review.customer?.name ?? '?')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-navy">{review.customer?.name}</p>
                      <RatingStars value={review.rating} size="sm" />
                      {!review.isVisible && <Badge variant="muted">Hidden</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {review.venue?.name} (
                      {review.venue ? VENUE_TYPE_LABEL[review.venue.type] : ''}) · #
                      {review.booking?.bookingCode} · {formatDate(review.createdAt)}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
                  </div>
                  <div className="flex shrink-0 gap-2 md:flex-col">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggle.mutate(review)}
                      disabled={toggle.isPending}
                    >
                      {review.isVisible ? <EyeOff /> : <Eye />} {review.isVisible ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleting(review)}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              onChange={setPage}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
        loading={remove.isPending}
        destructive
        title="Delete this review?"
        confirmLabel="Delete"
        description="The review is removed permanently and the venue rating is recalculated."
      />
    </div>
  );
}

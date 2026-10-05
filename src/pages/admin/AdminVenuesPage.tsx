import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Eye, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState, ErrorState, Spinner } from '@/components/common/DataStates';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import { getErrorMessage } from '@/lib/api/client';
import { adminVenuesApi } from '@/lib/api/venues';
import { formatDate, formatINR, VENUE_TYPE_LABEL } from '@/lib/format';
import { resolveImage } from '@/lib/image';
import type { AdminVenue, VenueType } from '@/types/venue';
import { VenueFormModal } from './components/VenueFormModal';

const TITLES: Record<VenueType, string> = {
  hall: 'Function Halls',
  pool: 'Swimming Pools',
  room: 'Rooms',
};

function VenueViewModal({
  id,
  onClose,
  onEdit,
}: {
  id: number | null;
  onClose: () => void;
  onEdit: (v: AdminVenue) => void;
}) {
  const query = useQuery({
    queryKey: ['admin', 'venue', id],
    queryFn: () => adminVenuesApi.get(id!),
    enabled: id !== null,
  });
  const venue = query.data;

  return (
    <Modal
      open={id !== null}
      onClose={onClose}
      size="xl"
      title={venue?.name ?? 'Venue'}
      description={venue ? `${VENUE_TYPE_LABEL[venue.type]} · ${venue.location}` : undefined}
    >
      {query.isLoading ? (
        <Spinner />
      ) : query.isError || !venue ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {venue.images.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={resolveImage(image)}
                alt=""
                className={
                  index === 0
                    ? 'col-span-2 row-span-2 aspect-square h-full w-full rounded-xl object-cover'
                    : 'aspect-square w-full rounded-xl object-cover'
                }
              />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['Price', `${formatINR(venue.price)} / ${venue.priceUnit}`],
              ['Capacity', `${venue.capacity} guests`],
              ['Bookings', venue.bookingCount],
              ['Revenue', formatINR(venue.revenue ?? 0)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-bold text-navy">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={venue.isActive ? 'success' : 'muted'}>
              {venue.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {venue.isFeatured && <Badge variant="warning">Featured</Badge>}
            <Badge variant="outline">
              <Star className="h-3 w-3 fill-gold text-gold" /> {venue.rating.toFixed(1)} (
              {venue.reviewCount} reviews)
            </Badge>
            <Badge variant="outline">Added {formatDate(venue.createdAt)}</Badge>
          </div>
          <p className="text-sm text-slate-600">{venue.address}</p>
          <p className="whitespace-pre-line text-sm text-slate-700">{venue.description}</p>
          {venue.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {venue.amenities.map(a => (
                <Badge key={a}>{a}</Badge>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button onClick={() => onEdit(venue)}>
              <Pencil /> Edit
            </Button>
            <Button asChild variant="outline">
              <Link to={`/admin/bookings?venueId=${venue.id}`}>View bookings</Link>
            </Button>
            {venue.isActive && (
              <Button asChild variant="ghost">
                <Link to={`/facilities/${venue.slug}`} target="_blank">
                  <ExternalLink /> Public page
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AdminVenuesPage({ type }: { type: VenueType }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search.trim());
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminVenue | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<AdminVenue | null>(null);

  const filters = { type, status, search: debounced, page, limit: 10 };
  const query = useQuery({
    queryKey: ['admin', 'venues', filters],
    queryFn: () => adminVenuesApi.list(filters),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['venues'] });
  };

  const toggle = useMutation({
    mutationFn: (venue: AdminVenue) => adminVenuesApi.setStatus(venue.id, !venue.isActive),
    onSuccess: venue => {
      toast.success(`${venue.name} is now ${venue.isActive ? 'active' : 'inactive'}`);
      invalidate();
    },
    onError: error => toast.error(getErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (venue: AdminVenue) => adminVenuesApi.remove(venue.id),
    onSuccess: () => {
      toast.success('Venue deleted');
      setDeleting(null);
      invalidate();
    },
    onError: error => {
      toast.error(getErrorMessage(error));
      setDeleting(null);
    },
  });

  const openForm = (venue: AdminVenue | null) => {
    setEditing(venue);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={TITLES[type]}
        description={`Create, edit and manage your ${TITLES[type].toLowerCase()}.`}
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus /> Add {VENUE_TYPE_LABEL[type].toLowerCase()}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-card sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or location"
            className="pl-9"
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={status}
            onChange={event => {
              setStatus(event.target.value as typeof status);
              setPage(1);
            }}
            aria-label="Status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-card">
        {query.isLoading ? (
          <Spinner />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : !query.data?.items.length ? (
          <EmptyState
            title={`No ${TITLES[type].toLowerCase()} found`}
            action={
              <Button onClick={() => openForm(null)}>
                <Plus /> Add {VENUE_TYPE_LABEL[type].toLowerCase()}
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Venue</TH>
                  <TH>Capacity</TH>
                  <TH className="text-right">Price</TH>
                  <TH>Rating</TH>
                  <TH>Bookings</TH>
                  <TH>Active</TH>
                  <TH className="text-right">Actions</TH>
                </tr>
              </THead>
              <TBody>
                {query.data.items.map(venue => (
                  <TR key={venue.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveImage(venue.images[0])}
                          alt=""
                          className="h-12 w-16 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-semibold text-navy">
                            {venue.name}
                            {venue.isFeatured && (
                              <Star
                                className="h-3.5 w-3.5 fill-gold text-gold"
                                aria-label="Featured"
                              />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{venue.location}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>{venue.capacity}</TD>
                    <TD className="whitespace-nowrap text-right font-semibold">
                      {formatINR(venue.price)}
                      <span className="text-xs font-normal text-muted-foreground">
                        {' '}
                        /{venue.priceUnit}
                      </span>
                    </TD>
                    <TD>
                      {venue.reviewCount
                        ? `${venue.rating.toFixed(1)} (${venue.reviewCount})`
                        : '—'}
                    </TD>
                    <TD>{venue.bookingCount}</TD>
                    <TD>
                      <Switch
                        checked={venue.isActive}
                        onCheckedChange={() => toggle.mutate(venue)}
                        disabled={toggle.isPending}
                        label={`Toggle ${venue.name}`}
                      />
                    </TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="View"
                          onClick={() => setViewId(venue.id)}
                        >
                          <Eye />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Edit"
                          onClick={() => openForm(venue)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Delete"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleting(venue)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Pagination
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              onChange={setPage}
            />
          </>
        )}
      </div>

      <VenueFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        type={type}
        venue={editing}
      />
      <VenueViewModal
        id={viewId}
        onClose={() => setViewId(null)}
        onEdit={venue => {
          setViewId(null);
          openForm(venue);
        }}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
        loading={remove.isPending}
        destructive
        title={`Delete ${deleting?.name}?`}
        confirmLabel="Delete venue"
        description={
          deleting?.bookingCount
            ? `This venue has ${deleting.bookingCount} booking(s) and can't be deleted. Mark it inactive instead to hide it from customers.`
            : 'This permanently removes the venue. This action cannot be undone.'
        }
      />
    </div>
  );
}

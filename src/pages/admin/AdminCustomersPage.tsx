import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Search, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { EmptyState, ErrorState, Spinner } from '@/components/common/DataStates';
import { FormField } from '@/components/common/FormField';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import { customersApi } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/api/client';
import { handleFormError } from '@/lib/errors';
import { formatDate, formatDateRange, formatDateTime, formatINR, initials } from '@/lib/format';
import {
  emailField,
  nameField,
  optionalText,
  PASSWORD_MESSAGE,
  PASSWORD_REGEX,
  phoneField,
} from '@/lib/validation';
import type { Customer } from '@/types/models';
import { BookingViewModal } from './components/BookingViewModal';

const schema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  city: optionalText(100),
  password: z.string().optional(),
});
type Values = z.infer<typeof schema>;
const FIELDS = ['name', 'email', 'phone', 'city', 'password'] as const;

function CustomerFormModal({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}) {
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    reset({
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      city: customer?.city ?? '',
      password: '',
    });
    setIsActive(customer?.isActive ?? true);
  }, [open, customer, reset]);

  const onSubmit = async ({ password, city, ...values }: Values) => {
    if ((!customer || password) && !PASSWORD_REGEX.test(password ?? '')) {
      return setError('password', {
        message: customer ? PASSWORD_MESSAGE : `Password is required. ${PASSWORD_MESSAGE}`,
      });
    }
    const payload = { ...values, city: city ?? '', isActive, ...(password ? { password } : {}) };
    try {
      if (customer) {
        await customersApi.update(customer.id, payload);
        toast.success('Customer updated');
      } else {
        await customersApi.create({ ...payload, password: password! });
        toast.success('Customer created');
      }
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      onClose();
    } catch (error) {
      handleFormError(error, setError, FIELDS);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={customer ? `Edit ${customer.name}` : 'Add customer'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : customer ? 'Save changes' : 'Create customer'}
          </Button>
        </>
      }
    >
      <form
        id="customer-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid gap-4 sm:grid-cols-2"
      >
        <FormField label="Full name" htmlFor="c-name" error={errors.name?.message} required>
          <Input id="c-name" {...register('name')} />
        </FormField>
        <FormField label="Email" htmlFor="c-email" error={errors.email?.message} required>
          <Input id="c-email" type="email" {...register('email')} />
        </FormField>
        <FormField label="Phone" htmlFor="c-phone" error={errors.phone?.message} required>
          <Input id="c-phone" type="tel" {...register('phone')} />
        </FormField>
        <FormField label="City" htmlFor="c-city" error={errors.city?.message}>
          <Input id="c-city" {...register('city')} />
        </FormField>
        <FormField
          label={customer ? 'New password' : 'Password'}
          htmlFor="c-password"
          error={errors.password?.message}
          hint={customer ? 'Leave blank to keep the current password' : PASSWORD_MESSAGE}
          required={!customer}
        >
          <PasswordInput id="c-password" autoComplete="new-password" {...register('password')} />
        </FormField>
        <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium">
          <Switch checked={isActive} onCheckedChange={setIsActive} label="Active" />
          {isActive ? 'Active (can sign in)' : 'Blocked (cannot sign in)'}
        </label>
      </form>
    </Modal>
  );
}

function CustomerViewModal({
  id,
  onClose,
  onEdit,
}: {
  id: number | null;
  onClose: () => void;
  onEdit: (c: Customer) => void;
}) {
  const [bookingId, setBookingId] = useState<number | null>(null);
  const query = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: () => customersApi.get(id!),
    enabled: id !== null,
  });
  const customer = query.data;

  return (
    <>
      <Modal
        open={id !== null}
        onClose={onClose}
        size="xl"
        title={customer?.name ?? 'Customer'}
        description={customer?.email}
      >
        {query.isLoading ? (
          <Spinner />
        ) : query.isError || !customer ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-lg font-bold text-white">
                {initials(customer.name)}
              </span>
              <div className="flex-1 text-sm">
                <p>
                  {customer.phone ?? '—'} · {customer.city || 'City not set'}
                </p>
                <p className="text-muted-foreground">
                  Joined {formatDate(customer.createdAt)} · Last login{' '}
                  {formatDateTime(customer.lastLoginAt)}
                </p>
              </div>
              <Badge variant={customer.isActive ? 'success' : 'destructive'}>
                {customer.isActive ? 'Active' : 'Blocked'}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Bookings', customer.bookingCount],
                ['Total spent', formatINR(customer.totalSpent)],
                ['Last booking', formatDate(customer.lastBookingAt)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-bold text-navy">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-navy">Recent bookings</h3>
              {customer.bookings.length ? (
                <ul className="divide-y rounded-xl border">
                  {customer.bookings.map(booking => (
                    <li key={booking.id}>
                      <button
                        type="button"
                        onClick={() => setBookingId(booking.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-muted/50"
                      >
                        <span>
                          <span className="block font-semibold">
                            #{booking.bookingCode} · {booking.venue?.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {formatDateRange(booking.startDate, booking.endDate)} ·{' '}
                            {booking.eventType}
                          </span>
                        </span>
                        <span className="flex items-center gap-3">
                          <b>{formatINR(booking.totalAmount)}</b>
                          <StatusBadge status={booking.status} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button onClick={() => onEdit(customer)}>
                <Pencil /> Edit
              </Button>
              <Button asChild variant="outline">
                <Link to={`/admin/bookings?customerId=${customer.id}`}>All bookings</Link>
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <BookingViewModal bookingId={bookingId} onClose={() => setBookingId(null)} />
    </>
  );
}

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search.trim());
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);

  const filters = { search: debounced, status, page, limit: 10 };
  const query = useQuery({
    queryKey: ['admin', 'customers', filters],
    queryFn: () => customersApi.list(filters),
    placeholderData: keepPreviousData,
  });

  const toggle = useMutation({
    mutationFn: (customer: Customer) => customersApi.setStatus(customer.id, !customer.isActive),
    onSuccess: customer => {
      toast.success(`${customer.name} ${customer.isActive ? 'unblocked' : 'blocked'}`);
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: error => toast.error(getErrorMessage(error)),
  });

  const openForm = (customer: Customer | null) => {
    setEditing(customer);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage customer accounts and view their booking history."
        actions={
          <Button onClick={() => openForm(null)}>
            <UserPlus /> Add customer
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
            placeholder="Search name, email, phone or city"
            className="pl-9"
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={status}
            onChange={event => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Status"
          >
            <option value="all">All customers</option>
            <option value="active">Active</option>
            <option value="inactive">Blocked</option>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-card">
        {query.isLoading ? (
          <Spinner />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : !query.data?.items.length ? (
          <EmptyState title="No customers found" />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Customer</TH>
                  <TH>Phone</TH>
                  <TH>City</TH>
                  <TH>Bookings</TH>
                  <TH className="text-right">Total spent</TH>
                  <TH>Joined</TH>
                  <TH>Active</TH>
                  <TH className="text-right">Actions</TH>
                </tr>
              </THead>
              <TBody>
                {query.data.items.map(customer => (
                  <TR key={customer.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(customer.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-navy">{customer.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>{customer.phone ?? '—'}</TD>
                    <TD>{customer.city || '—'}</TD>
                    <TD>{customer.bookingCount}</TD>
                    <TD className="text-right font-semibold">{formatINR(customer.totalSpent)}</TD>
                    <TD className="whitespace-nowrap">{formatDate(customer.createdAt)}</TD>
                    <TD>
                      <Switch
                        checked={!!customer.isActive}
                        onCheckedChange={() => toggle.mutate(customer)}
                        disabled={toggle.isPending}
                        label={`Toggle ${customer.name}`}
                      />
                    </TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="View"
                          onClick={() => setViewId(customer.id)}
                        >
                          <Eye />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Edit"
                          onClick={() => openForm(customer)}
                        >
                          <Pencil />
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

      <CustomerFormModal open={formOpen} onClose={() => setFormOpen(false)} customer={editing} />
      <CustomerViewModal
        id={viewId}
        onClose={() => setViewId(null)}
        onEdit={customer => {
          setViewId(null);
          openForm(customer);
        }}
      />
    </div>
  );
}

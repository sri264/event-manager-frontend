import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { BookingDetailsFields } from '@/components/booking/BookingDetailsForm';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { useVenueQuote } from '@/hooks/useVenueQuote';
import { customersApi } from '@/lib/api/admin';
import { adminBookingsApi } from '@/lib/api/bookings';
import { getErrorMessage } from '@/lib/api/client';
import { adminVenuesApi } from '@/lib/api/venues';
import { handleFormError } from '@/lib/errors';
import { formatINRPrecise, VENUE_TYPE_LABEL } from '@/lib/format';
import { bookingDetailsSchema, type BookingDetailsValues } from '@/lib/validation';
import type { BookingDetail } from '@/types/models';

interface AdminBookingFormModalProps {
  open: boolean;
  onClose: () => void;
  booking?: BookingDetail | null;
  onCreated?: (id: number) => void;
}

const FIELDS = ['guests', 'eventType', 'contactName', 'contactPhone', 'notes'] as const;
const today = () => dayjs().format('YYYY-MM-DD');

export function AdminBookingFormModal({
  open,
  onClose,
  booking,
  onCreated,
}: AdminBookingFormModalProps) {
  const editing = !!booking;
  const queryClient = useQueryClient();

  const [customerSearch, setCustomerSearch] = useState('');
  const debouncedSearch = useDebounce(customerSearch.trim());
  const [customerId, setCustomerId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'PENDING' | 'CONFIRMED'>('PENDING');
  const [formError, setFormError] = useState('');

  const customers = useQuery({
    queryKey: ['admin', 'customers', 'picker', debouncedSearch],
    queryFn: () => customersApi.list({ search: debouncedSearch, status: 'active', limit: 20 }),
    enabled: open && !editing,
  });
  const venues = useQuery({
    queryKey: ['admin', 'venues', 'picker'],
    queryFn: () => adminVenuesApi.list({ status: 'active', limit: 100 }),
    enabled: open && !editing,
  });

  const selectedVenue = editing
    ? booking.venue
    : venues.data?.items.find(v => String(v.id) === venueId);
  const effectiveVenueId = editing ? booking.venueId : Number(venueId) || undefined;
  const datesChanged = !editing || startDate !== booking.startDate || endDate !== booking.endDate;
  const quote = useVenueQuote(
    open && datesChanged ? effectiveVenueId : undefined,
    startDate,
    endDate,
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingDetailsValues>({ resolver: zodResolver(bookingDetailsSchema) });

  useEffect(() => {
    if (!open) return;
    setFormError('');
    if (booking) {
      setStartDate(booking.startDate);
      setEndDate(booking.endDate);
      reset({
        guests: booking.guests,
        eventType: booking.eventType,
        contactName: booking.contactName,
        contactPhone: booking.contactPhone,
        notes: booking.notes ?? '',
      });
    } else {
      setCustomerSearch('');
      setCustomerId('');
      setVenueId('');
      setStartDate('');
      setEndDate('');
      setStatus('PENDING');
      reset({ guests: 1, eventType: '', contactName: '', contactPhone: '', notes: '' });
    }
  }, [open, booking, reset]);

  const onCustomerPick = (id: string) => {
    setCustomerId(id);
    const customer = customers.data?.items.find(c => String(c.id) === id);
    if (customer) {
      reset(values => ({
        ...values,
        contactName: customer.name,
        contactPhone: customer.phone ?? '',
      }));
    }
  };

  const onSubmit = async (values: BookingDetailsValues) => {
    setFormError('');
    if (!editing && (!customerId || !venueId)) return setFormError('Select a customer and a venue');
    if (!startDate || !endDate) return setFormError('Select the booking dates');
    if (selectedVenue?.capacity && values.guests > selectedVenue.capacity) {
      return setError('guests', { message: `Maximum ${selectedVenue.capacity} guests` });
    }
    try {
      if (editing) {
        await adminBookingsApi.update(booking.id, {
          ...values,
          notes: values.notes ?? '',
          ...(datesChanged ? { startDate, endDate } : {}),
        });
        toast.success('Booking updated');
      } else {
        const created = await adminBookingsApi.create({
          customerId: Number(customerId),
          venueId: Number(venueId),
          startDate,
          endDate,
          status,
          ...values,
          notes: values.notes || undefined,
        });
        toast.success(`Booking #${created.bookingCode} created`);
        onCreated?.(created.id);
      }
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['venues'] });
      onClose();
    } catch (error) {
      handleFormError(error, setError, FIELDS);
    }
  };

  const isNight = selectedVenue?.priceUnit === 'night';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={editing ? `Edit booking #${booking.bookingCode}` : 'Create booking'}
      description={
        editing ? 'Changing dates re-prices the booking.' : 'Book a venue on behalf of a customer.'
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="admin-booking-form"
            disabled={isSubmitting || (datesChanged && quote.data?.available === false && !editing)}
          >
            {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Create booking'}
          </Button>
        </>
      }
    >
      <form
        id="admin-booking-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6"
      >
        {!editing && (
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Customer" htmlFor="customer" required>
              <Input
                placeholder="Search name, email or phone"
                value={customerSearch}
                onChange={event => setCustomerSearch(event.target.value)}
                className="mb-2"
              />
              <Select
                id="customer"
                value={customerId}
                onChange={event => onCustomerPick(event.target.value)}
              >
                <option value="">{customers.isLoading ? 'Loading…' : 'Select customer'}</option>
                {customers.data?.items.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} · {customer.email}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Venue" htmlFor="venue" required>
              <Select
                id="venue"
                value={venueId}
                onChange={event => setVenueId(event.target.value)}
                className="md:mt-12"
              >
                <option value="">{venues.isLoading ? 'Loading…' : 'Select venue'}</option>
                {venues.data?.items.map(venue => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} · {VENUE_TYPE_LABEL[venue.type]} · {venue.location}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.2fr]">
          <FormField label={isNight ? 'Check-in' : 'Start date'} htmlFor="startDate" required>
            <Input
              id="startDate"
              type="date"
              min={today()}
              value={startDate}
              onChange={event => {
                const value = event.target.value;
                setStartDate(value);
                if (!endDate || endDate < value) {
                  setEndDate(isNight ? dayjs(value).add(1, 'day').format('YYYY-MM-DD') : value);
                }
              }}
            />
          </FormField>
          <FormField label={isNight ? 'Check-out' : 'End date'} htmlFor="endDate" required>
            <Input
              id="endDate"
              type="date"
              min={startDate || today()}
              value={endDate}
              onChange={event => setEndDate(event.target.value)}
            />
          </FormField>
          {!editing ? (
            <FormField
              label="Initial status"
              htmlFor="status"
              hint="Confirmed = reserved without payment"
            >
              <Select
                id="status"
                value={status}
                onChange={event => setStatus(event.target.value as typeof status)}
              >
                <option value="PENDING">Pending (awaiting payment)</option>
                <option value="CONFIRMED">Confirmed</option>
              </Select>
            </FormField>
          ) : (
            <div className="rounded-xl bg-muted/60 p-3 text-sm">
              <p className="text-xs text-muted-foreground">Current total</p>
              <p className="font-bold text-navy">{formatINRPrecise(booking.totalAmount)}</p>
            </div>
          )}
        </div>

        {datesChanged && startDate && endDate && effectiveVenueId && (
          <div className="rounded-xl border p-4">
            {quote.isFetching && !quote.data && (
              <p className="text-sm text-muted-foreground">Calculating…</p>
            )}
            {quote.isError && (
              <p className="text-sm text-destructive">{getErrorMessage(quote.error)}</p>
            )}
            {quote.data && (
              <>
                {!editing && (
                  <p
                    className={
                      quote.data.available
                        ? 'mb-3 text-sm font-semibold text-emerald-600'
                        : 'mb-3 text-sm font-semibold text-destructive'
                    }
                  >
                    {quote.data.available
                      ? 'Venue is available'
                      : 'Venue is already booked for these dates'}
                  </p>
                )}
                {editing && (
                  <p className="mb-3 text-sm font-semibold text-navy">
                    New price for the selected dates
                  </p>
                )}
                <PriceBreakdown {...quote.data} />
              </>
            )}
          </div>
        )}

        <BookingDetailsFields
          register={register}
          errors={errors}
          maxGuests={selectedVenue?.capacity}
        />
        {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
      </form>
    </Modal>
  );
}

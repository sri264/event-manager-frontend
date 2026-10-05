import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { bookingsApi } from '@/lib/api/bookings';
import { handleFormError } from '@/lib/errors';
import { bookingDetailsSchema, type BookingDetailsValues } from '@/lib/validation';
import type { BookingDetail } from '@/types/models';
import { BookingDetailsFields } from './BookingDetailsForm';

interface EditBookingModalProps {
  booking: BookingDetail;
  open: boolean;
  onClose: () => void;
}

const FIELDS = ['guests', 'eventType', 'contactName', 'contactPhone', 'notes'] as const;

export function EditBookingModal({ booking, open, onClose }: EditBookingModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingDetailsValues>({ resolver: zodResolver(bookingDetailsSchema) });

  useEffect(() => {
    if (open) {
      reset({
        guests: booking.guests,
        eventType: booking.eventType,
        contactName: booking.contactName,
        contactPhone: booking.contactPhone,
        notes: booking.notes ?? '',
      });
    }
  }, [open, booking, reset]);

  const onSubmit = async (values: BookingDetailsValues) => {
    try {
      await bookingsApi.updateMine(booking.id, { ...values, notes: values.notes ?? '' });
      toast.success('Booking details updated');
      void queryClient.invalidateQueries({ queryKey: ['my'] });
      onClose();
    } catch (error) {
      handleFormError(error, setError, FIELDS);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit booking details"
      description="Dates can't be changed online. Contact support to reschedule."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-booking" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form id="edit-booking" onSubmit={handleSubmit(onSubmit)} noValidate>
        <BookingDetailsFields
          register={register}
          errors={errors}
          maxGuests={booking.venue.capacity}
        />
      </form>
    </Modal>
  );
}

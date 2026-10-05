import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField } from '@/components/common/FormField';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EVENT_TYPES, type BookingDetailsValues } from '@/lib/validation';

interface BookingDetailsFieldsProps {
  register: UseFormRegister<BookingDetailsValues>;
  errors: FieldErrors<BookingDetailsValues>;
  maxGuests?: number;
}

/** Guests, event type, contact and notes: shared by the booking, edit and admin forms. */
export function BookingDetailsFields({ register, errors, maxGuests }: BookingDetailsFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        label="Guests"
        htmlFor="guests"
        error={errors.guests?.message}
        hint={maxGuests ? `Maximum ${maxGuests}` : undefined}
        required
      >
        <Input
          id="guests"
          type="number"
          min={1}
          max={maxGuests}
          {...register('guests', { valueAsNumber: true })}
        />
      </FormField>
      <FormField label="Event type" htmlFor="eventType" error={errors.eventType?.message} required>
        <Select id="eventType" {...register('eventType')}>
          <option value="">Select event type</option>
          {EVENT_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Contact name"
        htmlFor="contactName"
        error={errors.contactName?.message}
        required
      >
        <Input id="contactName" {...register('contactName')} />
      </FormField>
      <FormField
        label="Contact phone"
        htmlFor="contactPhone"
        error={errors.contactPhone?.message}
        required
      >
        <Input id="contactPhone" type="tel" {...register('contactPhone')} />
      </FormField>
      <FormField
        label="Special requests"
        htmlFor="notes"
        error={errors.notes?.message}
        className="sm:col-span-2"
      >
        <Textarea id="notes" placeholder="Decoration, catering, timing…" {...register('notes')} />
      </FormField>
    </div>
  );
}

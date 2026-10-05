import dayjs from 'dayjs';
import type { PriceUnit, VenueType } from '@/types/venue';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrPreciseFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatINR = (amount: number) => inrFormatter.format(amount);

export const formatINRPrecise = (amount: number) => inrPreciseFormatter.format(amount);

export const formatDate = (value: string | Date | null | undefined, pattern = 'D MMM YYYY') =>
  value ? dayjs(value).format(pattern) : '—';

export const formatDateTime = (value: string | Date | null | undefined) =>
  formatDate(value, 'D MMM YYYY, h:mm A');

export const formatDateRange = (start: string, end: string) =>
  start === end
    ? formatDate(start)
    : dayjs(start).year() === dayjs(end).year()
      ? `${formatDate(start, 'D MMM')} – ${formatDate(end)}`
      : `${formatDate(start)} – ${formatDate(end)}`;

export const VENUE_TYPE_LABEL: Record<VenueType, string> = {
  hall: 'Function Hall',
  pool: 'Swimming Pool',
  room: 'Room',
};

export const VENUE_TYPE_ROUTE: Record<VenueType, string> = {
  hall: '/halls',
  pool: '/pools',
  room: '/rooms',
};

export const unitLabel = (unit: PriceUnit, count: number) =>
  `${count} ${unit === 'night' ? (count === 1 ? 'night' : 'nights') : count === 1 ? 'day' : 'days'}`;

export const capacityLabel = (type: VenueType, capacity: number) =>
  type === 'room' ? `Up to ${capacity} guests` : `Up to ${capacity} Guests`;

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  UPI: 'UPI',
  CARD: 'Card',
  NET_BANKING: 'Net Banking',
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
};

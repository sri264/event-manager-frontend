import type { Paginated } from '@/types/api';
import type {
  Booking,
  BookingDetail,
  BookingInput,
  BookingStatus,
  BookingSummary,
  BookingTab,
} from '@/types/models';
import type { VenueType } from '@/types/venue';
import { http } from './http';

export type BookingDetailsInput = Partial<
  Pick<BookingInput, 'guests' | 'eventType' | 'contactName' | 'contactPhone' | 'notes'>
>;

export interface AdminBookingFilters {
  status?: BookingStatus;
  venueType?: VenueType;
  venueId?: number;
  customerId?: number;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminBookingInput extends BookingInput {
  customerId: number;
  status?: 'PENDING' | 'CONFIRMED';
}

export const bookingsApi = {
  create: (input: BookingInput) => http.post<Booking>('/bookings', input),
  mine: (params: { tab?: BookingTab; page?: number; limit?: number; search?: string }) =>
    http.get<Paginated<Booking>>('/bookings/my', {
      ...params,
      tab: params.tab === 'all' ? undefined : params.tab,
    }),
  summary: () => http.get<BookingSummary>('/bookings/my/summary'),
  mineById: (id: number) => http.get<BookingDetail>(`/bookings/my/${id}`),
  updateMine: (id: number, input: BookingDetailsInput) =>
    http.patch<BookingDetail>(`/bookings/my/${id}`, input),
  cancelMine: (id: number, reason?: string) =>
    http.patch<BookingDetail>(`/bookings/my/${id}/cancel`, { reason }),
};

export const adminBookingsApi = {
  list: (filters: AdminBookingFilters = {}) =>
    http.get<Paginated<Booking>>('/admin/bookings', { ...filters }),
  get: (id: number) => http.get<BookingDetail>(`/admin/bookings/${id}`),
  create: (input: AdminBookingInput) => http.post<BookingDetail>('/admin/bookings', input),
  update: (id: number, input: BookingDetailsInput & { startDate?: string; endDate?: string }) =>
    http.patch<BookingDetail>(`/admin/bookings/${id}`, input),
  setStatus: (id: number, status: BookingStatus, reason?: string) =>
    http.patch<BookingDetail>(`/admin/bookings/${id}/status`, { status, reason }),
};

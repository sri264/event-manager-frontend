import type { Paginated } from '@/types/api';
import type { AdminVenue, Quote, Venue, VenueInput, VenueType } from '@/types/venue';
import { api } from './client';
import { http } from './http';
import type { ApiResponse } from '@/types/api';

export interface VenueFilters {
  type?: VenueType;
  location?: string;
  guests?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminVenueFilters {
  type?: VenueType;
  status?: 'all' | 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

export const venuesApi = {
  list: (filters: VenueFilters = {}) => http.get<Paginated<Venue>>('/venues', { ...filters }),
  locations: () => http.get<string[]>('/venues/locations'),
  bySlug: (slug: string) => http.get<Venue>(`/venues/${slug}`),
  bookedDates: (id: number) => http.get<string[]>(`/venues/${id}/booked-dates`),
  quote: (id: number, startDate: string, endDate: string) =>
    http.get<Quote>(`/venues/${id}/quote`, { startDate, endDate }),
};

export const adminVenuesApi = {
  list: (filters: AdminVenueFilters = {}) =>
    http.get<Paginated<AdminVenue>>('/admin/venues', { ...filters }),
  get: (id: number) => http.get<AdminVenue>(`/admin/venues/${id}`),
  create: (input: VenueInput) => http.post<Venue>('/admin/venues', input),
  update: (id: number, input: Partial<VenueInput>) =>
    http.patch<Venue>(`/admin/venues/${id}`, input),
  setStatus: (id: number, isActive: boolean) =>
    http.patch<Venue>(`/admin/venues/${id}/status`, { isActive }),
  remove: (id: number) => http.delete<null>(`/admin/venues/${id}`),
  uploadImage: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post<ApiResponse<{ url: string }>>('/admin/uploads', form);
    return res.data.data;
  },
};

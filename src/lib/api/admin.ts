import type { Paginated } from '@/types/api';
import type {
  BusinessSettings,
  CalendarData,
  Customer,
  CustomerDetail,
  DashboardOverview,
  Review,
  SupportTicket,
  TicketStatus,
} from '@/types/models';
import { http } from './http';

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  city?: string;
  password?: string;
  isActive?: boolean;
}

export const dashboardApi = {
  overview: () => http.get<DashboardOverview>('/admin/dashboard'),
  calendar: (month: string, venueId?: number) =>
    http.get<CalendarData>('/admin/calendar', { month, venueId }),
};

export const customersApi = {
  list: (params: { search?: string; status?: string; page?: number; limit?: number }) =>
    http.get<Paginated<Customer>>('/admin/customers', params),
  get: (id: number) => http.get<CustomerDetail>(`/admin/customers/${id}`),
  create: (input: CustomerInput) => http.post<CustomerDetail>('/admin/customers', input),
  update: (id: number, input: Partial<CustomerInput>) =>
    http.patch<CustomerDetail>(`/admin/customers/${id}`, input),
  setStatus: (id: number, isActive: boolean) =>
    http.patch<CustomerDetail>(`/admin/customers/${id}/status`, { isActive }),
};

export const reviewsApi = {
  featured: () => http.get<Review[]>('/reviews/featured'),
  forVenue: (venueId: number, page = 1) =>
    http.get<Paginated<Review>>(`/reviews/venue/${venueId}`, { page, limit: 5 }),
  create: (input: { bookingId: number; rating: number; comment: string }) =>
    http.post<Review>('/reviews', input),
  updateMine: (id: number, input: { rating?: number; comment?: string }) =>
    http.patch<Review>(`/reviews/my/${id}`, input),
};

export const adminReviewsApi = {
  list: (params: {
    rating?: number;
    visibility?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => http.get<Paginated<Review>>('/admin/reviews', params),
  setVisibility: (id: number, isVisible: boolean) =>
    http.patch<Review>(`/admin/reviews/${id}/visibility`, { isVisible }),
  remove: (id: number) => http.delete<null>(`/admin/reviews/${id}`),
};

export const supportApi = {
  contact: (input: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => http.post<SupportTicket>('/support/contact', input),
  create: (input: { subject: string; message: string; bookingId?: number }) =>
    http.post<SupportTicket>('/support', input),
  mine: (params: { page?: number; limit?: number } = {}) =>
    http.get<Paginated<SupportTicket>>('/support/my', params),
};

export const adminSupportApi = {
  list: (params: { status?: TicketStatus; search?: string; page?: number; limit?: number }) =>
    http.get<Paginated<SupportTicket>>('/admin/support', params),
  get: (id: number) => http.get<SupportTicket>(`/admin/support/${id}`),
  update: (id: number, input: { status?: TicketStatus; adminReply?: string }) =>
    http.patch<SupportTicket>(`/admin/support/${id}`, input),
};

export const settingsApi = {
  public: () => http.get<BusinessSettings>('/settings/public'),
  get: () => http.get<BusinessSettings>('/admin/settings'),
  update: (input: Partial<BusinessSettings>) =>
    http.patch<BusinessSettings>('/admin/settings', input),
};

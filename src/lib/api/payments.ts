import type { Paginated } from '@/types/api';
import type {
  BookingStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  TransactionStatus,
} from '@/types/models';
import { http } from './http';

export interface PaymentResult {
  payment: Payment;
  booking: { id: number; status: BookingStatus; paymentStatus: PaymentStatus };
}

export interface AdminPaymentFilters {
  status?: TransactionStatus;
  method?: PaymentMethod;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminPaymentList extends Paginated<Payment> {
  summary: { collected: number; refunded: number; successCount: number; refundCount: number };
}

export const paymentsApi = {
  pay: (bookingId: number, method: PaymentMethod) =>
    http.post<PaymentResult>('/payments', { bookingId, method }),
  mine: (params: { page?: number; limit?: number } = {}) =>
    http.get<Paginated<Payment>>('/payments/my', params),
};

export const adminPaymentsApi = {
  list: (filters: AdminPaymentFilters = {}) =>
    http.get<AdminPaymentList>('/admin/payments', { ...filters }),
  record: (input: { bookingId: number; amount: number; method: PaymentMethod; note?: string }) =>
    http.post<PaymentResult>('/admin/payments', input),
  refund: (id: number, note?: string) =>
    http.patch<Payment>(`/admin/payments/${id}/refund`, { note }),
};

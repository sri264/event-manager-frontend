import type { AuthUser } from './auth';
import type { VenueRef } from './venue';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH' | 'BANK_TRANSFER';
export type TransactionStatus = 'SUCCESS' | 'REFUNDED';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type BookingTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

export type CustomerRef = Pick<AuthUser, 'id' | 'name' | 'email'> & { phone?: string | null };

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  transactionRef: string;
  paidAt: string;
  refundedAt: string | null;
  note: string | null;
  booking?: Pick<Booking, 'id' | 'bookingCode' | 'startDate' | 'endDate' | 'totalAmount'> & {
    venue?: VenueRef;
    customer?: CustomerRef;
  };
}

export interface Review {
  id: number;
  bookingId: number;
  venueId: number;
  customerId: number;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  customer?: CustomerRef;
  venue?: VenueRef;
  booking?: Pick<Booking, 'id' | 'eventType'> & { bookingCode?: string };
}

export interface Booking {
  id: number;
  bookingCode: string;
  customerId: number;
  venueId: number;
  startDate: string;
  endDate: string;
  units: number;
  guests: number;
  eventType: string;
  contactName: string;
  contactPhone: string;
  notes: string | null;
  unitPrice: number;
  baseAmount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  venue: VenueRef;
  customer?: CustomerRef;
}

export interface BookingDetail extends Booking {
  payments: Payment[];
  amountPaid: number;
  balanceDue: number;
  canEdit: boolean;
  canCancel: boolean;
  canPay: boolean;
  canReview: boolean;
  review: Review | null;
}

export interface BookingSummary {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
  nextBooking: Booking | null;
}

export interface BookingInput {
  venueId: number;
  startDate: string;
  endDate: string;
  guests: number;
  eventType: string;
  contactName: string;
  contactPhone: string;
  notes?: string;
}

export interface Customer extends AuthUser {
  bookingCount: number;
  totalSpent: number;
  lastBookingAt: string | null;
}

export interface CustomerDetail extends Customer {
  bookings: Booking[];
}

export interface SupportTicket {
  id: number;
  userId: number | null;
  bookingId: number | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: TicketStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  booking?: Pick<Booking, 'id' | 'bookingCode'> | null;
}

export interface BusinessSettings {
  businessName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  gstPercent: number;
  freeCancellationDays: number;
  cancellationPolicy: string;
}

export interface DashboardOverview {
  stats: {
    totalBookings: number;
    revenue: number;
    customers: number;
    activeVenues: number;
    pendingBookings: number;
    openTickets: number;
    revenueThisMonth: number;
    bookingsThisMonth: number;
  };
  statusBreakdown: Record<BookingStatus, number>;
  typeBreakdown: Partial<Record<'hall' | 'pool' | 'room', number>>;
  revenueByMonth: { month: string; total: number }[];
  recentBookings: Booking[];
  todaysEvents: Booking[];
}

export interface CalendarData {
  month: string;
  start: string;
  end: string;
  bookings: Booking[];
}

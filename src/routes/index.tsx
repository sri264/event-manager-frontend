import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GuestOnly, RequireAuth } from '@/components/auth/RequireAuth';
import { AccountLayout } from '@/layouts/AccountLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import HomePage from '@/pages/home/HomePage';

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const VenueListPage = lazy(() => import('@/pages/venues/VenueListPage'));
const VenueDetailPage = lazy(() => import('@/pages/venues/VenueDetailPage'));
const BookingPage = lazy(() => import('@/pages/venues/BookingPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const AdminLoginPage = lazy(() => import('@/pages/auth/AdminLoginPage'));

const AccountDashboardPage = lazy(() => import('@/pages/account/AccountDashboardPage'));
const MyBookingsPage = lazy(() => import('@/pages/account/MyBookingsPage'));
const BookingDetailPage = lazy(() => import('@/pages/account/BookingDetailPage'));
const InvoicePage = lazy(() => import('@/pages/account/InvoicePage'));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'));
const MyPaymentsPage = lazy(() => import('@/pages/account/MyPaymentsPage'));
const SupportPage = lazy(() => import('@/pages/account/SupportPage'));

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminVenuesPage = lazy(() => import('@/pages/admin/AdminVenuesPage'));
const AdminBookingsPage = lazy(() => import('@/pages/admin/AdminBookingsPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'));
const AdminCalendarPage = lazy(() => import('@/pages/admin/AdminCalendarPage'));
const AdminPaymentsPage = lazy(() => import('@/pages/admin/AdminPaymentsPage'));
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage'));
const AdminSupportPage = lazy(() => import('@/pages/admin/AdminSupportPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
  </div>
);

const page = (node: ReactNode) => <Suspense fallback={<PageLoader />}>{node}</Suspense>;

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'halls', element: page(<VenueListPage key="hall" type="hall" />) },
      { path: 'pools', element: page(<VenueListPage key="pool" type="pool" />) },
      { path: 'rooms', element: page(<VenueListPage key="room" type="room" />) },
      { path: 'facilities/:slug', element: page(<VenueDetailPage />) },
      { path: 'about', element: page(<AboutPage />) },
      { path: 'contact', element: page(<ContactPage />) },
      {
        path: 'book/:slug',
        element: <RequireAuth role="CUSTOMER">{page(<BookingPage />)}</RequireAuth>,
      },
      { path: 'my-bookings', element: <Navigate to="/account/bookings" replace /> },
      {
        path: 'account',
        element: (
          <RequireAuth role="CUSTOMER">
            <AccountLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: page(<AccountDashboardPage />) },
          { path: 'bookings', element: page(<MyBookingsPage />) },
          { path: 'bookings/:id', element: page(<BookingDetailPage />) },
          { path: 'profile', element: page(<ProfilePage />) },
          { path: 'payments', element: page(<MyPaymentsPage />) },
          { path: 'support', element: page(<SupportPage />) },
        ],
      },
    ],
  },
  {
    path: '/account/bookings/:id/invoice',
    element: <RequireAuth role="CUSTOMER">{page(<InvoicePage />)}</RequireAuth>,
  },
  { path: '/login', element: <GuestOnly role="CUSTOMER">{page(<LoginPage />)}</GuestOnly> },
  { path: '/register', element: <GuestOnly role="CUSTOMER">{page(<RegisterPage />)}</GuestOnly> },
  { path: '/admin/login', element: <GuestOnly role="ADMIN">{page(<AdminLoginPage />)}</GuestOnly> },
  {
    path: '/admin',
    element: (
      <RequireAuth role="ADMIN">
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: page(<AdminDashboardPage />) },
      { path: 'halls', element: page(<AdminVenuesPage key="hall" type="hall" />) },
      { path: 'rooms', element: page(<AdminVenuesPage key="room" type="room" />) },
      { path: 'pools', element: page(<AdminVenuesPage key="pool" type="pool" />) },
      { path: 'bookings', element: page(<AdminBookingsPage />) },
      { path: 'customers', element: page(<AdminCustomersPage />) },
      { path: 'calendar', element: page(<AdminCalendarPage />) },
      { path: 'payments', element: page(<AdminPaymentsPage />) },
      { path: 'reviews', element: page(<AdminReviewsPage />) },
      { path: 'support', element: page(<AdminSupportPage />) },
      { path: 'settings', element: page(<AdminSettingsPage />) },
    ],
  },
  { path: '*', element: page(<NotFoundPage />) },
]);

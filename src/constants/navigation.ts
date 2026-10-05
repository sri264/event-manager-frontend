import {
  BedDouble,
  Building2,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Star,
  TicketCheck,
  Users,
  Waves,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon?: LucideIcon;
}

export const PUBLIC_NAV: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Function Halls', to: '/halls' },
  { label: 'Swimming Pools', to: '/pools' },
  { label: 'Rooms', to: '/rooms' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Function Halls', to: '/admin/halls', icon: Building2 },
  { label: 'Rooms', to: '/admin/rooms', icon: BedDouble },
  { label: 'Swimming Pools', to: '/admin/pools', icon: Waves },
  { label: 'Bookings', to: '/admin/bookings', icon: TicketCheck },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Calendar', to: '/admin/calendar', icon: CalendarDays },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
  { label: 'Support', to: '/admin/support', icon: LifeBuoy },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '@/config/env';
import { useAppSelector } from '@/hooks/redux';
import { useLogout } from '@/hooks/useLogout';
import { ApiStatus } from './ApiStatus';
import { Logo } from './Logo';

const VENUE_LINKS = [
  { label: 'Function Halls', to: '/halls' },
  { label: 'Swimming Pools', to: '/pools' },
  { label: 'Rooms', to: '/rooms' },
];

const GUEST_LINKS = [
  { label: 'Customer Login', to: '/login' },
  { label: 'Admin Login', to: '/admin/login' },
];

const CUSTOMER_LINKS = [{ label: 'My Account', to: '/account' }];

const ADMIN_LINKS = [{ label: 'Admin Panel', to: '/admin/dashboard' }];

export function Footer() {
  const status = useAppSelector(state => state.auth.status);
  const user = useAppSelector(state => state.auth.user);
  const logout = useLogout();

  const signedIn = status === 'authenticated' && !!user;
  const isAdmin = signedIn && user.role === 'ADMIN';

  const exploreLinks = isAdmin
    ? VENUE_LINKS
    : [...VENUE_LINKS, { label: 'My Bookings', to: '/my-bookings' }];

  const accountLinks =
    status === 'checking' ? [] : !signedIn ? GUEST_LINKS : isAdmin ? ADMIN_LINKS : CUSTOMER_LINKS;

  const companyLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    ...accountLinks,
  ];

  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="text-sm leading-relaxed text-slate-400">
            Book function halls, swimming pools and rooms for weddings, parties, corporate events
            and relaxing stays — all in one place.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Explore</h4>
          <ul className="space-y-2 text-sm">
            {exploreLinks.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Company</h4>
          <ul className="space-y-2 text-sm">
            {companyLinks.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            {signedIn && (
              <li>
                <button
                  type="button"
                  onClick={() => logout(isAdmin ? '/admin/login' : '/')}
                  className="hover:text-white"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Get in touch</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> {env.supportPhone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> {env.supportEmail}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Bengaluru, Karnataka
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} EventNest. All rights reserved.</p>
          <ApiStatus />
        </div>
      </div>
    </footer>
  );
}

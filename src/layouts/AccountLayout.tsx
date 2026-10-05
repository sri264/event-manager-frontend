import {
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  UserRound,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { useLogout } from '@/hooks/useLogout';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

const ACCOUNT_NAV = [
  { label: 'Dashboard', to: '/account', icon: LayoutDashboard, end: true },
  { label: 'My Bookings', to: '/account/bookings', icon: CalendarCheck },
  { label: 'Profile', to: '/account/profile', icon: UserRound },
  { label: 'Payments', to: '/account/payments', icon: CreditCard },
  { label: 'Support', to: '/account/support', icon: LifeBuoy },
];

export function AccountLayout() {
  const user = useAppSelector(state => state.auth.user);
  const logout = useLogout();

  return (
    <div className="bg-muted/40">
      <div className="container grid gap-6 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border bg-white p-4 shadow-card lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b pb-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-base font-bold text-white">
              {user ? initials(user.name) : '?'}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold text-navy">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <nav className="mt-3 flex gap-1 overflow-x-auto scrollbar-none lg:flex-col">
            {ACCOUNT_NAV.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-muted',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => logout()}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

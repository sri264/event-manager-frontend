import {
  CalendarCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PUBLIC_NAV } from '@/constants/navigation';
import { useAppSelector } from '@/hooks/redux';
import { useLogout } from '@/hooks/useLogout';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

function LoginMenu({ onDark }: { onDark: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(onDark && 'text-white hover:bg-white/10 hover:text-white')}
        >
          Login <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Sign in as</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/login">
            <UserRound className="text-primary" />
            <div>
              <p className="font-semibold">Customer</p>
              <p className="text-xs text-muted-foreground">Book & manage your bookings</p>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/admin/login">
            <ShieldCheck className="text-navy" />
            <div>
              <p className="font-semibold">Admin</p>
              <p className="text-xs text-muted-foreground">Manage venues & bookings</p>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ onDark }: { onDark: boolean }) {
  const user = useAppSelector(state => state.auth.user)!;
  const logout = useLogout();
  const isAdmin = user.role === 'ADMIN';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn('gap-2 px-2', onDark && 'text-white hover:bg-white/10 hover:text-white')}
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-white">
            {initials(user.name)}
          </span>
          <span className="hidden max-w-[120px] truncate md:block">{user.name.split(' ')[0]}</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate font-semibold">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link to="/admin/dashboard">
              <LayoutDashboard /> Admin panel
            </Link>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/account">
                <LayoutDashboard /> Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/account/bookings">
                <CalendarCheck /> My Bookings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/account/profile">
                <UserRound /> Profile
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => logout()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const authStatus = useAppSelector(state => state.auth.status);
  const signedIn = authStatus === 'authenticated';
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const transparent = isHome && !scrolled && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative py-1 text-sm font-medium transition-colors',
      transparent
        ? isActive
          ? 'text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold-400'
          : 'text-white/80 hover:text-white'
        : isActive
          ? 'text-primary'
          : 'text-slate-600 hover:text-primary',
    );

  return (
    <header
      className={cn(
        'top-0 z-40 transition-colors duration-300',
        isHome ? 'fixed inset-x-0' : 'sticky',
        transparent
          ? 'border-b border-white/10 bg-transparent'
          : 'border-b bg-white/95 shadow-sm backdrop-blur',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <Logo light={transparent} />

        <nav className="hidden items-center gap-7 lg:flex">
          {PUBLIC_NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <UserMenu onDark={transparent} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <LoginMenu onDark={transparent} />
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'lg:hidden',
              transparent && 'text-white hover:bg-white/10 hover:text-white',
            )}
            onClick={() => setMobileOpen(open => !open)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-white lg:hidden">
          <nav className="container flex flex-col gap-1 py-3">
            {PUBLIC_NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium',
                    isActive ? 'bg-secondary text-primary' : 'text-slate-700 hover:bg-muted',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            {signedIn ? (
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setMobileOpen(false);
                  void logout();
                }}
              >
                <LogOut /> Logout
              </Button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <UserRound /> Customer
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/admin/login" onClick={() => setMobileOpen(false)}>
                    <ShieldCheck /> Admin
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="col-span-2">
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    Create an account
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

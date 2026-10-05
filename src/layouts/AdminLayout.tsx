import { ExternalLink, LifeBuoy, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { ADMIN_NAV } from '@/constants/navigation';
import { useAppSelector } from '@/hooks/redux';
import { useLogout } from '@/hooks/useLogout';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col bg-navy-900 text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Logo to="/admin/dashboard" suffix="Admin" light />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )
            }
          >
            {Icon && <Icon className="h-4 w-4" />}
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => logout('/admin/login')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-slate-100/70">
      <ScrollRestoration />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle navigation"
          >
            {open ? <X /> : <Menu />}
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/" target="_blank">
                <ExternalLink /> View site
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Support requests">
              <Link to="/admin/support">
                <LifeBuoy />
              </Link>
            </Button>
            <div className="ml-1 flex items-center gap-2 border-l pl-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                {user ? initials(user.name) : 'A'}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-semibold">{user?.name ?? 'Admin'}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

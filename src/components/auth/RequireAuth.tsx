import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/common/DataStates';
import { useAppSelector } from '@/hooks/redux';
import type { UserRole } from '@/types/auth';

interface RequireAuthProps {
  role: UserRole;
  children: ReactNode;
}

export function RequireAuth({ role, children }: RequireAuthProps) {
  const { status, user } = useAppSelector(state => state.auth);
  const location = useLocation();

  if (status === 'checking') {
    return <Spinner className="min-h-[60vh] items-center" />;
  }

  if (status !== 'authenticated' || user?.role !== role) {
    const loginPath = role === 'ADMIN' ? '/admin/login' : '/login';
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${loginPath}?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}

/** Sends already signed-in users away from the login/register screens. */
export function GuestOnly({ role, children }: RequireAuthProps) {
  const { status, user } = useAppSelector(state => state.auth);
  const params = new URLSearchParams(useLocation().search);

  if (status === 'authenticated' && user?.role === role) {
    const fallback = role === 'ADMIN' ? '/admin/dashboard' : '/account';
    const redirect = params.get('redirect');
    return <Navigate to={redirect?.startsWith('/') ? redirect : fallback} replace />;
  }
  return <>{children}</>;
}

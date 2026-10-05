import { useEffect, useRef, type ReactNode } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { authApi } from '@/lib/api/auth';
import { clearSession, setSession } from '@/store/authSlice';

/** Restores the session from the refresh cookie once on app load. */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    authApi
      .refresh()
      .then(session => dispatch(setSession(session)))
      .catch(() => dispatch(clearSession()));
  }, [dispatch]);

  return <>{children}</>;
}

import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { clearSession } from '@/store/authSlice';
import { useAppDispatch } from './redux';

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async (redirectTo = '/') => {
    await authApi.logout().catch(() => undefined);
    dispatch(clearSession());
    queryClient.clear();
    toast.success('You have been logged out');
    navigate(redirectTo, { replace: true });
  };
}

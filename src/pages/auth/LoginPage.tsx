import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch } from '@/hooks/redux';
import { authApi } from '@/lib/api/auth';
import { handleFormError } from '@/lib/errors';
import { loginSchema, type LoginValues } from '@/lib/validation';
import { setSession } from '@/store/authSlice';

const IMAGE =
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=75';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      const session = await authApi.login(values);
      dispatch(setSession(session));
      toast.success(`Welcome back, ${session.user.name.split(' ')[0]}!`);
      navigate(redirect?.startsWith('/') ? redirect : '/account', { replace: true });
    } catch (error) {
      handleFormError(error, setError, ['email', 'password']);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to book venues and manage your bookings."
      image={IMAGE}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField label="Email address" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
          />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
          />
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          <LogIn /> {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to EventNest?{' '}
        <Link
          to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
          className="font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Are you an administrator?{' '}
        <Link to="/admin/login" className="font-semibold text-navy hover:underline">
          Admin login
        </Link>
      </p>
    </AuthShell>
  );
}

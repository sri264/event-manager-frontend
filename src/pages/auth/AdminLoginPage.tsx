import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
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
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=75';

export default function AdminLoginPage() {
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
      const session = await authApi.adminLogin(values);
      dispatch(setSession(session));
      toast.success('Signed in to the admin panel');
      navigate(redirect?.startsWith('/admin') ? redirect : '/admin/dashboard', { replace: true });
    } catch (error) {
      handleFormError(error, setError, ['email', 'password']);
    }
  };

  return (
    <AuthShell
      variant="admin"
      title="Admin sign in"
      subtitle="Restricted area. Use your administrator credentials."
      image={IMAGE}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField label="Admin email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="admin@eventnest.com"
            {...register('email')}
          />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" {...register('password')} />
        </FormField>
        <Button
          type="submit"
          size="lg"
          className="w-full bg-navy hover:bg-navy-700"
          disabled={isSubmitting}
        >
          <ShieldCheck /> {isSubmitting ? 'Verifying…' : 'Sign in to admin'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Not an admin?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Customer login
        </Link>{' '}
        ·{' '}
        <Link to="/" className="font-semibold text-primary hover:underline">
          Back to site
        </Link>
      </p>
    </AuthShell>
  );
}

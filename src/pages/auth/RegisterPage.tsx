import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch } from '@/hooks/redux';
import { authApi } from '@/lib/api/auth';
import { handleFormError } from '@/lib/errors';
import { emailField, nameField, optionalText, passwordField, phoneField } from '@/lib/validation';
import { setSession } from '@/store/authSlice';

const IMAGE =
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=75';

const schema = z
  .object({
    name: nameField,
    email: emailField,
    phone: phoneField,
    city: optionalText(100),
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine(v => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ confirmPassword: _confirm, city, ...values }: Values) => {
    try {
      const session = await authApi.register({ ...values, city: city || undefined });
      dispatch(setSession(session));
      toast.success('Your account has been created');
      navigate(redirect?.startsWith('/') ? redirect : '/account', { replace: true });
    } catch (error) {
      handleFormError(error, setError, ['name', 'email', 'phone', 'city', 'password']);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Book halls, pools and rooms in a few clicks."
      image={IMAGE}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <FormField
          label="Full name"
          htmlFor="name"
          error={errors.name?.message}
          required
          className="sm:col-span-2"
        >
          <Input id="name" autoComplete="name" placeholder="Your name" {...register('name')} />
        </FormField>
        <FormField
          label="Email address"
          htmlFor="email"
          error={errors.email?.message}
          required
          className="sm:col-span-2"
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone" error={errors.phone?.message} required>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            {...register('phone')}
          />
        </FormField>
        <FormField label="City" htmlFor="city" error={errors.city?.message}>
          <Input
            id="city"
            autoComplete="address-level2"
            placeholder="Hyderabad"
            {...register('city')}
          />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <PasswordInput id="password" autoComplete="new-password" {...register('password')} />
        </FormField>
        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </FormField>
        <Button type="submit" size="lg" className="w-full sm:col-span-2" disabled={isSubmitting}>
          <UserPlus /> {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

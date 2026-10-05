import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { KeyRound, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Spinner } from '@/components/common/DataStates';
import { FormField } from '@/components/common/FormField';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { profileApi } from '@/lib/api/auth';
import { handleFormError } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import {
  changePasswordSchema,
  nameField,
  optionalText,
  phoneField,
  type ChangePasswordValues,
} from '@/lib/validation';
import { setSession } from '@/store/authSlice';

const profileSchema = z.object({ name: nameField, phone: phoneField, city: optionalText(100) });
type ProfileValues = z.infer<typeof profileSchema>;

export function ChangePasswordCard() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async ({ currentPassword, newPassword }: ChangePasswordValues) => {
    try {
      await profileApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      handleFormError(error, setError, ['currentPassword', 'newPassword']);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border bg-white p-6 shadow-card"
      noValidate
    >
      <h2 className="font-bold text-navy">Change password</h2>
      <p className="text-sm text-muted-foreground">
        Use at least 8 characters with a letter and a number.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <FormField
          label="Current password"
          htmlFor="currentPassword"
          error={errors.currentPassword?.message}
        >
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            {...register('currentPassword')}
          />
        </FormField>
        <FormField label="New password" htmlFor="newPassword" error={errors.newPassword?.message}>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            {...register('newPassword')}
          />
        </FormField>
        <FormField
          label="Confirm new password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </FormField>
      </div>
      <Button type="submit" variant="outline" className="mt-5" disabled={isSubmitting}>
        <KeyRound /> {isSubmitting ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(state => state.auth.accessToken);
  const profile = useQuery({ queryKey: ['my', 'profile'], queryFn: profileApi.get });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (profile.data) {
      reset({
        name: profile.data.name,
        phone: profile.data.phone ?? '',
        city: profile.data.city ?? '',
      });
    }
  }, [profile.data, reset]);

  const onSubmit = async (values: ProfileValues) => {
    try {
      const user = await profileApi.update({ ...values, city: values.city ?? '' });
      if (accessToken) dispatch(setSession({ user, accessToken }));
      reset({ name: user.name, phone: user.phone ?? '', city: user.city ?? '' });
      void profile.refetch();
      toast.success('Profile updated');
    } catch (error) {
      handleFormError(error, setError, ['name', 'phone', 'city']);
    }
  };

  if (profile.isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your personal details and password." />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border bg-white p-6 shadow-card"
        noValidate
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-navy">Personal details</h2>
          {profile.data?.createdAt && (
            <p className="text-xs text-muted-foreground">
              Member since {formatDate(profile.data.createdAt)}
            </p>
          )}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="name" error={errors.name?.message} required>
            <Input id="name" {...register('name')} />
          </FormField>
          <FormField label="Email address" htmlFor="email" hint="Email can't be changed">
            <Input id="email" value={profile.data?.email ?? ''} disabled readOnly />
          </FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message} required>
            <Input id="phone" type="tel" {...register('phone')} />
          </FormField>
          <FormField label="City" htmlFor="city" error={errors.city?.message}>
            <Input id="city" {...register('city')} />
          </FormField>
        </div>
        <Button type="submit" className="mt-5" disabled={isSubmitting || !isDirty}>
          <Save /> {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <ChangePasswordCard />
    </div>
  );
}

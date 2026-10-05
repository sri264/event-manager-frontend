import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ErrorState, Spinner } from '@/components/common/DataStates';
import { FormField } from '@/components/common/FormField';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { settingsApi } from '@/lib/api/admin';
import { handleFormError } from '@/lib/errors';
import { ChangePasswordCard } from '@/pages/account/ProfilePage';

const schema = z.object({
  businessName: z.string().trim().min(1, 'Business name is required').max(100),
  supportEmail: z.string().trim().email('Enter a valid email'),
  supportPhone: z.string().trim().min(1, 'Phone is required').max(20),
  address: z.string().trim().max(255),
  gstPercent: z
    .number({ invalid_type_error: 'Enter GST %' })
    .int('Whole numbers only')
    .min(0)
    .max(28),
  freeCancellationDays: z
    .number({ invalid_type_error: 'Enter days' })
    .int('Whole numbers only')
    .min(0)
    .max(90),
  cancellationPolicy: z.string().trim().max(1000),
});
type Values = z.infer<typeof schema>;
const FIELDS = Object.keys(schema.shape);

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'settings'], queryFn: settingsApi.get });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (query.data) reset(query.data);
  }, [query.data, reset]);

  const onSubmit = async (values: Values) => {
    try {
      const saved = await settingsApi.update(values);
      reset(saved);
      toast.success('Settings saved');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch (error) {
      handleFormError(error, setError, FIELDS);
    }
  };

  if (query.isLoading) return <Spinner />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Business details, tax and cancellation rules." />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border bg-white p-6 shadow-card"
        noValidate
      >
        <h2 className="font-bold text-navy">Business details</h2>
        <p className="text-sm text-muted-foreground">Shown on invoices and the contact page.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <FormField
            label="Business name"
            htmlFor="businessName"
            error={errors.businessName?.message}
            required
          >
            <Input id="businessName" {...register('businessName')} />
          </FormField>
          <FormField
            label="Support email"
            htmlFor="supportEmail"
            error={errors.supportEmail?.message}
            required
          >
            <Input id="supportEmail" type="email" {...register('supportEmail')} />
          </FormField>
          <FormField
            label="Support phone"
            htmlFor="supportPhone"
            error={errors.supportPhone?.message}
            required
          >
            <Input id="supportPhone" {...register('supportPhone')} />
          </FormField>
          <FormField label="Address" htmlFor="address" error={errors.address?.message}>
            <Input id="address" {...register('address')} />
          </FormField>
        </div>

        <h2 className="mt-8 font-bold text-navy">Pricing & cancellation</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField
            label="GST (%)"
            htmlFor="gstPercent"
            error={errors.gstPercent?.message}
            hint="Applied to new bookings and quotes"
            required
          >
            <Input
              id="gstPercent"
              type="number"
              min={0}
              max={28}
              {...register('gstPercent', { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Free cancellation window (days before event)"
            htmlFor="freeCancellationDays"
            error={errors.freeCancellationDays?.message}
            hint="Customers cancelling earlier than this get a full refund"
            required
          >
            <Input
              id="freeCancellationDays"
              type="number"
              min={0}
              max={90}
              {...register('freeCancellationDays', { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Cancellation policy text"
            htmlFor="cancellationPolicy"
            error={errors.cancellationPolicy?.message}
            className="md:col-span-2"
          >
            <Textarea id="cancellationPolicy" rows={3} {...register('cancellationPolicy')} />
          </FormField>
        </div>
        <Button type="submit" className="mt-6" disabled={isSubmitting || !isDirty}>
          <Save /> {isSubmitting ? 'Saving…' : 'Save settings'}
        </Button>
      </form>

      <ChangePasswordCard />
    </div>
  );
}

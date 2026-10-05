import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { env } from '@/config/env';
import { useAppSelector } from '@/hooks/redux';
import { settingsApi, supportApi } from '@/lib/api/admin';
import { handleFormError } from '@/lib/errors';
import { emailField, nameField, PHONE_REGEX } from '@/lib/validation';

const schema = z.object({
  name: nameField,
  email: emailField,
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  subject: z.string().trim().min(1, 'Subject is required').max(150),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(3000),
});
type Values = z.infer<typeof schema>;

export default function ContactPage() {
  const user = useAppSelector(state => state.auth.user);
  const settings = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: settingsApi.public,
    staleTime: 300_000,
  });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user)
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        subject: '',
        message: '',
      });
  }, [user, reset]);

  const onSubmit = async (values: Values) => {
    try {
      await supportApi.contact({ ...values, phone: values.phone || undefined });
      toast.success('Thanks for reaching out! Our team will get back to you shortly.');
      reset({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        subject: '',
        message: '',
      });
    } catch (error) {
      handleFormError(error, setError, ['name', 'email', 'phone', 'subject', 'message']);
    }
  };

  const info = settings.data;
  const contacts = [
    { icon: Phone, label: 'Call us', value: info?.supportPhone || env.supportPhone },
    { icon: Mail, label: 'Email', value: info?.supportEmail || env.supportEmail },
    { icon: MapPin, label: 'Visit', value: info?.address || 'Bengaluru, India' },
    { icon: Clock, label: 'Hours', value: 'Mon – Sun, 9:00 AM – 9:00 PM' },
  ];

  return (
    <div>
      <section className="bg-navy-900 py-16 text-white">
        <div className="container">
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">Contact Us</h1>
          <p className="mt-3 max-w-xl text-white/80">
            Questions about a venue, a booking or a custom event? We&apos;re happy to help.
          </p>
        </div>
      </section>

      <div className="container grid gap-8 py-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {contacts.map(item => (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-card"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-semibold text-navy">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border bg-white p-6 shadow-card sm:p-8"
          noValidate
        >
          <h2 className="text-xl font-bold text-navy">Send us a message</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
              <Input id="name" {...register('name')} />
            </FormField>
            <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" {...register('email')} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" {...register('phone')} />
            </FormField>
            <FormField label="Subject" htmlFor="subject" error={errors.subject?.message} required>
              <Input id="subject" {...register('subject')} />
            </FormField>
            <FormField
              label="Message"
              htmlFor="message"
              error={errors.message?.message}
              required
              className="sm:col-span-2"
            >
              <Textarea id="message" rows={6} {...register('message')} />
            </FormField>
          </div>
          <Button type="submit" size="lg" className="mt-6" disabled={isSubmitting}>
            <Send /> {isSubmitting ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      </div>
    </div>
  );
}

import { z } from 'zod';

/** Mirrors the backend DTO rules so users see errors before submitting. */
export const PHONE_REGEX = /^[+]?[0-9\s-]{10,15}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;
export const PASSWORD_MESSAGE = 'Use 8-64 characters with at least one letter and one number';

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(150);
export const phoneField = z.string().trim().regex(PHONE_REGEX, 'Enter a valid phone number');
export const passwordField = z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE);
export const nameField = z.string().trim().min(1, 'Name is required').max(100);
export const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(''));

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine(v => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const EVENT_TYPES = [
  'Wedding',
  'Reception',
  'Engagement',
  'Birthday Party',
  'Corporate Event',
  'Conference',
  'Pool Party',
  'Family Get-together',
  'Stay',
  'Other',
];

export const bookingDetailsSchema = z.object({
  guests: z
    .number({ invalid_type_error: 'Enter number of guests' })
    .int()
    .min(1, 'At least 1 guest'),
  eventType: z.string().trim().min(1, 'Select the event type').max(60),
  contactName: nameField,
  contactPhone: phoneField,
  notes: optionalText(1000),
});
export type BookingDetailsValues = z.infer<typeof bookingDetailsSchema>;

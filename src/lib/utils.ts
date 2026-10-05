import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { env } from '@/config/env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatINR = (amount: number) => inrFormatter.format(amount);

/** Resolves backend upload paths (`/uploads/...`); leaves local `/images/...` and absolute URLs as-is. */
export const assetUrl = (path?: string | null) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path) || !path.startsWith('/uploads/')) return path;
  return `${env.assetBaseUrl}${path}`;
};

import axios from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { toast } from 'sonner';
import type { ApiErrorBody } from '@/types/api';
import { getErrorMessage } from './api/client';

/** Maps backend field errors onto the form, and toasts the general message. */
export const handleFormError = <T extends FieldValues>(
  error: unknown,
  setError?: UseFormSetError<T>,
  fields?: readonly string[],
) => {
  if (axios.isAxiosError<ApiErrorBody>(error) && setError) {
    const fieldErrors = error.response?.data?.errors ?? [];
    let mapped = false;
    for (const item of fieldErrors) {
      if (!fields || fields.includes(item.field)) {
        setError(item.field as Path<T>, { message: item.message });
        mapped = true;
      }
    }
    if (mapped) return;
  }
  toast.error(getErrorMessage(error));
};

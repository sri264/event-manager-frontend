import type { ApiResponse } from '@/types/api';
import { api } from './client';

type Params = Record<string, string | number | boolean | undefined | null>;

const clean = (params?: Params) =>
  params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
      )
    : undefined;

/** Thin wrappers that unwrap the `{ success, message, data }` envelope. */
export const http = {
  get: async <T>(url: string, params?: Params) =>
    (await api.get<ApiResponse<T>>(url, { params: clean(params) })).data.data,
  post: async <T>(url: string, body?: unknown) =>
    (await api.post<ApiResponse<T>>(url, body)).data.data,
  patch: async <T>(url: string, body?: unknown) =>
    (await api.patch<ApiResponse<T>>(url, body)).data.data,
  delete: async <T>(url: string) => (await api.delete<ApiResponse<T>>(url)).data.data,
};

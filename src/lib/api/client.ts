import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { store } from '@/store';
import { clearSession, setSession } from '@/store/authSlice';
import type { ApiErrorBody, ApiResponse } from '@/types/api';
import type { AuthSession } from '@/types/auth';

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.request.use(config => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const NO_REFRESH_URLS = [
  '/auth/login',
  '/auth/admin/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
];

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  refreshPromise ??= api
    .post<ApiResponse<AuthSession>>('/auth/refresh')
    .then(res => {
      store.dispatch(setSession(res.data.data));
      return res.data.data.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

api.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const shouldRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !NO_REFRESH_URLS.some(url => original.url?.includes(url));

    if (shouldRefresh) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        store.dispatch(clearSession());
      }
    }
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return 'Unable to reach the server. Please check your connection.';
    return error.response.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

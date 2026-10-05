import type { AuthSession, AuthUser } from '@/types/auth';
import { http } from './http';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  city?: string;
  password: string;
}

export interface ProfileInput {
  name?: string;
  phone?: string;
  city?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login: (input: LoginInput) => http.post<AuthSession>('/auth/login', input),
  adminLogin: (input: LoginInput) => http.post<AuthSession>('/auth/admin/login', input),
  register: (input: RegisterInput) => http.post<AuthSession>('/auth/register', input),
  refresh: () => http.post<AuthSession>('/auth/refresh'),
  logout: () => http.post<null>('/auth/logout'),
  me: () => http.get<AuthUser>('/auth/me'),
};

export const profileApi = {
  get: () => http.get<AuthUser>('/profile'),
  update: (input: ProfileInput) => http.patch<AuthUser>('/profile', input),
  changePassword: (input: ChangePasswordInput) => http.patch<null>('/profile/password', input),
};

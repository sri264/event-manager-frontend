export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  role: UserRole;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

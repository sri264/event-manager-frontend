import type { ApiResponse } from '@/types/api';
import { api } from './client';

export interface HealthStatus {
  app: string;
  env: string;
  database: 'up' | 'down';
  uptimeSeconds: number;
  timestamp: string;
}

export const getHealth = async () => {
  const res = await api.get<ApiResponse<HealthStatus>>('/health');
  return res.data.data;
};

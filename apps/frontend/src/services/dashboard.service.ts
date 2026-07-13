import { apiClient } from '../lib/api-client';
import type { DashboardSummary } from '../types';

export const dashboardService = {
  getSummary(): Promise<DashboardSummary> {
    return apiClient.get('/dashboard/summary');
  },
};

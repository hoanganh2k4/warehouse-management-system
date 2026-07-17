import { apiClient } from '../lib/api-client';
import type { DashboardChartPoint, DashboardSummary } from '../types';

export const dashboardService = {
  getSummary(): Promise<DashboardSummary> {
    return apiClient.get('/dashboard/summary');
  },
  getChart(days = 14): Promise<DashboardChartPoint[]> {
    return apiClient.get('/dashboard/chart', { params: { days } });
  },
};

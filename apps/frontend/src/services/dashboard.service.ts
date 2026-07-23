import { apiClient } from '../lib/api-client';
import type { DashboardChartPoint, DashboardExpiringBatch, DashboardSummary } from '../types';

export const dashboardService = {
  getSummary(): Promise<DashboardSummary> {
    return apiClient.get('/dashboard/summary');
  },
  getExpiringBatches(): Promise<DashboardExpiringBatch[]> {
    return apiClient.get('/dashboard/expiring-batches');
  },
  getChart(days = 14): Promise<DashboardChartPoint[]> {
    return apiClient.get('/dashboard/chart', { params: { days } });
  },
};

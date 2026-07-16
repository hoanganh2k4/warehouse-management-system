import { apiClient } from '../lib/api-client';
import type { Warehouse } from '../types';

export const warehouseService = {
  getAll(): Promise<Warehouse[]> {
    return apiClient.get('/warehouses');
  },
};

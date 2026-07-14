import { apiClient } from '../lib/api-client';
import type { InventoryItem, GetInventoryParams, PaginatedResult } from '../types';

export const inventoryService = {
  getInventory(params: GetInventoryParams): Promise<PaginatedResult<InventoryItem>> {
    return apiClient.get('/inventory', { params });
  },
};

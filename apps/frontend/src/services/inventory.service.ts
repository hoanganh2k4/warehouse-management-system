import { apiClient } from '../lib/api-client';
import type {
  GetInventoryParams,
  InboundPayload,
  InboundResult,
  InventoryItem,
  PaginatedResult,
} from '../types';

export const inventoryService = {
  getInventory(params: GetInventoryParams): Promise<PaginatedResult<InventoryItem>> {
    return apiClient.get('/inventory', { params });
  },

  inbound(payload: InboundPayload): Promise<InboundResult> {
    return apiClient.post('/inventory/inbound', payload);
  },
};

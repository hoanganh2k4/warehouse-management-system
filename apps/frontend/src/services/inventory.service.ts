import { apiClient } from '../lib/api-client';
import type {
  GetInventoryParams,
  InboundPayload,
  InboundResult,
  InventoryItem,
  OutboundPayload,
  OutboundResult,
  PaginatedResult,
} from '../types';

export const inventoryService = {
  getInventory(params: GetInventoryParams): Promise<PaginatedResult<InventoryItem>> {
    return apiClient.get('/inventory', { params });
  },

  inbound(payload: InboundPayload): Promise<InboundResult> {
    return apiClient.post('/inventory/inbound', payload);
  },

  outbound(payload: OutboundPayload): Promise<OutboundResult> {
    return apiClient.post('/inventory/outbound', payload);
  },
};

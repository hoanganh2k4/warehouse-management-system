import { apiClient } from '../lib/api-client';
import type {
  GetInventoryLedgerParams,
  GetInventoryParams,
  InboundPayload,
  InboundResult,
  InventoryItem,
  InventoryLedgerItem,
  OutboundPayload,
  OutboundResult,
  PaginatedResult,
} from '../types';

export const inventoryService = {
  getInventory(params: GetInventoryParams): Promise<PaginatedResult<InventoryItem>> {
    return apiClient.get('/inventory', { params });
  },

  getLedger(params: GetInventoryLedgerParams): Promise<PaginatedResult<InventoryLedgerItem>> {
    return apiClient.get('/inventory/ledger', { params });
  },

  inbound(payload: InboundPayload): Promise<InboundResult> {
    return apiClient.post('/inventory/inbound', payload);
  },

  outbound(payload: OutboundPayload): Promise<OutboundResult> {
    return apiClient.post('/inventory/outbound', payload);
  },
};

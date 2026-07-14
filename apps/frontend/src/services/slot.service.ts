import { apiClient } from '../lib/api-client';
import type {
  Slot,
  PaginatedResult,
  CreateSlotPayload,
  UpdateSlotPayload,
} from '../types';

export type GetSlotsParams = {
  levelId?: string;
  warehouseId?: string;
  keyword?: string;
  page?: number;
  limit?: number;
};

export const slotService = {
  getAll(params: GetSlotsParams): Promise<PaginatedResult<Slot>> {
    return apiClient.get('/slots', { params });
  },

  getById(id: string): Promise<Slot> {
    return apiClient.get(`/slots/${id}`);
  },

  create(payload: CreateSlotPayload): Promise<Slot> {
    return apiClient.post('/slots', payload);
  },

  update(id: string, payload: UpdateSlotPayload): Promise<Slot> {
    return apiClient.put(`/slots/${id}`, payload);
  },

  remove(id: string): Promise<Slot> {
    return apiClient.delete(`/slots/${id}`);
  },
};

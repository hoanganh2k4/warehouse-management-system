import { apiClient } from '../lib/api-client';
import type { Rack, CreateRackPayload, UpdateRackPayload } from '../types';

export const rackService = {
  getAll(zoneId?: string): Promise<Rack[]> {
    return apiClient.get('/racks', { params: zoneId ? { zoneId } : undefined });
  },

  getById(id: string): Promise<Rack> {
    return apiClient.get(`/racks/${id}`);
  },

  create(payload: CreateRackPayload): Promise<Rack> {
    return apiClient.post('/racks', payload);
  },

  update(id: string, payload: UpdateRackPayload): Promise<Rack> {
    return apiClient.put(`/racks/${id}`, payload);
  },

  remove(id: string): Promise<Rack> {
    return apiClient.delete(`/racks/${id}`);
  },
};

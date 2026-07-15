import { apiClient } from '../lib/api-client';
import type { Zone, CreateZonePayload, UpdateZonePayload } from '../types';

export const zoneService = {
  getAll(): Promise<Zone[]> {
    return apiClient.get('/zones');
  },

  getById(id: string): Promise<Zone> {
    return apiClient.get(`/zones/${id}`);
  },

  create(payload: CreateZonePayload): Promise<Zone> {
    return apiClient.post('/zones', payload);
  },

  update(id: string, payload: UpdateZonePayload): Promise<Zone> {
    return apiClient.put(`/zones/${id}`, payload);
  },

  remove(id: string): Promise<Zone> {
    return apiClient.delete(`/zones/${id}`);
  },
};

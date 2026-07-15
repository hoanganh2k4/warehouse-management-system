import { apiClient } from '../lib/api-client';
import type { Level, CreateLevelPayload, UpdateLevelPayload } from '../types';

export const levelService = {
  getAll(rackId?: string): Promise<Level[]> {
    return apiClient.get('/levels', { params: rackId ? { rackId } : undefined });
  },

  getById(id: string): Promise<Level> {
    return apiClient.get(`/levels/${id}`);
  },

  create(payload: CreateLevelPayload): Promise<Level> {
    return apiClient.post('/levels', payload);
  },

  update(id: string, payload: UpdateLevelPayload): Promise<Level> {
    return apiClient.put(`/levels/${id}`, payload);
  },

  remove(id: string): Promise<Level> {
    return apiClient.delete(`/levels/${id}`);
  },
};

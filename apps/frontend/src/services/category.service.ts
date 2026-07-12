import { apiClient } from '../lib/api-client';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types';

export const categoryService = {
  getCategories(): Promise<Category[]> {
    return apiClient.get('/categories');
  },

  getCategoryById(id: string): Promise<Category> {
    return apiClient.get(`/categories/${id}`);
  },

  createCategory(payload: CreateCategoryPayload): Promise<Category> {
    return apiClient.post('/categories', payload);
  },

  updateCategory(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    return apiClient.put(`/categories/${id}`, payload);
  },

  deleteCategory(id: string): Promise<Category> {
    return apiClient.delete(`/categories/${id}`);
  },
};

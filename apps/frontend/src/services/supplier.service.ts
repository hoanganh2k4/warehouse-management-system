import { apiClient } from '../lib/api-client';
import type { PaginatedResult, Supplier } from '../types';

export type GetSuppliersParams = {
  page?: number;
  limit?: number;
};

export const supplierService = {
  getSuppliers(params: GetSuppliersParams = {}): Promise<PaginatedResult<Supplier>> {
    return apiClient.get('/suppliers', { params });
  },

  getSupplierById(id: string): Promise<Supplier> {
    return apiClient.get(`/suppliers/${id}`);
  },
};

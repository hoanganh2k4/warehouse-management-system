import { apiClient } from '../lib/api-client';
import type { Customer, PaginatedResult } from '../types';

export type GetCustomersParams = {
  page?: number;
  limit?: number;
};

export const customerService = {
  getCustomers(params: GetCustomersParams = {}): Promise<PaginatedResult<Customer>> {
    return apiClient.get('/customers', { params });
  },

  getCustomerById(id: string): Promise<Customer> {
    return apiClient.get(`/customers/${id}`);
  },
};

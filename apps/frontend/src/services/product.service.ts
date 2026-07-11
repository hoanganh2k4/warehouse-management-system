import { apiClient } from '../lib/api-client';
import type { Product, PaginatedResult, GetProductsParams } from '../types';

export const productService = {
  getProducts(params: GetProductsParams): Promise<PaginatedResult<Product>> {
    return apiClient.get('/products', { params });
  },
};

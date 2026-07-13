import { apiClient } from '../lib/api-client';
import type {
  Product,
  PaginatedResult,
  GetProductsParams,
  ProductDetail,
  CreateProductPayload,
  UpdateProductPayload,
} from '../types';

export const productService = {
  getProducts(params: GetProductsParams): Promise<PaginatedResult<Product>> {
    return apiClient.get('/products', { params });
  },

  getProductById(id: string): Promise<ProductDetail> {
    return apiClient.get(`/products/${id}`);
  },

  createProduct(payload: CreateProductPayload): Promise<Product> {
    return apiClient.post('/products', payload);
  },

  updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
    return apiClient.put(`/products/${id}`, payload);
  },

  deleteProduct(id: string): Promise<{ id: string; deletedAt: string }> {
    return apiClient.delete(`/products/${id}`);
  },
};

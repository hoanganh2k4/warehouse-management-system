export type ProductCategory = 'MILK' | 'CRACKER';

export type Product = {
  id: string;
  skuCode: string;
  name: string;
  category: ProductCategory;
  unit: string;
  isHeavy: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type ProductSort = 'name' | 'sku' | 'category';

export type GetProductsParams = {
  page?: number;
  limit?: number;
  keyword?: string;
  sort?: ProductSort;
};

export type Batch = {
  id: string;
  productId: string;
  batchCode: string;
  manufactureDate: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductDetail = Product & {
  batches: Batch[];
};

export type CreateProductPayload = {
  skuCode: string;
  name: string;
  category: ProductCategory;
  unit: string;
  isHeavy?: boolean;
};

export type UpdateProductPayload = {
  name?: string;
  category?: ProductCategory;
  unit?: string;
  isHeavy?: boolean;
};

export type TeamMember = {
  id: string;
  username: string;
  email: string | null;
  fullName: string | null;
  role: { id: string; name: string };
  createdAt: string;
};

export type GetTeamMembersParams = {
  page?: number;
  limit?: number;
};
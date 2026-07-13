export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
};

export type CreateCategoryPayload = {
  name: string;
  description?: string;
};

export type UpdateCategoryPayload = {
  name?: string;
  description?: string;
};

export type Product = {
  id: string;
  skuCode: string;
  name: string;
  categoryId: string;
  category: { id: string; name: string; description?: string | null };
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
  categoryId: string;
  unit: string;
  isHeavy?: boolean;
};

export type UpdateProductPayload = {
  name?: string;
  categoryId?: string;
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

export type DashboardSummary = {
  products: number;
  batches: number;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  occupancyPercent: number;
  inventory: number;
  expiringSoon: number;
  inboundToday: number;
  outboundToday: number;
};

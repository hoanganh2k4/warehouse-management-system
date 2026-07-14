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

export type InventoryItem = {
  id: string;
  batchId: string;
  slotId: string;
  quantity: number;
  updatedAt: string;
};

export type GetInventoryParams = {
  warehouseId?: string;
  productId?: string;
  batchId?: string;
  slotId?: string;
  page?: number;
  limit?: number;
};

export type InboundPayload = {
  productId: string;
  quantity: number;
  manufactureDate: string;
  expiryDate: string;
  note?: string;
};

export type OutboundPayload = {
  productId: string;
  quantity: number;
  note?: string;
};

export type InboundAllocation = {
  slotId: string;
  slotCode: string;
  quantity: number;
  score: number;
  inventoryId: string;
};

export type InboundResult = {
  batch: Pick<Batch, 'id' | 'batchCode' | 'productId' | 'manufactureDate' | 'expiryDate'>;
  allocations: InboundAllocation[];
  totalQuantity: number;
};

export type OutboundPickLine = {
  skuCode: string;
  productName: string;
  batchId: string;
  batchCode: string;
  expiryDate: string;
  slotId: string;
  slotCode: string;
  slotPath: string;
  quantity: number;
  route: number;
  distanceToGate: number;
};

export type OutboundTransaction = {
  id: string;
  type: string;
  batchId: string;
  slotFromId: string | null;
  quantity: number;
  userId: string;
  note?: string | null;
};

export type OutboundResult = {
  product: Pick<Product, 'id' | 'skuCode' | 'name'>;
  totalQuantity: number;
  pickingList: OutboundPickLine[];
  transactions: OutboundTransaction[];
};
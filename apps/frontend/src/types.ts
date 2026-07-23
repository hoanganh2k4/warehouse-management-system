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

export type DashboardChartPoint = {
  date: string;
  inbound: number;
  outbound: number;
};

export type DashboardExpiringBatch = {
  batchId: string;
  batchCode: string;
  productSkuCode: string;
  productName: string;
  expiryDate: string;
  expiryStatus: 'OK' | 'WARNING' | 'CRITICAL' | 'EXPIRED';
  daysUntilExpiry: number;
  quantity: number;
  locations: string[];
};

export type InventoryItem = {
  id: string;
  batchId: string;
  batchCode: string;
  slotId: string;
  slotCode: string;
  productSkuCode: string;
  productName: string;
  quantity: number;
  expiryDate: string;
  expiryStatus: 'OK' | 'WARNING' | 'CRITICAL' | 'EXPIRED';
  daysUntilExpiry: number;
  updatedAt: string;
};

export type GetInventoryParams = {
  warehouseId?: string;
  zone?: string;
  productId?: string;
  sku?: string;
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

export type Warehouse = {
  id: string;
  name: string;
  address: string | null;
};

export type Zone = {
  id: string;
  warehouseId: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateZonePayload = {
  warehouseId: string;
  code: string;
};

export type UpdateZonePayload = {
  code?: string;
};

export type Rack = {
  id: string;
  zoneId: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateRackPayload = {
  zoneId: string;
  code: string;
};

export type UpdateRackPayload = {
  code?: string;
};

export type Level = {
  id: string;
  rackId: string;
  levelNumber: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateLevelPayload = {
  rackId: string;
  levelNumber: number;
};

export type UpdateLevelPayload = {
  levelNumber?: number;
};

export type Slot = {
  id: string;
  levelId: string;
  code: string;
  maxCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  occupancyRate: number;
  currentProductId: string | null;
  distanceToGate: number;
  outboundFrequencyScore: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateSlotPayload = {
  levelId: string;
  code: string;
  maxCapacity: number;
  distanceToGate: number;
};

export type UpdateSlotPayload = {
  code?: string;
  maxCapacity?: number;
  distanceToGate?: number;
  outboundFrequencyScore?: number;
};

export type TransactionType = 'IMPORT' | 'EXPORT' | 'MOVE';

export type Transaction = {
  id: string;
  type: TransactionType;
  quantity: number;
  batchId: string;
  batchCode: string;
  productSkuCode: string;
  productName: string;
  slotToId: string | null;
  slotToCode: string | null;
  slotFromId: string | null;
  slotFromCode: string | null;
  userId: string;
  user: { id: string; username: string; fullName: string | null };
  note: string | null;
  quantityBefore: number | null;
  quantityAfter: number | null;
  dailySeq: number | null;
  orderCode: string | null;
  createdAt: string;
};

export type GetTransactionsParams = {
  from?: string;
  to?: string;
  type?: TransactionType;
  productId?: string;
  warehouseId?: string;
  orderCode?: string;
  page?: number;
  limit?: number;
};

export type InventoryLedgerItem = {
  transactionId: string;
  occurredAt: string;
  type: TransactionType;
  productSkuCode: string;
  productName: string;
  slotPath: string | null;
  changeQuantity: number;
  balanceBefore: number;
  balanceAfter: number;
  dailySeq: number;
  orderCode: string | null;
};

export type GetInventoryLedgerParams = {
  productId?: string;
  slotId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

// ---------- Đặt lịch nhập / xuất (Tab "Lịch nhập / xuất") ----------

export type ScheduleType = 'INBOUND' | 'OUTBOUND';

export type ScheduleStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ScheduleSuggestion = {
  slotPath: string | null;
  score: number | null;
  reasons: string[];
  batchCode: string | null;
  suggestedAt: string | null;
} | null;

export type ScheduleActual = {
  slotPath: string | null;
  batchCode: string | null;
  allocationMethod: string | null;
  selectionMethod: string | null;
  overrideReason: string | null;
  overrideReasonNote: string | null;
} | null;

export type Schedule = {
  id: string;
  type: ScheduleType;
  status: ScheduleStatus;
  scheduledDate: string;
  scheduledTime: string;
  product: { id: string; skuCode: string; name: string } | null;
  quantity: number;
  batchCode: string | null;
  supplier: { id: string; name: string } | null;
  customer: { id: string; name: string } | null;
  partnerName: string | null;
  note: string | null;
  suggestion: ScheduleSuggestion;
  actual: ScheduleActual;
  executedBy: string | null;
  executedAt: string | null;
  transactionId: string | null;
  createdBy: string | null;
  createdAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
};

export type GetSchedulesParams = {
  type?: ScheduleType;
  status?: ScheduleStatus;
  productId?: string;
  page?: number;
  limit?: number;
};

// ---------- Nhà cung cấp / Khách hàng ----------

export type Supplier = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

// ---------- Smart Location Suggestion (Đặt lịch nhập) ----------

export type SchedulePriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type AlternativeSlot = {
  slotId: string;
  slotPath: string;
  allocateQty: number;
  score: number;
};

export type InboundSuggestionResult = {
  slotId: string;
  zoneCode: string;
  rackCode: string;
  levelNumber: number;
  slotCode: string;
  slotPath: string;
  capacityBefore: number;
  capacityAfter: number;
  maxCapacity: number;
  score: number;
  priority: SchedulePriority;
  reasons: string[];
  splitRequired: boolean;
  alternativeSlots: AlternativeSlot[];
};

export type InboundSuggestionPreviewPayload = {
  productId: string;
  quantity: number;
  scheduledDate: string;
  expiryDate?: string;
};

export type CreateInboundSchedulePayload = {
  scheduledDate: string;
  scheduledTime: string;
  expiryDate?: string;
  supplierId: string;
  productId: string;
  quantity: number;
  batchCode?: string;
  note?: string;
};

export type CreateInboundScheduleResult = {
  schedule: Schedule;
  suggestion: InboundSuggestionResult;
};

// ---------- Smart Picking Suggestion / FEFO (Đặt lịch xuất) ----------

export type OutboundSuggestionResult = {
  batchId: string;
  batchCode: string;
  expiryDate: string;
  slotId: string;
  slotPath: string;
  availableQuantity: number;
  quantityToPick: number;
  totalQuantity: number;
  priority: SchedulePriority;
  selectionMethod: 'FEFO';
  reasons: string[];
  splitRequired: boolean;
  pickingList: OutboundPickLine[];
};

export type OutboundSuggestionPreviewPayload = {
  productId: string;
  quantity: number;
};

export type CreateOutboundSchedulePayload = {
  scheduledDate: string;
  scheduledTime: string;
  customerId: string;
  productId: string;
  quantity: number;
  batchCode?: string;
  note?: string;
};

export type CreateOutboundScheduleResult = {
  schedule: Schedule;
  suggestion: OutboundSuggestionResult;
};

// ---------- Sửa lịch ----------

export type UpdateSchedulePayload = {
  scheduledDate?: string;
  scheduledTime?: string;
  supplierId?: string;
  customerId?: string;
  productId?: string;
  quantity?: number;
  batchCode?: string;
  note?: string;
};

// ---------- Thực hiện lịch (Execute) ----------

export type ExecutePreviewResult = {
  scheduleId: string;
  type: ScheduleType;
  previousSuggestedSlotId: string | null;
  recommended: InboundSuggestionResult | OutboundSuggestionResult;
  isSameAsSuggested: boolean;
};

export type ScheduleOverrideReasonCode =
  | 'SLOT_MAINTENANCE'
  | 'SLOT_FULL'
  | 'FORKLIFT_UNAVAILABLE'
  | 'MANAGEMENT_REQUEST'
  | 'OTHER';

export type OverrideLocationPayload = {
  slotId: string;
  batchId?: string;
  reason: ScheduleOverrideReasonCode;
  reasonNote?: string;
};

export type ExecuteSchedulePayload = {
  override?: OverrideLocationPayload;
  actualBatchCode?: string;
  manufactureDate?: string;
  expiryDate?: string;
};

export type ExecuteScheduleResult = {
  schedule: Schedule;
  transactions: Array<{ id: string; type: TransactionType }>;
};
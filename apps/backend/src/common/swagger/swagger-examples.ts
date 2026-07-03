/** Ví dụ response dùng chung cho Swagger */

export const ERROR_EXAMPLES = {
  validation: {
    success: false,
    message: 'skuCode must not be empty, category must be a valid enum value',
  },
  validationUuid: {
    success: false,
    message: 'productId must be a UUID',
  },
  unauthorized: {
    success: false,
    message: 'Unauthorized',
  },
  invalidCredentials: {
    success: false,
    message: 'Invalid username or password',
  },
  forbidden: {
    success: false,
    message: 'Forbidden resource',
  },
  notFound: {
    success: false,
    message: 'Resource not found',
  },
  productNotFound: {
    success: false,
    message: 'Product not found',
  },
  warehouseNotFound: {
    success: false,
    message: 'Warehouse not found',
  },
  zoneNotFound: {
    success: false,
    message: 'Zone not found',
  },
  rackNotFound: {
    success: false,
    message: 'Rack not found',
  },
  levelNotFound: {
    success: false,
    message: 'Level not found',
  },
  slotNotFound: {
    success: false,
    message: 'Slot not found',
  },
  batchNotFound: {
    success: false,
    message: 'Batch not found',
  },
  inventoryNotFound: {
    success: false,
    message: 'Inventory record not found',
  },
  conflict: {
    success: false,
    message: 'Resource conflict',
  },
  skuExists: {
    success: false,
    message: 'SKU already exists',
  },
  batchCodeExists: {
    success: false,
    message: 'Batch code already exists',
  },
  warehouseHasZones: {
    success: false,
    message: 'Cannot delete warehouse with existing zones',
  },
  zoneHasRacks: {
    success: false,
    message: 'Cannot delete zone with racks',
  },
  rackHasLevels: {
    success: false,
    message: 'Cannot delete rack with levels',
  },
  levelHasSlots: {
    success: false,
    message: 'Cannot delete level with slots',
  },
  slotHasInventory: {
    success: false,
    message: 'Cannot delete slot with inventory',
  },
  noSlotAvailable: {
    success: false,
    message: 'No suitable slot available for inbound',
  },
  insufficientStock: {
    success: false,
    message: 'Insufficient stock. Requested 100, available 50',
  },
  insufficientCapacity: {
    success: false,
    message: 'Insufficient slot capacity. Can only allocate 80 of 100',
  },
} as const;

const ts = '2026-07-03T10:00:00.000Z';

export const SUCCESS_EXAMPLES = {
  health: {
    success: true,
    data: { status: 'ok', timestamp: ts },
  },
  login: {
    success: true,
    data: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 86400,
    },
  },
  profile: {
    success: true,
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      username: 'admin',
      fullName: 'Quản trị viên',
      email: 'admin@smartwms.local',
      role: 'Quản lý',
    },
  },
  product: {
    success: true,
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      skuCode: 'VINA001',
      name: 'Vinamilk Có Đường 180ml',
      category: 'MILK',
      unit: 'hộp',
      isHeavy: false,
      createdAt: ts,
      updatedAt: ts,
      deletedAt: null,
    },
  },
  productList: {
    success: true,
    data: {
      items: [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          skuCode: 'VINA001',
          name: 'Vinamilk Có Đường 180ml',
          category: 'MILK',
          unit: 'hộp',
          isHeavy: false,
          createdAt: ts,
          updatedAt: ts,
          deletedAt: null,
        },
      ],
      meta: { page: 1, limit: 20, total: 4, totalPages: 1 },
    },
  },
  warehouse: {
    success: true,
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Warehouse A',
      address: 'KCN Tân Bình, TP.HCM',
      createdAt: ts,
      updatedAt: ts,
    },
  },
  warehouseList: {
    success: true,
    data: [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Warehouse A',
        address: 'KCN Tân Bình, TP.HCM',
        createdAt: ts,
        updatedAt: ts,
        _count: { zones: 5 },
      },
    ],
  },
  zone: {
    success: true,
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      warehouseId: 'wh-uuid',
      code: 'Zone A',
      createdAt: ts,
      updatedAt: ts,
    },
  },
  rack: {
    success: true,
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      zoneId: 'zone-uuid',
      code: 'Rack 01',
      createdAt: ts,
      updatedAt: ts,
    },
  },
  level: {
    success: true,
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      rackId: 'rack-uuid',
      levelNumber: 1,
      createdAt: ts,
      updatedAt: ts,
    },
  },
  slot: {
    success: true,
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      levelId: 'level-uuid',
      code: 'S01',
      maxCapacity: 200,
      usedCapacity: 120,
      availableCapacity: 80,
      occupancyRate: 60,
      currentProductId: 'product-uuid',
      distanceToGate: 15.5,
      outboundFrequencyScore: 0.3,
      createdAt: ts,
      updatedAt: ts,
    },
  },
  slotList: {
    success: true,
    data: {
      items: [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          code: 'S01',
          maxCapacity: 200,
          usedCapacity: 0,
          availableCapacity: 200,
          occupancyRate: 0,
          distanceToGate: 15.5,
        },
      ],
      meta: { page: 1, limit: 50, total: 5000, totalPages: 100 },
    },
  },
  batch: {
    success: true,
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      productId: 'product-uuid',
      batchCode: 'VN250601',
      manufactureDate: '2026-06-01T00:00:00.000Z',
      expiryDate: '2026-08-20T00:00:00.000Z',
      createdAt: ts,
      updatedAt: ts,
    },
  },
  inventory: {
    success: true,
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      batchId: 'batch-uuid',
      slotId: 'slot-uuid',
      quantity: 120,
      updatedAt: ts,
    },
  },
  inbound: {
    success: true,
    data: {
      batch: {
        id: 'batch-uuid',
        batchCode: 'B-VINA001-1720000000000',
        productId: 'product-uuid',
        manufactureDate: '2026-06-01T00:00:00.000Z',
        expiryDate: '2026-12-01T00:00:00.000Z',
      },
      allocations: [
        {
          slotId: 'slot-uuid',
          slotCode: 'S01',
          quantity: 100,
          score: 0.87,
          inventoryId: 'inv-uuid',
        },
      ],
      totalQuantity: 100,
    },
  },
  outbound: {
    success: true,
    data: {
      product: { id: 'product-uuid', skuCode: 'VINA001', name: 'Vinamilk Có Đường 180ml' },
      totalQuantity: 50,
      pickingList: [
        {
          skuCode: 'VINA001',
          productName: 'Vinamilk Có Đường 180ml',
          batchId: 'batch-uuid',
          batchCode: 'VN250601',
          expiryDate: '2026-08-10T00:00:00.000Z',
          slotId: 'slot-uuid',
          slotCode: 'S01',
          slotPath: 'Zone A / Rack 01 / L1 / S01',
          quantity: 50,
          route: 1,
          distanceToGate: 12.5,
        },
      ],
      transactions: [{ id: 'txn-uuid', type: 'EXPORT', quantity: 50 }],
    },
  },
  transactionList: {
    success: true,
    data: {
      items: [
        {
          id: 'txn-uuid',
          type: 'IMPORT',
          quantity: 100,
          batchId: 'batch-uuid',
          slotToId: 'slot-uuid',
          slotFromId: null,
          userId: 'user-uuid',
          note: null,
          createdAt: ts,
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    },
  },
  dashboard: {
    success: true,
    data: {
      products: 4,
      batches: 8,
      totalSlots: 5000,
      availableSlots: 4980,
      occupiedSlots: 20,
      occupancyPercent: 0,
      inventory: 4300,
      expiringSoon: 2,
      inboundToday: 200,
      outboundToday: 50,
    },
  },
  reportInventory: {
    success: true,
    data: {
      items: [
        {
          productId: 'product-uuid',
          skuCode: 'VINA001',
          name: 'Vinamilk Có Đường 180ml',
          category: 'MILK',
          unit: 'hộp',
          totalQuantity: 320,
          locations: [
            {
              batchCode: 'VN250601',
              expiryDate: '2026-08-20T00:00:00.000Z',
              slotPath: 'Zone A / Rack 01 / L1 / S01',
              quantity: 120,
            },
          ],
        },
      ],
      meta: { page: 1, limit: 50, total: 4, totalPages: 1 },
    },
  },
  reportTransactions: {
    success: true,
    data: {
      items: [
        {
          id: 'txn-uuid',
          type: 'IMPORT',
          quantity: 100,
          createdAt: ts,
        },
      ],
      meta: { page: 1, limit: 50, total: 10, totalPages: 1 },
      summary: { totalTransactions: 10, totalQuantity: 1500 },
    },
  },
  search: {
    success: true,
    data: [
      {
        product: {
          id: 'product-uuid',
          skuCode: 'VINA001',
          name: 'Vinamilk Có Đường 180ml',
          category: 'MILK',
          unit: 'hộp',
        },
        totalStock: 320,
        batches: [
          {
            id: 'batch-uuid',
            batchCode: 'VN250601',
            expiryDate: '2026-08-20T00:00:00.000Z',
            totalQuantity: 120,
            slots: [
              {
                slotId: 'slot-uuid',
                slotCode: 'S01',
                path: 'Zone A / Rack 01 / L1 / S01',
                quantity: 120,
                occupancyRate: 60,
                distanceToGate: 12.5,
              },
            ],
          },
        ],
        highlightSlotIds: ['slot-uuid'],
      },
    ],
  },
  delete: {
    success: true,
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      deletedAt: ts,
    },
  },
} as const;

import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { paginate, skipTake } from '../common/utils/pagination.util';
import { formatSlotLocation } from '../common/utils/location.util';
import { TransactionQueryDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TransactionQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.TransactionWhereInput = {};

    if (query.type) where.type = query.type;
    if (query.productId) where.batch = { productId: query.productId };
    if (query.warehouseId) {
      where.OR = [
        {
          slotTo: {
            level: { rack: { zone: { warehouseId: query.warehouseId } } },
          },
        },
        {
          slotFrom: {
            level: { rack: { zone: { warehouseId: query.warehouseId } } },
          },
        },
      ];
    }
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        ...skipTake(page, limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          quantity: true,
          note: true,
          createdAt: true,
          batchId: true,
          batch: {
            select: {
              batchCode: true,
              product: { select: { skuCode: true, name: true } },
            },
          },
          slotFromId: true,
          slotFrom: {
            select: {
              code: true,
              level: {
                select: {
                  levelNumber: true,
                  rack: {
                    select: {
                      code: true,
                      zone: {
                        select: {
                          code: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          slotToId: true,
          slotTo: {
            select: {
              code: true,
              level: {
                select: {
                  levelNumber: true,
                  rack: {
                    select: {
                      code: true,
                      zone: {
                        select: {
                          code: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          userId: true,
          user: { select: { id: true, username: true, fullName: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return paginate(items.map(toTransactionView), page, limit, total);
  }
}

// Làm phẳng batchCode/slotFromCode/slotToCode ra ngoài để phía frontend hiển thị
// vị trí đầy đủ dạng "Z-A / R01 / L02 / S01" thay vì UUID nội bộ.
function toTransactionView(item: {
  id: string;
  type: string;
  quantity: number;
  note: string | null;
  createdAt: Date;
  batchId: string;
  batch: { batchCode: string; product: { skuCode: string; name: string } };
  slotFromId: string | null;
  slotFrom: {
    code: string;
    level: {
      levelNumber: number;
      rack: {
        code: string;
        zone: {
          code: string;
        };
      };
    };
  } | null;
  slotToId: string | null;
  slotTo: {
    code: string;
    level: {
      levelNumber: number;
      rack: {
        code: string;
        zone: {
          code: string;
        };
      };
    };
  } | null;
  userId: string;
  user: { id: string; username: string; fullName: string | null };
}) {
  return {
    id: item.id,
    type: item.type,
    quantity: item.quantity,
    note: item.note,
    createdAt: item.createdAt,
    batchId: item.batchId,
    batchCode: item.batch.batchCode,
    productSkuCode: item.batch.product.skuCode,
    productName: item.batch.product.name,
    slotFromId: item.slotFromId,
    slotFromCode: item.slotFrom
      ? formatSlotLocation({
          zoneCode: item.slotFrom.level.rack.zone.code,
          rackCode: item.slotFrom.level.rack.code,
          levelNumber: item.slotFrom.level.levelNumber,
          slotCode: item.slotFrom.code,
        })
      : null,
    slotToId: item.slotToId,
    slotToCode: item.slotTo
      ? formatSlotLocation({
          zoneCode: item.slotTo.level.rack.zone.code,
          rackCode: item.slotTo.level.rack.code,
          levelNumber: item.slotTo.level.levelNumber,
          slotCode: item.slotTo.code,
        })
      : null,
    userId: item.userId,
    user: item.user,
  };
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { SlotScoringService } from '../common/services/slot-scoring.service';
import { SlotCapacityService } from '../common/services/slot-capacity.service';
import { FefoService } from '../common/services/fefo.service';
import type { PickLine } from '../common/services/fefo.service';
import { paginate, skipTake } from '../common/utils/pagination.util';
import {
  formatSlotLocation,
  normalizeZoneCode,
} from '../common/utils/location.util';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { getExpiryStatus } from '../common/utils/expiry.util';
import {
  InboundDto,
  InventoryQueryDto,
  OutboundDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slotScoring: SlotScoringService,
    private readonly slotCapacity: SlotCapacityService,
    private readonly fefo: FefoService,
  ) {}

  async findAll(query: InventoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    // Mỗi điều kiện lọc được thêm như một phần tử AND độc lập, thay vì
    // gán/merge nhiều lần lên cùng một field (batch/slot). Cách này giúp
    // tránh lỗi TypeScript kiểu union quá phức tạp trong Prisma 7 khi
    // spread lại một object where đã có type union hẹp từ lần gán trước.
    const andConditions: Prisma.InventoryWhereInput[] = [];

    if (query.batchId) andConditions.push({ batchId: query.batchId });
    if (query.slotId) andConditions.push({ slotId: query.slotId });
    if (query.productId) {
      andConditions.push({ batch: { productId: query.productId } });
    }
    if (query.sku) {
      andConditions.push({
        batch: {
          product: {
            OR: [
              { skuCode: { contains: query.sku, mode: 'insensitive' } },
              { name: { contains: query.sku, mode: 'insensitive' } },
            ],
          },
        },
      });
    }
    if (query.warehouseId) {
      andConditions.push({
        slot: {
          level: { rack: { zone: { warehouseId: query.warehouseId } } },
        },
      });
    }
    if (query.zone) {
      // Số lượng Zone trong kho rất nhỏ nên load hết ra để so khớp linh hoạt
      // (người dùng có thể gõ "A", "Z-A" hoặc "Zone A" đều ra cùng kết quả).
      const zones = await this.prisma.zone.findMany({
        select: { id: true, code: true },
      });
      const needle = normalizeZoneCode(query.zone);
      const matchedZoneIds = zones
        .filter((zone) => normalizeZoneCode(zone.code).includes(needle))
        .map((zone) => zone.id);

      andConditions.push({
        slot: {
          level: {
            rack: {
              zoneId: {
                in:
                  matchedZoneIds.length > 0 ? matchedZoneIds : ['__no_match__'],
              },
            },
          },
        },
      });
    }

    const where: Prisma.InventoryWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        ...skipTake(page, limit),
        select: {
          id: true,
          batchId: true,
          slotId: true,
          quantity: true,
          updatedAt: true,
          batch: {
            select: {
              batchCode: true,
              expiryDate: true,
              product: { select: { skuCode: true, name: true } },
            },
          },
          slot: {
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
        },
      }),
      this.prisma.inventory.count({ where }),
    ]);

    return paginate(items.map(toInventoryView), page, limit, total);
  }

  async findOne(id: string) {
    const item = await this.prisma.inventory.findUnique({
      where: { id },
      select: {
        id: true,
        batchId: true,
        slotId: true,
        quantity: true,
        updatedAt: true,
        batch: {
          select: {
            batchCode: true,
            expiryDate: true,
            product: { select: { skuCode: true, name: true } },
          },
        },
        slot: {
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
      },
    });
    if (!item) throw new NotFoundException('Inventory record not found');
    return toInventoryView(item);
  }

  async inbound(dto: InboundDto, user: AuthUser) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    const expiryDate = new Date(dto.expiryDate);
    const allocations = await this.slotScoring.findBestSlots(
      product,
      dto.quantity,
      expiryDate,
    );

    if (allocations.length === 0) {
      throw new BadRequestException('No suitable slot available for inbound');
    }

    const totalAllocated = allocations.reduce((s, a) => s + a.allocateQty, 0);
    if (totalAllocated < dto.quantity) {
      throw new BadRequestException(
        `Insufficient slot capacity. Can only allocate ${totalAllocated} of ${dto.quantity}`,
      );
    }

    const batchCode = `B-${product.skuCode}-${Date.now()}`;

    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.batch.create({
        data: {
          productId: product.id,
          batchCode,
          manufactureDate: new Date(dto.manufactureDate),
          expiryDate,
        },
      });

      const slotResults: {
        slotId: string;
        slotCode: string;
        quantity: number;
        score: number;
        inventoryId: string;
      }[] = [];

      for (const { slot, allocateQty, score } of allocations) {
        const inventory = await tx.inventory.upsert({
          where: { batchId_slotId: { batchId: batch.id, slotId: slot.id } },
          create: { batchId: batch.id, slotId: slot.id, quantity: allocateQty },
          update: { quantity: { increment: allocateQty } },
        });

        await this.slotCapacity.recalculate(slot.id, tx);

        await tx.transaction.create({
          data: {
            type: TransactionType.IMPORT,
            batchId: batch.id,
            slotToId: slot.id,
            quantity: allocateQty,
            userId: user.id,
            note: dto.note,
          },
        });

        slotResults.push({
          slotId: slot.id,
          slotCode: slot.code,
          quantity: allocateQty,
          score,
          inventoryId: inventory.id,
        });
      }

      return {
        batch,
        allocations: slotResults,
        totalQuantity: dto.quantity,
      };
    });
  }

  async outbound(dto: OutboundDto, user: AuthUser) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    let pickingList: PickLine[];
    try {
      pickingList = await this.fefo.buildPickingList(
        dto.productId,
        dto.quantity,
      );
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Insufficient stock',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const transactions: Awaited<ReturnType<typeof tx.transaction.create>>[] =
        [];

      for (const line of pickingList) {
        const inv = await tx.inventory.findUnique({
          where: {
            batchId_slotId: { batchId: line.batchId, slotId: line.slotId },
          },
        });
        if (!inv || inv.quantity < line.quantity) {
          throw new BadRequestException('Stock changed during outbound');
        }

        if (inv.quantity === line.quantity) {
          await tx.inventory.delete({ where: { id: inv.id } });
        } else {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: { decrement: line.quantity } },
          });
        }

        await this.slotCapacity.recalculate(line.slotId, tx);

        const txn = await tx.transaction.create({
          data: {
            type: TransactionType.EXPORT,
            batchId: line.batchId,
            slotFromId: line.slotId,
            quantity: line.quantity,
            userId: user.id,
            note: dto.note,
          },
        });

        transactions.push(txn);
      }

      return {
        product: {
          id: product.id,
          skuCode: product.skuCode,
          name: product.name,
        },
        totalQuantity: dto.quantity,
        pickingList,
        transactions,
      };
    });
  }
}

// Làm phẳng batchCode/slotCode ra ngoài để phía frontend hiển thị mã dễ đọc
// thay vì UUID nội bộ (batchId/slotId chỉ dùng cho việc lọc/liên kết, không hiển thị).
function toInventoryView(item: {
  id: string;
  batchId: string;
  slotId: string;
  quantity: number;
  updatedAt: Date;
  batch: {
    batchCode: string;
    expiryDate: Date;
    product: { skuCode: string; name: string };
  };
  slot: {
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
  };
}) {
  const { status, daysUntilExpiry } = getExpiryStatus(item.batch.expiryDate);
  return {
    id: item.id,
    batchId: item.batchId,
    batchCode: item.batch.batchCode,
    slotId: item.slotId,
    slotCode: formatSlotLocation({
      zoneCode: item.slot.level.rack.zone.code,
      rackCode: item.slot.level.rack.code,
      levelNumber: item.slot.level.levelNumber,
      slotCode: item.slot.code,
    }),
    productSkuCode: item.batch.product.skuCode,
    productName: item.batch.product.name,
    quantity: item.quantity,
    updatedAt: item.updatedAt,
    expiryDate: item.batch.expiryDate,
    expiryStatus: status,
    daysUntilExpiry,
  };
}

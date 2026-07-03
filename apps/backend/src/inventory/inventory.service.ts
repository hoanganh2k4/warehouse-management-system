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
import { paginate, skipTake } from '../common/utils/pagination.util';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { InboundDto, InventoryQueryDto, OutboundDto } from './dto/inventory.dto';

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
    const where: Prisma.InventoryWhereInput = {};

    if (query.batchId) where.batchId = query.batchId;
    if (query.slotId) where.slotId = query.slotId;
    if (query.productId) where.batch = { productId: query.productId };
    if (query.warehouseId) {
      where.slot = {
        level: { rack: { zone: { warehouseId: query.warehouseId } } },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        ...skipTake(page, limit),
        include: {
          batch: { include: { product: true } },
          slot: {
            include: {
              level: { include: { rack: { include: { zone: true } } } },
            },
          },
        },
      }),
      this.prisma.inventory.count({ where }),
    ]);

    return paginate(items, page, limit, total);
  }

  async findOne(id: string) {
    const item = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        batch: { include: { product: true } },
        slot: {
          include: {
            level: { include: { rack: { include: { zone: true } } } },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Inventory record not found');
    return item;
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

    let pickingList;
    try {
      pickingList = await this.fefo.buildPickingList(dto.productId, dto.quantity);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Insufficient stock',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const transactions: Awaited<
        ReturnType<typeof tx.transaction.create>
      >[] = [];

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
        product: { id: product.id, skuCode: product.skuCode, name: product.name },
        totalQuantity: dto.quantity,
        pickingList,
        transactions,
      };
    });
  }
}

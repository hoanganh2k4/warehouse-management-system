import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma.service';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class SlotCapacityService {
  constructor(private readonly prisma: PrismaService) {}

  async recalculate(slotId: string, tx?: TxClient) {
    const db = tx ?? this.prisma;
    const inventories = await db.inventory.findMany({
      where: { slotId },
      include: { batch: true },
    });

    const slot = await db.slot.findUniqueOrThrow({ where: { id: slotId } });
    const usedCapacity = inventories.reduce(
      (sum, inv) => sum + inv.quantity,
      0,
    );
    const occupancyRate =
      slot.maxCapacity > 0 ? (usedCapacity / slot.maxCapacity) * 100 : 0;
    const currentProductId =
      inventories.length > 0 ? inventories[0].batch.productId : null;

    return db.slot.update({
      where: { id: slotId },
      data: {
        usedCapacity,
        availableCapacity: slot.maxCapacity - usedCapacity,
        occupancyRate,
        currentProductId,
      },
    });
  }
}

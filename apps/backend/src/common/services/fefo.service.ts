import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface PickLine {
  skuCode: string;
  productName: string;
  batchId: string;
  batchCode: string;
  expiryDate: Date;
  slotId: string;
  slotCode: string;
  slotPath: string;
  quantity: number;
  route: number;
  distanceToGate: number;
}

@Injectable()
export class FefoService {
  constructor(private readonly prisma: PrismaService) {}

  async buildPickingList(productId: string, quantity: number): Promise<PickLine[]> {
    const product = await this.prisma.product.findFirstOrThrow({
      where: { id: productId, deletedAt: null },
    });

    const batches = await this.prisma.batch.findMany({
      where: {
        productId,
        inventories: { some: { quantity: { gt: 0 } } },
      },
      orderBy: { expiryDate: 'asc' },
      include: {
        inventories: {
          where: { quantity: { gt: 0 } },
          include: {
            slot: {
              include: {
                level: {
                  include: {
                    rack: { include: { zone: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const pickLines: PickLine[] = [];
    let remaining = quantity;
    let route = 1;

    for (const batch of batches) {
      if (remaining <= 0) break;

      const sortedInventory = [...batch.inventories].sort(
        (a, b) => a.slot.distanceToGate - b.slot.distanceToGate,
      );

      for (const inv of sortedInventory) {
        if (remaining <= 0) break;
        const pickQty = Math.min(remaining, inv.quantity);
        const slot = inv.slot;
        const zone = slot.level.rack.zone;
        const rack = slot.level.rack;

        pickLines.push({
          skuCode: product.skuCode,
          productName: product.name,
          batchId: batch.id,
          batchCode: batch.batchCode,
          expiryDate: batch.expiryDate,
          slotId: slot.id,
          slotCode: slot.code,
          slotPath: `${zone.code} / ${rack.code} / L${slot.level.levelNumber} / ${slot.code}`,
          quantity: pickQty,
          route,
          distanceToGate: slot.distanceToGate,
        });

        remaining -= pickQty;
        route++;
      }
    }

    if (remaining > 0) {
      const available = quantity - remaining;
      throw new Error(
        `Insufficient stock. Requested ${quantity}, available ${available}`,
      );
    }

    pickLines.sort((a, b) => a.distanceToGate - b.distanceToGate);
    pickLines.forEach((line, idx) => {
      line.route = idx + 1;
    });

    return pickLines;
  }
}

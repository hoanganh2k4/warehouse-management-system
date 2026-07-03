import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(keyword: string) {
    const products = await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { skuCode: { contains: keyword, mode: 'insensitive' } },
          { name: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      include: {
        batches: {
          orderBy: { expiryDate: 'asc' },
          include: {
            inventories: {
              where: { quantity: { gt: 0 } },
              include: {
                slot: {
                  include: {
                    level: { include: { rack: { include: { zone: true } } } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return products.map((product) => {
      const batches = product.batches
        .filter((b) => b.inventories.length > 0)
        .map((batch) => ({
          id: batch.id,
          batchCode: batch.batchCode,
          manufactureDate: batch.manufactureDate,
          expiryDate: batch.expiryDate,
          totalQuantity: batch.inventories.reduce((s, i) => s + i.quantity, 0),
          slots: batch.inventories.map((inv) => {
            const zone = inv.slot.level.rack.zone;
            const rack = inv.slot.level.rack;
            return {
              slotId: inv.slot.id,
              slotCode: inv.slot.code,
              path: `${zone.code} / ${rack.code} / L${inv.slot.level.levelNumber} / ${inv.slot.code}`,
              quantity: inv.quantity,
              occupancyRate: inv.slot.occupancyRate,
              distanceToGate: inv.slot.distanceToGate,
            };
          }),
        }));

      const totalStock = batches.reduce((s, b) => s + b.totalQuantity, 0);

      return {
        product: {
          id: product.id,
          skuCode: product.skuCode,
          name: product.name,
          category: product.category,
          unit: product.unit,
        },
        totalStock,
        batches,
        highlightSlotIds: batches.flatMap((b) => b.slots.map((s) => s.slotId)),
      };
    });
  }
}

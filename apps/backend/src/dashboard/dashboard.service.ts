import { Injectable } from '@nestjs/common';
import { TransactionType } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      products,
      batches,
      totalSlots,
      occupiedSlots,
      inventoryAgg,
      expiringSoon,
      inboundToday,
      outboundToday,
    ] = await Promise.all([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.batch.count(),
      this.prisma.slot.count(),
      this.prisma.slot.count({ where: { usedCapacity: { gt: 0 } } }),
      this.prisma.inventory.aggregate({ _sum: { quantity: true } }),
      this.prisma.batch.count({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
          inventories: { some: { quantity: { gt: 0 } } },
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.IMPORT,
          createdAt: { gte: today, lt: tomorrow },
        },
        _sum: { quantity: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.EXPORT,
          createdAt: { gte: today, lt: tomorrow },
        },
        _sum: { quantity: true },
      }),
    ]);

    const totalInventory = inventoryAgg._sum.quantity ?? 0;
    const availableSlots = totalSlots - occupiedSlots;
    const occupancyPercent =
      totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    return {
      products,
      batches,
      totalSlots,
      availableSlots,
      occupiedSlots,
      occupancyPercent,
      inventory: totalInventory,
      expiringSoon,
      inboundToday: inboundToday._sum.quantity ?? 0,
      outboundToday: outboundToday._sum.quantity ?? 0,
    };
  }
}

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

  /**
   * Tổng hợp số lượng nhập/xuất theo từng ngày trong N ngày gần nhất
   * để vẽ chart tổng quan trên Dashboard (chỉ Quản lý xem được).
   */
  async getChart(days = 14) {
    const safeDays = Math.min(Math.max(days, 1), 90);

    const end = new Date();
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1); // hết ngày hôm nay
    const start = new Date(end);
    start.setDate(start.getDate() - safeDays);

    const transactions = await this.prisma.transaction.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { type: true, quantity: true, createdAt: true },
    });

    // Khởi tạo từng ngày trong khoảng để chart không bị thiếu ngày trống
    const buckets = new Map<string, { inbound: number; outbound: number }>();
    for (let i = 0; i < safeDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      buckets.set(d.toISOString().slice(0, 10), { inbound: 0, outbound: 0 });
    }

    for (const tx of transactions) {
      const key = tx.createdAt.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      if (tx.type === TransactionType.IMPORT) bucket.inbound += tx.quantity;
      else if (tx.type === TransactionType.EXPORT) bucket.outbound += tx.quantity;
    }

    return Array.from(buckets.entries()).map(([date, v]) => ({
      date,
      inbound: v.inbound,
      outbound: v.outbound,
    }));
  }
}

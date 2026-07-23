import { Injectable } from '@nestjs/common';
import { TransactionType } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import {
  EXPIRY_WARNING_DAYS,
  getExpiryStatus,
} from '../common/utils/expiry.util';
import { formatSlotLocation } from '../common/utils/location.util';

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
      slotCapacityAgg,
      inventoryAgg,
      expiringSoon,
      inboundToday,
      outboundToday,
    ] = await Promise.all([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.batch.count(),
      this.prisma.slot.count(),
      this.prisma.slot.count({ where: { usedCapacity: { gt: 0 } } }),
      this.prisma.slot.aggregate({
        _sum: { usedCapacity: true, maxCapacity: true },
      }),
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

    const totalCapacity = slotCapacityAgg._sum.maxCapacity ?? 0;
    const usedCapacityTotal = slotCapacityAgg._sum.usedCapacity ?? 0;
    const occupancyPercent =
      totalCapacity > 0
        ? Math.round((usedCapacityTotal / totalCapacity) * 100)
        : 0;

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
   * Danh sách chi tiết các lô hàng sắp/đã hết hạn (còn tồn kho > 0), kèm vị
   * trí đang lưu và trạng thái hết hạn — dùng cho bảng cảnh báo trên Dashboard.
   * Dùng chung ngưỡng EXPIRY_WARNING_DAYS với Task 89, không hardcode lại số 30.
   */
  async getExpiringBatches() {
    const batches = await this.prisma.batch.findMany({
      where: {
        expiryDate: {
          lte: new Date(
            Date.now() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000,
          ),
        },
        inventories: { some: { quantity: { gt: 0 } } },
      },
      include: {
        product: { select: { skuCode: true, name: true } },
        inventories: {
          where: { quantity: { gt: 0 } },
          select: {
            quantity: true,
            slot: {
              select: {
                code: true,
                level: {
                  select: {
                    levelNumber: true,
                    rack: {
                      select: { code: true, zone: { select: { code: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return batches.map((batch) => {
      const { status, daysUntilExpiry } = getExpiryStatus(batch.expiryDate);
      const quantity = batch.inventories.reduce(
        (sum, inv) => sum + inv.quantity,
        0,
      );
      const locations = batch.inventories.map((inv) =>
        formatSlotLocation({
          zoneCode: inv.slot.level.rack.zone.code,
          rackCode: inv.slot.level.rack.code,
          levelNumber: inv.slot.level.levelNumber,
          slotCode: inv.slot.code,
        }),
      );

      return {
        batchId: batch.id,
        batchCode: batch.batchCode,
        productSkuCode: batch.product.skuCode,
        productName: batch.product.name,
        expiryDate: batch.expiryDate,
        expiryStatus: status,
        daysUntilExpiry,
        quantity,
        locations,
      };
    });
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
      else if (tx.type === TransactionType.EXPORT)
        bucket.outbound += tx.quantity;
    }

    return Array.from(buckets.entries()).map(([date, v]) => ({
      date,
      inbound: v.inbound,
      outbound: v.outbound,
    }));
  }
}

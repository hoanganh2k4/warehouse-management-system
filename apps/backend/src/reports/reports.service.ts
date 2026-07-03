import { Injectable } from '@nestjs/common';
import { TransactionType } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { paginate, skipTake } from '../common/utils/pagination.util';
import { ReportQueryDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async inventoryReport(query: ReportQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const products = await this.prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        batches: {
          include: {
            inventories: {
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
      ...skipTake(page, limit),
      orderBy: { skuCode: 'asc' },
    });

    const total = await this.prisma.product.count({ where: { deletedAt: null } });

    const items = products.map((product) => {
      let totalQty = 0;
      const locations: {
        batchCode: string;
        expiryDate: Date;
        slotPath: string;
        quantity: number;
      }[] = [];

      for (const batch of product.batches) {
        for (const inv of batch.inventories) {
          if (inv.quantity <= 0) continue;
          totalQty += inv.quantity;
          const zone = inv.slot.level.rack.zone;
          const rack = inv.slot.level.rack;
          locations.push({
            batchCode: batch.batchCode,
            expiryDate: batch.expiryDate,
            slotPath: `${zone.code} / ${rack.code} / L${inv.slot.level.levelNumber} / ${inv.slot.code}`,
            quantity: inv.quantity,
          });
        }
      }

      return {
        productId: product.id,
        skuCode: product.skuCode,
        name: product.name,
        category: product.category,
        unit: product.unit,
        totalQuantity: totalQty,
        locations,
      };
    });

    return paginate(items, page, limit, total);
  }

  async transactionReport(type: TransactionType, query: ReportQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: { type: TransactionType; createdAt?: { gte?: Date; lte?: Date } } = {
      type,
    };

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
        include: {
          batch: { include: { product: true } },
          slotFrom: true,
          slotTo: true,
          user: { select: { username: true, fullName: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const summary = await this.prisma.transaction.aggregate({
      where,
      _sum: { quantity: true },
      _count: true,
    });

    return {
      ...paginate(items, page, limit, total),
      summary: {
        totalTransactions: summary._count,
        totalQuantity: summary._sum.quantity ?? 0,
      },
    };
  }

  inboundReport(query: ReportQueryDto) {
    return this.transactionReport(TransactionType.IMPORT, query);
  }

  outboundReport(query: ReportQueryDto) {
    return this.transactionReport(TransactionType.EXPORT, query);
  }
}

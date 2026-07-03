import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { paginate, skipTake } from '../common/utils/pagination.util';
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
        { slotTo: { level: { rack: { zone: { warehouseId: query.warehouseId } } } } },
        { slotFrom: { level: { rack: { zone: { warehouseId: query.warehouseId } } } } },
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
        include: {
          batch: { include: { product: true } },
          slotFrom: true,
          slotTo: true,
          user: { select: { id: true, username: true, fullName: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return paginate(items, page, limit, total);
  }
}

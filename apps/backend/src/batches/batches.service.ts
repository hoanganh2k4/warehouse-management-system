import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { paginate, skipTake } from '../common/utils/pagination.util';
import { BatchQueryDto, CreateBatchDto } from './dto/batch.dto';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BatchQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = query.productId ? { productId: query.productId } : {};

    const [items, total] = await Promise.all([
      this.prisma.batch.findMany({
        where,
        ...skipTake(page, limit),
        orderBy: { expiryDate: 'asc' },
        include: {
          product: true,
          inventories: { include: { slot: true } },
        },
      }),
      this.prisma.batch.count({ where }),
    ]);

    return paginate(items, page, limit, total);
  }

  async findOne(id: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        product: true,
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
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async create(dto: CreateBatchDto) {
    const exists = await this.prisma.batch.findUnique({
      where: { batchCode: dto.batchCode },
    });
    if (exists) throw new ConflictException('Batch code already exists');

    return this.prisma.batch.create({
      data: {
        productId: dto.productId,
        batchCode: dto.batchCode,
        manufactureDate: new Date(dto.manufactureDate),
        expiryDate: new Date(dto.expiryDate),
      },
      include: { product: true },
    });
  }
}

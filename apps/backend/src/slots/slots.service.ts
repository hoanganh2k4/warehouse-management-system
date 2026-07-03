import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { paginate, skipTake } from '../common/utils/pagination.util';
import { CreateSlotDto, SlotQueryDto, UpdateSlotDto } from './dto/slot.dto';

const slotInclude = {
  currentProduct: true,
  level: {
    include: {
      rack: { include: { zone: { include: { warehouse: true } } } },
    },
  },
  inventories: { include: { batch: { include: { product: true } } } },
} satisfies Prisma.SlotInclude;

@Injectable()
export class SlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: SlotQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: Prisma.SlotWhereInput = {};

    if (query.levelId) where.levelId = query.levelId;
    if (query.warehouseId) {
      where.level = { rack: { zone: { warehouseId: query.warehouseId } } };
    }
    if (query.keyword) {
      where.OR = [
        { code: { contains: query.keyword, mode: 'insensitive' } },
        { currentProduct: { name: { contains: query.keyword, mode: 'insensitive' } } },
        { currentProduct: { skuCode: { contains: query.keyword, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.slot.findMany({
        where,
        ...skipTake(page, limit),
        orderBy: { code: 'asc' },
        include: slotInclude,
      }),
      this.prisma.slot.count({ where }),
    ]);

    return paginate(items, page, limit, total);
  }

  async findOne(id: string) {
    const slot = await this.prisma.slot.findUnique({
      where: { id },
      include: slotInclude,
    });
    if (!slot) throw new NotFoundException('Slot not found');
    return slot;
  }

  create(dto: CreateSlotDto) {
    return this.prisma.slot.create({
      data: {
        ...dto,
        availableCapacity: dto.maxCapacity,
        usedCapacity: 0,
        occupancyRate: 0,
      },
      include: slotInclude,
    });
  }

  async update(id: string, dto: UpdateSlotDto) {
    const slot = await this.findOne(id);
    const maxCapacity = dto.maxCapacity ?? slot.maxCapacity;
    const usedCapacity = slot.usedCapacity;
    return this.prisma.slot.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.maxCapacity !== undefined
          ? {
              availableCapacity: maxCapacity - usedCapacity,
              occupancyRate: maxCapacity > 0 ? (usedCapacity / maxCapacity) * 100 : 0,
            }
          : {}),
      },
      include: slotInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inv = await this.prisma.inventory.count({ where: { slotId: id } });
    if (inv > 0) {
      throw new BadRequestException('Cannot delete slot with inventory');
    }
    return this.prisma.slot.delete({ where: { id } });
  }
}

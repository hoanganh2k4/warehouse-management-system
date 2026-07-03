import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.warehouse.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { zones: true } } },
    });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        zones: {
          include: { _count: { select: { racks: true } } },
        },
      },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: { name: dto.name, address: dto.address },
    });
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.findOne(id);
    return this.prisma.warehouse.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const zones = await this.prisma.zone.count({ where: { warehouseId: id } });
    if (zones > 0) {
      throw new ConflictException('Cannot delete warehouse with existing zones');
    }
    return this.prisma.warehouse.delete({ where: { id } });
  }
}

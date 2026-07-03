import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateZoneDto, UpdateZoneDto } from './dto/zone.dto';

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(warehouseId?: string) {
    return this.prisma.zone.findMany({
      where: warehouseId ? { warehouseId } : undefined,
      orderBy: { code: 'asc' },
      include: { _count: { select: { racks: true } } },
    });
  }

  async findOne(id: string) {
    const zone = await this.prisma.zone.findUnique({
      where: { id },
      include: { racks: true, warehouse: true },
    });
    if (!zone) throw new NotFoundException('Zone not found');
    return zone;
  }

  create(dto: CreateZoneDto) {
    return this.prisma.zone.create({ data: dto });
  }

  async update(id: string, dto: UpdateZoneDto) {
    await this.findOne(id);
    return this.prisma.zone.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const racks = await this.prisma.rack.count({ where: { zoneId: id } });
    if (racks > 0) throw new ConflictException('Cannot delete zone with racks');
    return this.prisma.zone.delete({ where: { id } });
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRackDto, UpdateRackDto } from './dto/rack.dto';

@Injectable()
export class RacksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(zoneId?: string) {
    return this.prisma.rack.findMany({
      where: zoneId ? { zoneId } : undefined,
      orderBy: { code: 'asc' },
      include: { _count: { select: { levels: true } } },
    });
  }

  async findOne(id: string) {
    const rack = await this.prisma.rack.findUnique({
      where: { id },
      include: { levels: true, zone: true },
    });
    if (!rack) throw new NotFoundException('Rack not found');
    return rack;
  }

  create(dto: CreateRackDto) {
    return this.prisma.rack.create({ data: dto });
  }

  async update(id: string, dto: UpdateRackDto) {
    await this.findOne(id);
    return this.prisma.rack.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const levels = await this.prisma.level.count({ where: { rackId: id } });
    if (levels > 0)
      throw new ConflictException('Cannot delete rack with levels');
    return this.prisma.rack.delete({ where: { id } });
  }
}

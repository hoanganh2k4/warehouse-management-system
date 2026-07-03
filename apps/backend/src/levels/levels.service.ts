import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLevelDto, UpdateLevelDto } from './dto/level.dto';

@Injectable()
export class LevelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(rackId?: string) {
    return this.prisma.level.findMany({
      where: rackId ? { rackId } : undefined,
      orderBy: { levelNumber: 'asc' },
      include: { _count: { select: { slots: true } } },
    });
  }

  async findOne(id: string) {
    const level = await this.prisma.level.findUnique({
      where: { id },
      include: { slots: true, rack: true },
    });
    if (!level) throw new NotFoundException('Level not found');
    return level;
  }

  create(dto: CreateLevelDto) {
    return this.prisma.level.create({ data: dto });
  }

  async update(id: string, dto: UpdateLevelDto) {
    await this.findOne(id);
    return this.prisma.level.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const slots = await this.prisma.slot.count({ where: { levelId: id } });
    if (slots > 0) throw new ConflictException('Cannot delete level with slots');
    return this.prisma.level.delete({ where: { id } });
  }
}

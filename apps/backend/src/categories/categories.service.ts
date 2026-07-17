import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const exists = await this.prisma.category.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' } },
    });
    if (exists) throw new ConflictException('Category name already exists');
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.name) {
      const exists = await this.prisma.category.findFirst({
        where: { name: { equals: dto.name, mode: 'insensitive' } },
      });
      if (exists && exists.id !== id) {
        throw new ConflictException('Category name already exists');
      }
    }

    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const productsUsingCategory = await this.prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (productsUsingCategory > 0) {
      throw new ConflictException(
        'Cannot delete category that is still assigned to products',
      );
    }
    return this.prisma.category.delete({ where: { id } });
  }
}

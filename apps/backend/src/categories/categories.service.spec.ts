import { Test } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const prismaMock = {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(CategoriesService);
  });

  it('findAll() chỉ đếm sản phẩm chưa bị xoá mềm trong _count.products', async () => {
    await service.findAll();
    expect(prismaMock.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          _count: { select: { products: { where: { deletedAt: null } } } },
        },
      }),
    );
  });

  it('findOne() chỉ đếm sản phẩm chưa bị xoá mềm trong _count.products', async () => {
    prismaMock.category.findUnique.mockResolvedValue({
      id: 'cat-1',
      name: 'Category 1',
      _count: { products: 5 },
    });

    await service.findOne('cat-1');
    expect(prismaMock.category.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cat-1' },
        include: {
          _count: { select: { products: { where: { deletedAt: null } } } },
        },
      }),
    );
  });
});

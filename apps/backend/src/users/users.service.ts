import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { paginate, skipTake } from '../common/utils/pagination.util';
import { UserQueryDto } from './dto/user-query.dto';

// Select tường minh — KHÔNG bao giờ thêm `passwordHash` vào đây.
const userSummarySelect = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  createdAt: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: UserQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UserWhereInput = { deletedAt: null };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        ...skipTake(page, limit),
        orderBy: { username: 'asc' },
        select: userSummarySelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginate(items, page, limit, total);
  }
}

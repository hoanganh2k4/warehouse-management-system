import { Prisma } from '../../../generated/prisma/client';

/**
 * Tính số thứ tự (dailySeq) tiếp theo cho 1 Transaction mới trong ngày.
 * PHẢI gọi bằng `tx` (Prisma.TransactionClient) bên trong cùng 1
 * `prisma.$transaction(...)` đang tạo Transaction đó, để đảm bảo tính nhất
 * quán khi có nhiều giao dịch được tạo liên tiếp (vd nhiều dòng pick khi
 * xuất kho) — không dùng `this.prisma` (client ngoài transaction).
 */
export async function getNextDailySeq(
  tx: Prisma.TransactionClient,
  at: Date = new Date(),
): Promise<number> {
  const start = new Date(at);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const count = await tx.transaction.count({
    where: { createdAt: { gte: start, lt: end } },
  });
  return count + 1;
}

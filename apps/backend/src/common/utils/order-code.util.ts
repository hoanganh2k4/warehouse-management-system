import { Prisma } from '../../../generated/prisma/client';

// Định dạng thống nhất với script backfill ở Task 84 (prisma/backfill-order-code.ts):
// SCH-YYYYMMDD-xxxx (xxxx là số thứ tự 4 chữ số tăng dần trong ngày đó).
function formatDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * Sinh 1 orderCode mới dựa trên số lượng Schedule đã tạo trong ngày.
 * PHẢI gọi bằng `tx` bên trong `prisma.$transaction(...)` đang tạo Schedule
 * đó, và bên gọi cần tự xử lý retry khi gặp lỗi trùng khoá (P2002) — xem
 * `createScheduleWithOrderCode` bên dưới để dùng sẵn logic retry.
 */
export async function generateOrderCode(
  tx: Prisma.TransactionClient,
  at: Date = new Date(),
): Promise<string> {
  const day = formatDay(at);
  const start = new Date(at);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const count = await tx.schedule.count({
    where: { createdAt: { gte: start, lt: end } },
  });
  return `SCH-${day}-${String(count + 1).padStart(4, '0')}`;
}

const MAX_RETRY = 3;

/**
 * Chạy `createFn(tx, orderCode)` bên trong 1 prisma transaction, tự sinh
 * orderCode và thử lại tối đa MAX_RETRY lần nếu gặp lỗi trùng khoá (P2002)
 * do 2 request tạo lịch cùng lúc trong cùng ngày (race condition hiếm gặp).
 */
export async function createScheduleWithOrderCode<T>(
  prisma: { $transaction: <R>(fn: (tx: Prisma.TransactionClient) => Promise<R>) => Promise<R> },
  createFn: (tx: Prisma.TransactionClient, orderCode: string) => Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const orderCode = await generateOrderCode(tx);
        return createFn(tx, orderCode);
      });
    } catch (err) {
      lastError = err;
      const isUniqueConflict =
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: string }).code === 'P2002';
      if (!isUniqueConflict) throw err;
      // Trùng orderCode với 1 lịch khác vừa được tạo cùng lúc — thử lại.
    }
  }
  throw lastError;
}

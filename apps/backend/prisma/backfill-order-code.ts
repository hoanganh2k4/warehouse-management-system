import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Script backfill 1 lần: sinh orderCode cho các Schedule cũ đang có orderCode = NULL,
// theo định dạng SCH-YYYYMMDD-xxxx (xxxx = số thứ tự 4 chữ số, tăng dần trong ngày,
// tính theo createdAt của schedule đó).
const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/smart_wms';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

async function main() {
  const schedules = await prisma.schedule.findMany({
    where: { orderCode: null },
    orderBy: { createdAt: 'asc' },
  });

  const seqByDay = new Map<string, number>();
  let count = 0;

  // Chạy tuần tự (for...of + await), KHÔNG dùng Promise.all/map chạy song song —
  // tránh 2 record cùng ngày đọc seqByDay cùng lúc rồi sinh trùng orderCode (vi phạm @unique).
  for (const schedule of schedules) {
    const day = formatDate(schedule.createdAt);
    const next = (seqByDay.get(day) ?? 0) + 1;
    seqByDay.set(day, next);
    const orderCode = `SCH-${day}-${String(next).padStart(4, '0')}`;

    await prisma.schedule.update({
      where: { id: schedule.id },
      data: { orderCode },
    });
    count++;
  }

  console.log(`✅ Backfilled orderCode for ${count} schedules.`);
}

main()
  .catch((e) => {
    console.error('❌ Backfill failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
# Task 84 [BACKEND] — Tạo migration cho Task 82+83 và backfill dữ liệu cũ

## 🎯 Mục tiêu
Chạy migration thật cho toàn bộ field/bảng mới đã thêm ở Task 82 + 83, và viết script backfill để các
`Schedule` cũ trong DB (đang có `orderCode = NULL`) được gán mã đơn hợp lệ — tránh tình trạng dữ liệu cũ bị
"mồ côi" không tra cứu được theo mã đơn.

**Điều kiện tiên quyết: Task 82 và Task 83 phải merge xong trước** (schema đã có đủ field mới).

## 📖 Giải thích nghiệp vụ
`orderCode` được đánh dấu `@unique` nhưng optional ở Task 82 để migration không lỗi với dữ liệu cũ. Tuy
nhiên nếu để `NULL` mãi thì các đơn cũ sẽ không tra cứu được theo mã đơn (yêu cầu gốc: "Thực hiện nhập/xuất
hàng có mã đơn riêng -> tra dữ liệu thông qua mã đơn riêng"). Vì vậy cần 1 script backfill chạy 1 lần, sinh
mã cho toàn bộ `Schedule` đã có trong DB, theo đúng định dạng sẽ dùng về sau: `SCH-YYYYMMDD-xxxx` (YYYYMMDD
lấy từ `createdAt` của schedule đó, xxxx là số thứ tự 4 chữ số tăng dần trong ngày đó).

## 🧠 Giải thích Prisma/NestJS cần biết
- Migration Prisma: `npx prisma migrate dev --name add_order_code_and_allocation` sẽ tự sinh file SQL trong
  `prisma/migrations/<timestamp>_add_order_code_and_allocation/migration.sql` dựa trên diff schema hiện tại
  so với DB, đồng thời áp dụng luôn vào DB dev.
- Script backfill nên viết dạng file Node/ts-node độc lập (không phải NestJS module) để chạy 1 lần, dùng
  chung `PrismaClient` từ `generated/prisma/client` giống các script khác trong `prisma/`.
- Vì `orderCode` là `@unique`, script backfill phải xử lý tuần tự theo từng ngày để đảm bảo số thứ tự
  (`xxxx`) không trùng nhau trong cùng 1 ngày.

## 📖 Các file cần đọc trước
- `apps/backend/prisma/schema.prisma` (sau khi Task 82+83 đã merge)
- `apps/backend/prisma/seed.ts` (để biết cách project hiện tại khởi tạo `PrismaClient` trong script độc lập)
- `package.json` ở `apps/backend` (xem script `prisma:seed`/`db:seed` hiện có, đặt script backfill theo
  cùng convention)

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/backend/prisma/migrations/<timestamp>_add_order_code_and_allocation/` (tự sinh bởi lệnh
  `prisma migrate dev`, không tự tay viết SQL)
- Tạo mới: `apps/backend/prisma/backfill-order-code.ts`
- Sửa: `apps/backend/package.json` — thêm 1 script mới, ví dụ `"backfill:order-code": "ts-node prisma/backfill-order-code.ts"`
  (đặt cạnh script seed hiện có, không đổi script cũ)

## 📂 File KHÔNG được sửa
- `apps/backend/prisma/schema.prisma` (đã xong ở Task 82+83, task này không sửa schema nữa)
- `apps/backend/prisma/seed.ts`
- Bất kỳ file nào trong `apps/backend/src`

## 🔌 API cần dùng
Không có — chạy script trực tiếp bằng Prisma Client, không qua HTTP API.

## 🪜 Các bước thực hiện
1. Đảm bảo Task 82 + 83 đã merge vào schema.
2. Chạy: `cd apps/backend && npx prisma migrate dev --name add_order_code_and_allocation`.
3. Kiểm tra file migration tự sinh trong `prisma/migrations/` — đọc qua SQL để chắc chắn chỉ có `ALTER
   TABLE ... ADD COLUMN` (nullable) và `CREATE TABLE schedule_allocations`, không có `DROP`/`ALTER ... NOT
   NULL` nào ngoài dự kiến.
4. Viết file `prisma/backfill-order-code.ts`:
   - Lấy toàn bộ `Schedule` có `orderCode: null`, sort theo `createdAt` tăng dần.
   - Group theo ngày (`YYYYMMDD` từ `createdAt`).
   - Với mỗi ngày, đánh số thứ tự từ 1, format `xxxx` (4 chữ số, thêm số 0 phía trước — vd `0001`).
   - `orderCode = SCH-${YYYYMMDD}-${xxxx}`.
   - `prisma.schedule.update({ where: { id }, data: { orderCode } })` cho từng record (dùng vòng lặp tuần
     tự, KHÔNG dùng `Promise.all` chạy song song — để tránh 2 record cùng ngày bị tính trùng số thứ tự do
     race condition khi đọc dữ liệu cũ để đếm).
   - Log ra console số lượng đã backfill khi xong.
5. Thêm script vào `package.json`, chạy thử: `npm run backfill:order-code --workspace=backend`.
6. Kiểm tra DB (`npx prisma studio` hoặc query trực tiếp) — toàn bộ `Schedule` cũ đã có `orderCode`, không
   có giá trị trùng nhau.

## 💻 Ví dụ code (khung sườn `backfill-order-code.ts`)
```ts
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

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

  for (const s of schedules) {
    const day = formatDate(s.createdAt);
    const next = (seqByDay.get(day) ?? 0) + 1;
    seqByDay.set(day, next);
    const orderCode = `SCH-${day}-${String(next).padStart(4, '0')}`;

    await prisma.schedule.update({
      where: { id: s.id },
      data: { orderCode },
    });
    count++;
  }

  console.log(`Backfilled orderCode for ${count} schedules.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/84.txt`

## ✅ Checklist nghiệm thu
- ☐ Migration mới đã tạo và áp dụng thành công (`npx prisma migrate dev` chạy không lỗi)
- ☐ File SQL migration chỉ thêm cột nullable + tạo bảng mới, không có thay đổi ngoài dự kiến
- ☐ `backfill-order-code.ts` chạy xong, log đúng số lượng record đã cập nhật
- ☐ Toàn bộ `Schedule` cũ trong DB dev đều có `orderCode` khác NULL, đúng định dạng `SCH-YYYYMMDD-xxxx`
- ☐ Không có `orderCode` nào bị trùng (kiểm tra bằng `SELECT orderCode, COUNT(*) FROM schedules GROUP BY orderCode HAVING COUNT(*) > 1` — phải trả về rỗng)
- ☐ Script `backfill:order-code` đã thêm vào `package.json`

## ❌ Lỗi thường gặp
- **Dùng `Promise.all` chạy song song khi backfill** → 2 record cùng ngày đọc `seqByDay` cùng lúc trước khi
  set, dẫn tới sinh trùng `orderCode` (vi phạm `@unique`, migrate/update sẽ lỗi). Phải chạy tuần tự (dùng
  vòng lặp `for...of` với `await`, không `map` + `Promise.all`).
- **Chạy migration trước khi Task 82/83 merge xong** → migration thiếu field/bảng, phải revert.
- **Quên kiểm tra file SQL migration tự sinh** → nếu Prisma phát hiện thay đổi ngoài ý muốn (do ai đó sửa
  tay schema trước đó), migration có thể chứa lệnh `DROP COLUMN` không mong muốn.

## 🔄 Cách test
1. Trước khi migrate, backup DB dev (hoặc dùng DB dev có thể xoá làm lại).
2. Chạy migration, kiểm tra `\d schedules` / `\d schedule_allocations` (psql) hoặc Prisma Studio để thấy
   đúng cột/bảng mới.
3. Chạy script backfill, kiểm tra lại bằng Prisma Studio: mở bảng `schedules`, lọc `orderCode is null` phải
   ra 0 kết quả.

## 🔙 Cách rollback nếu sai
```
npx prisma migrate resolve --rolled-back <tên_migration_vừa_tạo>
git checkout apps/backend/prisma/migrations
rm apps/backend/prisma/backfill-order-code.ts
git checkout apps/backend/package.json
```
Nếu đã lỡ chạy sai trên DB dev, cách nhanh nhất là `npx prisma migrate reset` (XOÁ SẠCH dữ liệu dev, chạy
lại toàn bộ migration + seed từ đầu) — chỉ dùng trên DB dev, không bao giờ chạy lệnh này trên production.

## 📝 Commit message
```
feat(db): migrate schema for Task 82-83 and backfill orderCode for existing schedules
```

## 🔀 PR title
```
[Task 84] Migration + backfill orderCode for existing data
```

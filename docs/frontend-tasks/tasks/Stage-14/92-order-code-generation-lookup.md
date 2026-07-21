# Task 92 [BACKEND] — Tự sinh `orderCode` khi đặt lịch + API tra cứu theo mã đơn

## 🎯 Mục tiêu
Khi tạo `Schedule` (đặt lịch nhập/xuất), tự sinh `orderCode` (field đã thêm ở Task 82) theo định dạng
`SCH-YYYYMMDD-xxxx`. Thêm endpoint tra cứu lịch theo mã đơn, và cho phép lọc `GET /transactions` theo mã
đơn — đúng yêu cầu "Thực hiện nhập/xuất hàng có mã đơn riêng → khi xuất/nhập thì sẽ tra dữ liệu thông qua mã
đơn riêng".

**Điều kiện tiên quyết: Task 82, 84 đã merge (field `orderCode`, đã backfill dữ liệu cũ).**

## 📖 Giải thích nghiệp vụ
`createInboundSchedule`/`createOutboundSchedule` trong `schedules.service.ts` hiện tạo `Schedule` mà không
gán `orderCode` — field này để `NULL` cho tới khi có task này. Cũng cần đảm bảo `toScheduleView` (hàm map dữ
liệu trả về, dòng ~853) hiện **không có `orderCode` trong object trả về** dù model đã có field — vì hàm này
liệt kê thủ công từng field (whitelist), phải thêm dòng `orderCode: item.orderCode` thì FE mới thấy được.

## 🧠 Giải thích NestJS/Prisma cần biết
- Sinh mã có thể đụng độ nếu 2 request tạo lịch cùng lúc trong cùng 1 ngày (race condition). Vì
  `orderCode` có `@unique`, cách xử lý an toàn: thử tạo, nếu Prisma báo lỗi trùng khoá (`P2002`) thì tính lại
  số thứ tự và thử lại, tối đa 3 lần — không cần khoá bảng phức tạp cho quy mô ứng dụng này.
- Viết hàm dùng chung `generateOrderCode(tx, prefix, at)` trong cùng file util `transaction-seq.util.ts`
  (Task 91 đã tạo) hoặc file riêng — khuyến khích gộp chung 1 file `common/utils/order-code.util.ts` vì đây
  là logic sinh mã, khác bản chất với đếm dailySeq (dù cùng ý tưởng đếm theo ngày).

## 📖 Các file cần đọc trước
- `apps/backend/src/schedules/schedules.service.ts` (hàm `createInboundSchedule` dòng ~194-310,
  `createOutboundSchedule` dòng ~311-422, hàm `toScheduleView` dòng ~853-906, và `scheduleInclude`)
- `apps/backend/src/schedules/schedules.controller.ts` (để biết cách khai báo route/decorator hiện có)
- `apps/backend/prisma/backfill-order-code.ts` (từ Task 84 — tham khảo định dạng mã `SCH-YYYYMMDD-xxxx` đã
  dùng, PHẢI sinh đúng cùng định dạng, không tạo định dạng thứ 2)

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/backend/src/common/utils/order-code.util.ts`
- Sửa: `apps/backend/src/schedules/schedules.service.ts` (gán `orderCode` lúc tạo Schedule, thêm
  `orderCode` vào `toScheduleView`, thêm hàm `findByOrderCode`)
- Sửa: `apps/backend/src/schedules/schedules.controller.ts` (thêm route `GET /schedules/by-code/:orderCode`)
- Sửa: `apps/backend/src/transactions/dto/transaction.dto.ts` (thêm field `orderCode?: string` vào
  `TransactionQueryDto`)
- Sửa: `apps/backend/src/transactions/transactions.service.ts` (dùng `orderCode` để lọc qua relation
  `schedule`)

## 📂 File KHÔNG được sửa
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/backfill-order-code.ts`
- Logic FEFO/slot-scoring, và các field khác trong `createInboundSchedule`/`createOutboundSchedule`

## 🔌 API cần dùng
- `POST /schedules/inbound`, `POST /schedules/outbound` — response (`toScheduleView`) giờ có thêm
  `orderCode`.
- `GET /schedules/by-code/:orderCode` (MỚI) — trả 1 schedule theo mã đơn, 404 nếu không có.
- `GET /transactions?orderCode=SCH-...` (mở rộng) — lọc giao dịch theo mã đơn của lịch sinh ra nó.

## 🪜 Các bước thực hiện
1. Tạo `common/utils/order-code.util.ts`:
   ```ts
   import { Prisma } from '../../../generated/prisma/client';

   function formatDay(d: Date): string {
     const y = d.getFullYear();
     const m = String(d.getMonth() + 1).padStart(2, '0');
     const day = String(d.getDate()).padStart(2, '0');
     return `${y}${m}${day}`;
   }

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
   ```
2. Trong `createInboundSchedule`/`createOutboundSchedule`, bọc đoạn tạo `Schedule` bằng
   `this.prisma.$transaction(async (tx) => { ... })` nếu hàm đang tạo trực tiếp bằng `this.prisma.schedule.create`
   (kiểm tra code hiện tại — nếu đã có transaction bao ngoài thì tái sử dụng). Trong đó:
   - Gọi `const orderCode = await generateOrderCode(tx);`.
   - Thử `tx.schedule.create({ data: { ..., orderCode } })`; nếu Prisma ném lỗi có `code === 'P2002'`
     (unique constraint), gọi lại `generateOrderCode` và thử tối đa 3 lần trước khi throw lỗi thật.
3. Trong `toScheduleView`, thêm dòng `orderCode: item.orderCode,` vào object trả về (đặt ngay sau `id`).
4. Thêm hàm `findByOrderCode(orderCode: string)` trong `SchedulesService`:
   ```ts
   async findByOrderCode(orderCode: string) {
     const schedule = await this.prisma.schedule.findUnique({
       where: { orderCode },
       include: scheduleInclude,
     });
     if (!schedule) throw new NotFoundException('Schedule not found for this order code');
     return toScheduleView(schedule);
   }
   ```
5. Trong `schedules.controller.ts`, thêm route:
   ```ts
   @Get('by-code/:orderCode')
   @Roles(MANAGER_ROLE) // hoặc role phù hợp — dùng đúng role các route GET schedule khác đang dùng
   findByOrderCode(@Param('orderCode') orderCode: string) {
     return this.service.findByOrderCode(orderCode);
   }
   ```
   Đặt route này TRƯỚC route `GET /schedules/:id` nếu có (để Nest không hiểu nhầm `by-code` là 1 `:id`).
6. Trong `transaction.dto.ts`, thêm:
   ```ts
   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   orderCode?: string;
   ```
7. Trong `transactions.service.ts`, hàm `findAll`, thêm điều kiện lọc:
   ```ts
   if (query.orderCode) where.schedule = { orderCode: query.orderCode };
   ```
8. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
Xem đầy đủ trong mục "Các bước thực hiện".

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/92.txt`

## ✅ Checklist nghiệm thu
- ☐ Tạo lịch nhập/xuất mới → `orderCode` tự sinh đúng định dạng `SCH-YYYYMMDD-xxxx`, không trùng với mã đã
  backfill ở Task 84
- ☐ `toScheduleView` trả `orderCode` cho FE
- ☐ `GET /schedules/by-code/:orderCode` hoạt động, 404 đúng chuẩn khi không tìm thấy
- ☐ `GET /transactions?orderCode=...` lọc đúng các giao dịch sinh ra từ lịch có mã đó
- ☐ Route `by-code/:orderCode` không bị route `:id` khác "nuốt mất" (kiểm tra thứ tự khai báo route)
- ☐ Tạo 2 lịch liên tiếp trong cùng ngày (test thủ công gọi API 2 lần nhanh) → 2 `orderCode` khác nhau, tăng
  dần đúng thứ tự
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Đặt route `GET /schedules/by-code/:orderCode` SAU route `GET /schedules/:id`** → NestJS match theo thứ
  tự khai báo, `:id` sẽ nuốt mất `by-code` (hiểu `by-code` là 1 giá trị id), gây lỗi "Schedule not found".
  Phải khai báo `by-code/:orderCode` TRƯỚC.
- **Không xử lý race condition (bỏ qua bước retry khi trùng `P2002`)** → khi 2 nhân viên đặt lịch cùng lúc
  trong cùng giây, có xác suất nhỏ bị lỗi tạo lịch do trùng `orderCode`, trải nghiệm xấu. Bắt buộc có logic
  retry.
- **Sinh sai định dạng mã** (khác với `SCH-YYYYMMDD-xxxx` đã dùng ở Task 84) → 2 kiểu mã tồn tại song song
  trong hệ thống, gây khó tra cứu/backup sau này.

## 🔄 Cách test
1. `npm run start:dev --workspace=backend`, tạo 1 lịch nhập mới qua `POST /schedules/inbound`, kiểm tra
   response có `orderCode` đúng định dạng.
2. Gọi `GET /schedules/by-code/:orderCode` với mã vừa tạo — phải trả đúng lịch đó.
3. Thực hiện lịch đó (execute), sau đó gọi `GET /transactions?orderCode=<mã>` — phải trả đúng giao dịch sinh
   ra từ lịch này.
4. Gọi `GET /schedules/by-code/SCH-KHONG-TON-TAI` — phải trả 404.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/schedules/schedules.service.ts apps/backend/src/schedules/schedules.controller.ts apps/backend/src/transactions/dto/transaction.dto.ts apps/backend/src/transactions/transactions.service.ts
rm apps/backend/src/common/utils/order-code.util.ts
```

## 📝 Commit message
```
feat(schedules): auto-generate orderCode and add lookup by order code
```

## 🔀 PR title
```
[Task 92] Generate order code on schedule creation + lookup endpoints
```

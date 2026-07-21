# Task 91 [BACKEND] — Ghi `quantityBefore/After/dailySeq` khi tạo Transaction + endpoint chi tiết

## 🎯 Mục tiêu
Khi hệ thống tạo `Transaction` (lúc thực hiện lịch nhập/xuất), ghi lại **tồn kho tại slot đó trước và sau**
giao dịch (`quantityBefore`/`quantityAfter`, field đã thêm ở Task 82), và số thứ tự trong ngày
(`dailySeq`). Đồng thời expose các field này qua API, và thêm endpoint `GET /transactions/:id` để xem chi
tiết 1 giao dịch — hiện hệ thống chỉ có API danh sách, chưa có API chi tiết.

**Điều kiện tiên quyết: Task 82 (field mới) và Task 84 (migration) đã merge.**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
Đã xác nhận 2 nơi tạo `Transaction` trong `apps/backend/src/schedules/schedules.service.ts`:

1. **`executeInboundSchedule`** (dòng ~507-524): gọi `tx.inventory.upsert(...)` để tăng tồn kho, RỒI MỚI
   `tx.transaction.create(...)` — tại thời điểm tạo transaction, số liệu "trước" đã bị ghi đè mất (vì upsert
   chạy trước). Phải đọc tồn kho **trước khi** upsert để có `quantityBefore` chính xác.
2. **`executeOutboundSchedule`** (dòng ~627-657, chạy trong vòng lặp `for (const line of pickLines)`): đã
   sẵn có biến `inv` (đọc bằng `tx.inventory.findUnique` dòng 628) **trước khi** update/xoá — đây chính là
   `quantityBefore`. `quantityAfter` = `inv.quantity - line.quantity` (hoặc 0 nếu bị xoá hẳn record vì xuất
   hết).

Ngoài ra, `TransactionsController` hiện **chỉ có route `GET /transactions` (danh sách)**, không có route chi
tiết theo `id` — đúng như anh mô tả "chưa có detail transaction".

## 🧠 Giải thích NestJS/Prisma cần biết
- `quantityBefore`/`quantityAfter` là tồn kho **tại đúng slot đang giao dịch** (không phải tổng tồn kho toàn
  hệ thống của sản phẩm) — vì `Inventory` là theo cặp `(batchId, slotId)`.
- `dailySeq`: số thứ tự tăng dần trong ngày, tính chung cho mọi giao dịch (không tách riêng IMPORT/EXPORT)
  để phản ánh đúng thứ tự phát sinh thực tế trong ngày làm việc. Viết 1 helper dùng chung
  `getNextDailySeq(tx, now)` — đếm số `Transaction` đã tạo trong ngày (`createdAt` cùng ngày với `now`)
  ngay bên trong cùng 1 `prisma.$transaction`, `dailySeq = count + 1`. Vì chạy trong cùng transaction DB,
  các lần gọi liên tiếp trong vòng lặp outbound (nhiều dòng pick) sẽ tự thấy số đếm tăng dần đúng thứ tự.
- Đặt helper trong `common/utils/` (không phải service có DI) vì chỉ nhận `tx: Prisma.TransactionClient`
  làm tham số, không cần inject gì thêm.

## 📖 Các file cần đọc trước
- `apps/backend/src/schedules/schedules.service.ts` (đoạn `executeInboundSchedule` dòng 423-544 và
  `executeOutboundSchedule` dòng 546-680)
- `apps/backend/src/transactions/transactions.service.ts`, `transactions.controller.ts` (toàn bộ)

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/backend/src/common/utils/transaction-seq.util.ts`
- Sửa: `apps/backend/src/schedules/schedules.service.ts` (chỉ 2 đoạn tạo Transaction nói trên, không sửa
  logic phân bổ slot/FEFO)
- Sửa: `apps/backend/src/transactions/transactions.service.ts` (thêm field vào `select`/`toTransactionView`,
  thêm hàm `findOne`)
- Sửa: `apps/backend/src/transactions/transactions.controller.ts` (thêm route `GET /transactions/:id`)

## 📂 File KHÔNG được sửa
- Logic tính `allocations`/`pickLines` (FEFO, slot scoring) trong `schedules.service.ts` — task này chỉ
  thêm 3 field vào đúng chỗ tạo `Transaction`, không đổi cách chọn vị trí/lô.
- `apps/backend/prisma/schema.prisma`
- Bất kỳ file frontend nào (Task 108 ở Stage 19 sẽ dùng API mới này)

## 🔌 API cần dùng
- `GET /transactions` — mỗi item trong response thêm `quantityBefore`, `quantityAfter`, `dailySeq`.
- `GET /transactions/:id` (MỚI) — trả 1 transaction đầy đủ chi tiết, cùng field như trên.

## 🪜 Các bước thực hiện
1. Tạo `common/utils/transaction-seq.util.ts`:
   ```ts
   import { Prisma } from '../../../generated/prisma/client';

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
   ```
2. Trong `executeInboundSchedule`, TRƯỚC dòng `await tx.inventory.upsert(...)`, đọc tồn kho hiện tại:
   ```ts
   const existingInv = await tx.inventory.findUnique({
     where: { batchId_slotId: { batchId: batch.id, slotId } },
   });
   const quantityBefore = existingInv?.quantity ?? 0;
   ```
   Sau khi `upsert` xong, `quantityAfter = quantityBefore + schedule.quantity`. Truyền
   `quantityBefore`, `quantityAfter`, và `dailySeq: await getNextDailySeq(tx)` vào `data` của
   `tx.transaction.create(...)`.
3. Trong `executeOutboundSchedule`, bên trong vòng lặp, sau khi đã có biến `inv` (dòng ~628):
   ```ts
   const quantityBefore = inv.quantity;
   const quantityAfter = inv.quantity - line.quantity; // 0 nếu record vừa bị xoá
   ```
   Truyền thêm `quantityBefore`, `quantityAfter`, `dailySeq: await getNextDailySeq(tx)` vào `data` của
   `tx.transaction.create(...)` trong vòng lặp.
4. Trong `transactions.service.ts`:
   - Thêm `quantityBefore: true, quantityAfter: true, dailySeq: true` vào `select` của `findAll`.
   - Thêm 3 field tương ứng vào type tham số và object trả về của `toTransactionView`.
   - Viết thêm hàm `findOne(id: string)`: `prisma.transaction.findUnique({ where: { id }, select: {...giống
     hệt select của findAll...} })`, ném `NotFoundException` nếu không thấy, trả về
     `toTransactionView(item)`.
5. Trong `transactions.controller.ts`, thêm route:
   ```ts
   @Get(':id')
   @Roles(MANAGER_ROLE)
   @ApiAuthReadErrors()
   findOne(@Param('id') id: string) {
     return this.service.findOne(id);
   }
   ```
   (đặt SAU route `@Get()` hiện có — Nest match route tĩnh trước route có tham số nếu khai báo đúng thứ tự,
   nhưng ở đây không xung đột vì `GET /transactions` không có tham số).
6. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
Xem chi tiết từng đoạn ở mục "Các bước thực hiện" — đó là code cần thêm/sửa.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/91.txt`

## ✅ Checklist nghiệm thu
- ☐ `transaction-seq.util.ts` xuất `getNextDailySeq(tx, at?)`
- ☐ Transaction IMPORT tạo ra có `quantityBefore` = tồn kho slot đó trước khi cộng, `quantityAfter` = sau
  khi cộng
- ☐ Transaction EXPORT tạo ra có `quantityBefore`/`quantityAfter` đúng theo từng dòng pick (không dùng
  chung 1 giá trị cho nhiều dòng)
- ☐ `dailySeq` tăng dần đúng thứ tự tạo trong cùng 1 ngày, kể cả khi 1 lần xuất tạo nhiều transaction (vòng
  lặp outbound)
- ☐ `GET /transactions` trả thêm `quantityBefore`, `quantityAfter`, `dailySeq` cho mỗi item
- ☐ `GET /transactions/:id` hoạt động, trả 404 đúng chuẩn nếu id không tồn tại
- ☐ Không đổi logic FEFO/slot-scoring trong `schedules.service.ts`
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Đọc tồn kho SAU khi đã `upsert`/`update`** → `quantityBefore` bị lấy nhầm giá trị đã cộng/trừ rồi, y hệt
  giá trị `quantityAfter`. Luôn đọc trước khi ghi.
- **Gọi `getNextDailySeq` trước khi các bước ghi dữ liệu khác trong cùng transaction hoàn tất** không sao,
  nhưng nếu gọi NGOÀI `prisma.$transaction` (dùng `this.prisma` thay vì `tx`) → mất tính nhất quán, 2 giao
  dịch chạy đồng thời có thể đếm trùng số. Luôn gọi bằng client `tx` bên trong transaction.
- **Ở outbound, dùng chung 1 giá trị `quantityBefore` cho toàn bộ `pickLines`** thay vì tính riêng theo từng
  dòng — sai vì mỗi dòng pick là 1 slot/batch khác nhau, tồn kho trước/sau khác nhau hoàn toàn.

## 🔄 Cách test
1. Thực hiện 1 lịch nhập kho qua `POST /schedules/:id/execute` (Swagger), kiểm tra `Transaction` vừa tạo
   (qua `GET /transactions/:id`) có `quantityBefore`/`quantityAfter` đúng.
2. Thực hiện 1 lịch xuất kho có FEFO chia nhiều slot (dùng sản phẩm có tồn ở ≥2 batch/slot khác nhau) — kiểm
   tra mỗi `Transaction` con có `quantityBefore`/`quantityAfter` riêng biệt, đúng theo slot của nó.
3. Tạo liên tiếp vài giao dịch trong cùng ngày, kiểm tra `dailySeq` tăng dần 1, 2, 3... không nhảy số, không
   trùng.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/schedules/schedules.service.ts apps/backend/src/transactions/transactions.service.ts apps/backend/src/transactions/transactions.controller.ts
rm apps/backend/src/common/utils/transaction-seq.util.ts
```

## 📝 Commit message
```
feat(transactions): record quantityBefore/After + dailySeq, add GET /transactions/:id
```

## 🔀 PR title
```
[Task 91] Add transaction detail (before/after quantity) and detail endpoint
```

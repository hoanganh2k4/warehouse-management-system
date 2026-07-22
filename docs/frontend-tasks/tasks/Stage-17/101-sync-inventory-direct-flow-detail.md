# Task 101 [BACKEND] — Đồng bộ `quantityBefore/After/dailySeq` cho luồng nhập/xuất trực tiếp qua Inventory

## 🎯 Mục tiêu
Vá lỗ hổng: `InventoryService.inbound()`/`outbound()` (API `POST /inventory/inbound`,
`POST /inventory/outbound`) là **luồng nhập/xuất riêng biệt, KHÔNG đi qua Schedule**, nhưng Task 91 (Stage
14) chỉ sửa `schedules.service.ts` — luồng này vẫn tạo `Transaction` **thiếu** `quantityBefore`,
`quantityAfter`, `dailySeq`. Phải đồng bộ để MỌI `Transaction` trong hệ thống (dù tạo qua Schedule hay qua
Inventory trực tiếp) đều có đủ dữ liệu chi tiết.

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể — phát hiện quan trọng)
Hệ thống hiện có **2 con đường tạo giao dịch nhập/xuất hoàn toàn độc lập**:
1. Qua `Schedule` (đặt lịch → duyệt → thực hiện) — `schedules.service.ts`, đã vá đủ ở Task 91/99.
2. Qua `InventoryController` (`POST /inventory/inbound`, `POST /inventory/outbound`) — `inventory.service.ts`,
   hàm `inbound()` (dòng 180-259) và `outbound()` (dòng 261-329) — **nhập/xuất tức thời, không qua bước đặt
   lịch/duyệt nào cả**. Đây là 2 API thật, có route, có Swagger doc riêng (`inventory.controller.ts`).

Cả 2 hàm này đều gọi `tx.transaction.create({...})` (dòng 233-242 và 304-313) nhưng **hoàn toàn không có**
`quantityBefore`, `quantityAfter`, `dailySeq` — vì Task 91 chỉ sửa file `schedules.service.ts`. Nếu không vá
lỗ hổng này, tính năng "chi tiết giao dịch trước/sau" (Task 91) sẽ **có lỗ hổng dữ liệu**: giao dịch tạo qua
`/inventory/inbound` vẫn thiếu thông tin, tuỳ thuộc nhân viên dùng API nào mà có/không có chi tiết — không
chấp nhận được.

## 🧠 Giải thích NestJS/Prisma cần biết
- Áp dụng lại **đúng pattern đã dùng ở Task 91/99**: đọc tồn kho hiện tại (`tx.inventory.findUnique`)
  TRƯỚC khi `upsert`/`update`/`delete` để có `quantityBefore`, tính `quantityAfter` sau đó; gọi
  `getNextDailySeq(tx)` (từ `common/utils/transaction-seq.util.ts`, đã tạo ở Task 91) cho mỗi
  `Transaction`.
- Ở hàm `inbound()`, do đã dùng `tx.inventory.upsert` trực tiếp không lưu giá trị trước, cần thêm 1 bước đọc
  trước upsert (giống cách đã sửa `executeInboundSchedule`/`executeInboundSchedule` nhiều slot ở Task 99).
- Ở hàm `outbound()`, đã có sẵn biến `inv` đọc TRƯỚC khi update/xoá (dòng 284-291) — chỉ cần tính
  `quantityBefore = inv.quantity`, `quantityAfter = inv.quantity - line.quantity` (giống hệt cách đã làm ở
  `executeOutboundSchedule`).

## 📖 Các file cần đọc trước
- `apps/backend/src/inventory/inventory.service.ts` (toàn bộ, đặc biệt `inbound()` và `outbound()`)
- `apps/backend/src/common/utils/transaction-seq.util.ts` (từ Task 91)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/inventory/inventory.service.ts` (chỉ hàm `inbound()` và `outbound()`)

## 📂 File KHÔNG được sửa
- `apps/backend/src/schedules/schedules.service.ts` (đã hoàn thiện ở các task trước, không liên quan)
- `apps/backend/src/inventory/inventory.controller.ts`, `findAll()`, `findOne()` trong cùng service (không
  liên quan tới việc ghi dữ liệu, chỉ đọc)

## 🔌 API cần dùng
`POST /inventory/inbound`, `POST /inventory/outbound` — response shape không đổi, chỉ `Transaction` bên
trong DB được ghi đủ field (không lộ trực tiếp qua response của 2 API này, nhưng sẽ thấy khi tra cứu qua
`GET /transactions`/`GET /transactions/:id`).

## 🪜 Các bước thực hiện
1. Import `getNextDailySeq` từ `'../common/utils/transaction-seq.util'` ở đầu `inventory.service.ts`.
2. Trong `inbound()`, bên trong vòng lặp `for (const { slot, allocateQty, score } of allocations)`, TRƯỚC
   dòng `tx.inventory.upsert`, thêm:
   ```ts
   const existingInv = await tx.inventory.findUnique({
     where: { batchId_slotId: { batchId: batch.id, slotId: slot.id } },
   });
   const quantityBefore = existingInv?.quantity ?? 0;
   const quantityAfter = quantityBefore + allocateQty;
   ```
   Thêm `quantityBefore`, `quantityAfter`, `dailySeq: await getNextDailySeq(tx)` vào `data` của
   `tx.transaction.create(...)` trong vòng lặp này.
3. Trong `outbound()`, bên trong vòng lặp `for (const line of pickingList)`, sau đoạn đã có biến `inv`
   (dòng 284-291), thêm:
   ```ts
   const quantityBefore = inv.quantity;
   const quantityAfter = inv.quantity - line.quantity;
   ```
   Thêm `quantityBefore`, `quantityAfter`, `dailySeq: await getNextDailySeq(tx)` vào `data` của
   `tx.transaction.create(...)` trong vòng lặp này.
4. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code (đoạn diff minh hoạ cho `inbound()`)
```ts
for (const { slot, allocateQty, score } of allocations) {
  const existingInv = await tx.inventory.findUnique({
    where: { batchId_slotId: { batchId: batch.id, slotId: slot.id } },
  });
  const quantityBefore = existingInv?.quantity ?? 0;
  const quantityAfter = quantityBefore + allocateQty;

  const inventory = await tx.inventory.upsert({
    where: { batchId_slotId: { batchId: batch.id, slotId: slot.id } },
    create: { batchId: batch.id, slotId: slot.id, quantity: allocateQty },
    update: { quantity: { increment: allocateQty } },
  });

  await this.slotCapacity.recalculate(slot.id, tx);

  await tx.transaction.create({
    data: {
      type: TransactionType.IMPORT,
      batchId: batch.id,
      slotToId: slot.id,
      quantity: allocateQty,
      quantityBefore,
      quantityAfter,
      dailySeq: await getNextDailySeq(tx),
      userId: user.id,
      note: dto.note,
    },
  });

  // ...phần push vào slotResults giữ nguyên...
}
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/101.txt`

## ✅ Checklist nghiệm thu
- ☐ `POST /inventory/inbound` tạo `Transaction` có đủ `quantityBefore`/`quantityAfter`/`dailySeq`
- ☐ `POST /inventory/outbound` tạo `Transaction` có đủ `quantityBefore`/`quantityAfter`/`dailySeq`, tính
  riêng theo từng dòng `pickingList` (không dùng chung 1 giá trị)
- ☐ Không đổi response shape của 2 API (chỉ đổi dữ liệu ghi vào DB)
- ☐ Không đổi logic phân bổ/FEFO trong 2 hàm
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Tưởng lầm đây là cùng 1 luồng với `schedules.service.ts` nên bỏ qua task này** — đây là bug thực tế đã
  xác nhận, không phải trùng lặp: 2 file khác nhau, 2 API khác nhau, phải sửa riêng.
- **Đọc tồn kho SAU khi upsert** ở `inbound()` → `quantityBefore` bị lấy nhầm giá trị đã cộng rồi.

## 🔄 Cách test
1. Gọi `POST /inventory/inbound` với sản phẩm/số lượng hợp lệ.
2. Lấy `transactions` được tạo (nếu response không lộ trực tiếp id, tra qua `GET /transactions?batchId=...`
   hoặc theo thời gian gần nhất) → kiểm tra có đủ `quantityBefore`/`quantityAfter`/`dailySeq`.
3. Lặp lại tương tự cho `POST /inventory/outbound`.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/inventory/inventory.service.ts
```

## 📝 Commit message
```
fix(inventory): record quantityBefore/After/dailySeq for direct inbound/outbound API
```

## 🔀 PR title
```
[Task 101] Sync transaction detail fields to direct Inventory inbound/outbound flow
```

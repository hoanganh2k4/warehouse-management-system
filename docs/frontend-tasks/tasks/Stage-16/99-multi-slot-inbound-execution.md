# Task 99 [BACKEND] — Bỏ chặn cứng 1-slot, hỗ trợ chia nhiều slot khi thực hiện lịch nhập

## 🎯 Mục tiêu
Sửa `executeInboundSchedule` để khi 1 slot không đủ chứa hết số lượng, hệ thống **tự động chia hàng vào
nhiều slot** (dùng lại `alternativeSlots` đã tính từ Task 98) thay vì báo lỗi chặn cứng, bắt nhân viên phải
tự chọn thủ công. Ghi nhận `ScheduleAllocation` (kind `ACTUAL`) cho từng slot thực tế đã dùng.

**Điều kiện tiên quyết: Task 91 (quantityBefore/After/dailySeq), Task 98 (alternativeSlots + ScheduleAllocation)
đã merge.**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
`executeInboundSchedule`, dòng 461-468 (nhánh không override thủ công):
```ts
if (
  allocations.length === 0 ||
  allocations[0].allocateQty < schedule.quantity
) {
  throw new BadRequestException(
    'Không tìm được 1 Slot đủ sức chứa toàn bộ số lượng. Vui lòng dùng chức năng "Thay đổi vị trí" để chọn thủ công.',
  );
}
slotId = allocations[0].slot.id;
```
Đây chính là **chặn cứng 1-slot** anh mô tả: hệ thống đã tính ra `allocations` gồm nhiều slot đủ dùng, nhưng
lại từ chối thực hiện, bắt nhân viên tự tay chọn — dù bản thân dữ liệu để tự động chia hàng đã có sẵn.

Toàn bộ phần còn lại của hàm (dòng 488-543, khối `this.prisma.$transaction`) hiện chỉ xử lý **1** `slotId`
duy nhất: 1 lần `inventory.upsert`, 1 lần `slotCapacity.recalculate`, 1 lần `transaction.create`. Cần đổi
thành vòng lặp qua nhiều slot khi cần chia hàng.

## 🧠 Giải thích Prisma/NestJS cần biết
- Khi override thủ công (`dto.override`), vẫn giữ nguyên hành vi 1-slot như cũ (nhân viên đã chủ động chọn
  1 vị trí cụ thể, không cần chia tự động) — task này CHỈ đổi nhánh KHÔNG override (nhánh Smart Allocation
  tự động).
- Với mỗi slot trong danh sách chia hàng, tái sử dụng đúng logic Task 91 đã làm (đọc tồn kho trước khi
  upsert để có `quantityBefore`, gọi `getNextDailySeq(tx)` cho mỗi `Transaction` con) — áp dụng y hệt cách
  `executeOutboundSchedule` đang làm cho nhiều dòng pick, để 2 luồng nhất quán với nhau.
- `Schedule.actualSlotId`/`actualBatchId` vẫn chỉ lưu **vị trí đầu tiên** (vị trí "chính") như thiết kế hiện
  tại — không đổi field này; danh sách ĐẦY ĐỦ nằm trong `ScheduleAllocation` (kind `ACTUAL`), giống cách
  `suggestedSlotId` đã làm với `alternativeSlots` ở Task 98.

## 📖 Các file cần đọc trước
- `apps/backend/src/schedules/schedules.service.ts` (hàm `executeInboundSchedule` dòng 423-544, và
  `executeOutboundSchedule` để tham khảo cách viết vòng lặp tạo nhiều Transaction đã có sẵn)
- `apps/backend/src/common/utils/transaction-seq.util.ts` (từ Task 91)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/schedules/schedules.service.ts` (chỉ hàm `executeInboundSchedule`)

## 📂 File KHÔNG được sửa
- `executeOutboundSchedule` (đã tự hỗ trợ multi-slot từ trước, không cần sửa)
- Nhánh `dto.override` trong `executeInboundSchedule` — giữ nguyên hành vi 1-slot khi nhân viên tự chọn thủ
  công
- `computeInboundSuggestion`, `SlotScoringService`

## 🔌 API cần dùng
`POST /schedules/:id/execute` — response giờ có thể trả về `transactions: Transaction[]` với **nhiều phần
tử** (trước đây luôn là mảng 1 phần tử `[transaction]`) khi phải chia nhiều slot.

## 🪜 Các bước thực hiện
1. Trong nhánh KHÔNG override (dòng ~447-471), thay vì lấy `allocations[0]` rồi kiểm tra đủ 1 slot, giữ
   toàn bộ `allocations` lại, chỉ kiểm tra **tổng** `allocateQty` cộng dồn có đủ `schedule.quantity` không:
   ```ts
   const allocations = await this.slotScoring.findBestSlots(
     product,
     schedule.quantity,
     expiryProxy,
   );
   const totalAllocatable = allocations.reduce((sum, a) => sum + a.allocateQty, 0);
   if (allocations.length === 0 || totalAllocatable < schedule.quantity) {
     throw new BadRequestException(
       'Không tìm được đủ vị trí trống cho toàn bộ số lượng. Vui lòng dùng chức năng "Thay đổi vị trí" để chọn thủ công.',
     );
   }
   allocationMethod = AllocationMethod.SMART_ALLOCATION;
   // Không gán 1 slotId duy nhất nữa — xử lý danh sách multiInboundSlots bên dưới.
   ```
   Đổi biến `slotId: string` (khai báo đầu hàm) thành `multiSlots: { slotId: string; quantity: number }[]`
   dùng chung cho cả 2 nhánh (override và tự động) — nhánh override tạo mảng 1 phần tử
   `[{ slotId: slot.id, quantity: schedule.quantity }]`; nhánh tự động tạo từ `allocations` (cắt đúng theo
   `schedule.quantity`, phần tử cuối có thể ít hơn `allocateQty` gốc nếu tổng đã đủ).
2. Trong khối `this.prisma.$transaction(async (tx) => {...})`, đổi phần xử lý inventory/transaction từ xử lý
   1 `slotId` sang loop qua `multiSlots`:
   ```ts
   const transactions: Prisma.TransactionGetPayload<object>[] = [];
   for (const { slotId: sId, quantity: qty } of multiSlots) {
     const existingInv = await tx.inventory.findUnique({
       where: { batchId_slotId: { batchId: batch.id, slotId: sId } },
     });
     const quantityBefore = existingInv?.quantity ?? 0;
     const quantityAfter = quantityBefore + qty;

     await tx.inventory.upsert({
       where: { batchId_slotId: { batchId: batch.id, slotId: sId } },
       create: { batchId: batch.id, slotId: sId, quantity: qty },
       update: { quantity: { increment: qty } },
     });
     await this.slotCapacity.recalculate(sId, tx);

     const txn = await tx.transaction.create({
       data: {
         type: TransactionType.IMPORT,
         batchId: batch.id,
         slotToId: sId,
         quantity: qty,
         quantityBefore,
         quantityAfter,
         dailySeq: await getNextDailySeq(tx),
         userId: user.id,
         note: schedule.note ?? undefined,
       },
     });
     transactions.push(txn);
   }
   ```
3. Sau vòng lặp, insert `ScheduleAllocation` (kind `ACTUAL`) cho từng slot đã dùng:
   ```ts
   await tx.scheduleAllocation.createMany({
     data: multiSlots.map((s, idx) => ({
       scheduleId: schedule.id,
       kind: 'ACTUAL' as const,
       slotId: s.slotId,
       batchId: batch.id,
       quantity: s.quantity,
       sortOrder: idx,
     })),
   });
   ```
4. Cập nhật `tx.schedule.update`: `actualSlotId: multiSlots[0].slotId` (vị trí chính, giữ tương thích ngược
   cho UI cũ vẫn chỉ đọc field này), `transactionId: transactions[0].id` (giữ đúng kiểu dữ liệu field hiện
   có, vẫn là 1-1 — không đổi schema Schedule.transactionId ở task này).
5. Đổi `return { schedule: toScheduleView(updated), transactions: [transaction] };` thành
   `return { schedule: toScheduleView(updated), transactions };` (trả toàn bộ mảng, không còn ép về 1 phần
   tử).
6. Import `getNextDailySeq` từ `common/utils/transaction-seq.util.ts` ở đầu file nếu chưa import.
7. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
Xem đầy đủ các đoạn ở mục "Các bước thực hiện" — ghép lại là toàn bộ nội dung hàm
`executeInboundSchedule` sau khi sửa.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/99.txt`

## ✅ Checklist nghiệm thu
- ☐ Kịch bản 1 slot không đủ chứa, nhưng tổng nhiều slot đủ → thực hiện lịch THÀNH CÔNG (không còn báo lỗi
  chặn cứng), chia đúng số lượng vào từng slot theo `alternativeSlots`
- ☐ Kịch bản override thủ công (`dto.override`) → hành vi giữ nguyên y hệt trước khi sửa (1 slot duy nhất
  theo lựa chọn của nhân viên)
- ☐ Mỗi `Transaction` con có `quantityBefore`/`quantityAfter`/`dailySeq` đúng riêng theo từng slot (không
  dùng chung 1 giá trị)
- ☐ `ScheduleAllocation` (kind `ACTUAL`) được ghi đủ số dòng tương ứng số slot thực tế đã dùng
- ☐ `Schedule.actualSlotId` vẫn được set (vị trí chính = slot đầu tiên trong danh sách)
- ☐ Response trả `transactions` là mảng đầy đủ (không bị cắt còn 1 phần tử)
- ☐ Kịch bản KHÔNG đủ chỗ ở bất kỳ đâu (tổng `allocateQty` < `schedule.quantity`) → vẫn báo lỗi
  `BadRequestException` đúng như cũ
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Cắt sai số lượng khi build `multiSlots` từ `allocations`** (dùng nguyên `allocateQty` của từng phần tử
  mà không giới hạn theo tổng `schedule.quantity` còn thiếu) → có thể nhập dư số lượng vào slot cuối cùng
  nếu tổng `allocateQty` các slot lớn hơn `schedule.quantity` cần. Phải trừ dần `remaining =
  schedule.quantity` qua từng phần tử, lấy `Math.min(a.allocateQty, remaining)` cho mỗi slot, dừng khi
  `remaining === 0`.
- **Đổi luôn nhánh `dto.override`** thành multi-slot → sai, override nghĩa là nhân viên đã chủ động chọn
  đúng 1 vị trí cụ thể, không cần (và không nên) tự động chia thêm.
- **Quên insert `ScheduleAllocation` bên trong cùng `tx.$transaction`** (insert ngoài transaction) → nếu
  transaction rollback vì lỗi ở bước khác, `ScheduleAllocation` vẫn bị lưu sai, không nhất quán với
  Inventory/Transaction thật.

## 🔄 Cách test
1. Tạo kịch bản: sản phẩm cần nhập 150 đơn vị, nhưng slot lớn nhất chỉ chứa được 100 — đảm bảo có ≥ 2 slot
   hợp lệ với tổng dung lượng ≥ 150.
2. Đặt lịch nhập 150 đơn vị, thực hiện lịch (`POST /schedules/:id/execute`, không truyền `override`) — phải
   thành công, không còn báo lỗi "Không tìm được 1 Slot đủ sức chứa".
3. Kiểm tra `GET /transactions?orderCode=<mã đơn>` (Task 92) — phải thấy ≥ 2 Transaction, tổng `quantity`
   bằng 150, mỗi cái có `quantityBefore`/`quantityAfter` đúng riêng.
4. Kiểm tra Prisma Studio bảng `schedule_allocations` — có đủ dòng `kind = ACTUAL` tương ứng.
5. Test lại kịch bản override thủ công (chọn 1 slot cụ thể qua `dto.override`) — vẫn hoạt động như cũ, chỉ 1
   Transaction.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/schedules/schedules.service.ts
```

## 📝 Commit message
```
feat(schedules): support multi-slot execution for inbound schedules instead of hard-blocking
```

## 🔀 PR title
```
[Task 99] Allow inbound execution to split across multiple slots automatically
```

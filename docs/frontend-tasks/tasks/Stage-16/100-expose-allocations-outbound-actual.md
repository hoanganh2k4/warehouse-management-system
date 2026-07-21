# Task 100 [BACKEND] — Expose `allocations` trong chi tiết lịch + lưu ACTUAL cho Outbound

## 🎯 Mục tiêu
Hoàn thiện nốt phần còn thiếu để FE có đủ dữ liệu hiển thị nhiều vị trí nhập/xuất (Task 111 ở Stage 19):
1. Thêm relation `allocations` vào `scheduleInclude`, expose qua `toScheduleView` — hiện `GET
   /schedules/:id` (và danh sách) hoàn toàn chưa trả về `ScheduleAllocation` dù dữ liệu đã được lưu từ Task
   98/99.
2. `executeOutboundSchedule` hiện **chưa lưu `ScheduleAllocation` (kind ACTUAL)** — chỉ tạo nhiều
   `Transaction` mà không ghi vào bảng allocation, không đối xứng với Inbound (đã làm ở Task 99).

**Điều kiện tiên quyết: Task 98, 99 đã merge.**

## 📖 Giải thích nghiệp vụ
Sau Task 98 (lưu SUGGESTED) và Task 99 (lưu ACTUAL cho Inbound), dữ liệu multi-slot đã đầy đủ trong DB,
nhưng:
- `scheduleInclude` (dòng 815-845) liệt kê `product, supplier, customer, suggestedSlot, actualSlot,
  suggestedBatch, actualBatch, createdBy, executedBy` — **không có `allocations`**. FE gọi `GET
  /schedules/:id` sẽ không thấy được danh sách đầy đủ vị trí, dù DB đã có.
- `executeOutboundSchedule` (dòng 546-680, vòng lặp `for (const line of pickLines)`) tạo nhiều `Transaction`
  nhưng không có đoạn `scheduleAllocation.createMany` nào — chỉ Inbound (sau Task 99) mới có, gây thiếu nhất
  quán giữa 2 chiều nhập/xuất.

## 🧠 Giải thích Prisma cần biết
- Thêm `allocations: { select: {...}, orderBy: { sortOrder: 'asc' } }` vào `scheduleInclude`, lấy đủ
  `kind, slotId, batchId, quantity, sortOrder` cùng thông tin `slot`/`batch` rút gọn để FE hiển thị trực
  tiếp mà không cần gọi thêm API.
- `toScheduleView` cần map `item.allocations` thành 1 mảng phẳng, tách riêng theo `kind` (`suggestedAllocations`
  vs `actualAllocations`) để FE dễ dùng — không bắt FE tự filter theo `kind` từ mảng gộp.

## 📖 Các file cần đọc trước
- `apps/backend/src/schedules/schedules.service.ts` (toàn bộ, đặc biệt `scheduleInclude`, `toScheduleView`,
  `executeOutboundSchedule`)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/schedules/schedules.service.ts` (`scheduleInclude`, `toScheduleView`,
  `executeOutboundSchedule`)

## 📂 File KHÔNG được sửa
- `executeInboundSchedule` (đã hoàn thiện ở Task 99)
- `SlotScoringService`, `FefoService`

## 🔌 API cần dùng
`GET /schedules/:id`, `GET /schedules`, `POST /schedules/:id/execute` — response `schedule` giờ có thêm 2
field: `suggestedAllocations: AllocationView[]`, `actualAllocations: AllocationView[]` (rỗng nếu chỉ có 1
vị trí, không phải trường hợp `splitRequired`).

## 🪜 Các bước thực hiện
1. Trong `scheduleInclude`, thêm:
   ```ts
   allocations: {
     select: {
       kind: true,
       slotId: true,
       batchId: true,
       quantity: true,
       sortOrder: true,
       slot: {
         select: {
           code: true,
           level: {
             select: {
               levelNumber: true,
               rack: { select: { code: true, zone: { select: { code: true } } } },
             },
           },
         },
       },
       batch: { select: { batchCode: true } },
     },
     orderBy: { sortOrder: 'asc' },
   },
   ```
2. Trong `toScheduleView`, thêm hàm nhỏ để map 1 allocation thành view phẳng:
   ```ts
   function mapAllocation(a: ScheduleWithRelations['allocations'][number]) {
     return {
       slotId: a.slotId,
       slotPath: formatSlotLocation({
         zoneCode: a.slot.level.rack.zone.code,
         rackCode: a.slot.level.rack.code,
         levelNumber: a.slot.level.levelNumber,
         slotCode: a.slot.code,
       }),
       batchId: a.batchId,
       batchCode: a.batch?.batchCode ?? null,
       quantity: a.quantity,
     };
   }
   ```
   Thêm vào object trả về của `toScheduleView`:
   ```ts
   suggestedAllocations: item.allocations
     .filter((a) => a.kind === 'SUGGESTED')
     .map(mapAllocation),
   actualAllocations: item.allocations
     .filter((a) => a.kind === 'ACTUAL')
     .map(mapAllocation),
   ```
3. Trong `executeOutboundSchedule`, tìm vòng lặp `for (const line of pickLines)` (đã tạo `Transaction` cho
   từng dòng) — sau khi vòng lặp kết thúc (vẫn bên trong `tx.$transaction`), thêm:
   ```ts
   await tx.scheduleAllocation.createMany({
     data: pickLines.map((line, idx) => ({
       scheduleId: schedule.id,
       kind: 'ACTUAL' as const,
       slotId: line.slotId,
       batchId: line.batchId,
       quantity: line.quantity,
       sortOrder: idx,
     })),
   });
   ```
   (Kiểm tra đúng tên biến vòng lặp thực tế trong code — nếu không phải `pickLines`/`line.slotId` như mô tả,
   dùng đúng tên biến đang có, không đổi tên biến sẵn có.)
4. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
Xem đầy đủ ở mục "Các bước thực hiện".

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/100.txt`

## ✅ Checklist nghiệm thu
- ☐ `GET /schedules/:id` trả về `suggestedAllocations` và `actualAllocations`, mỗi phần tử có đủ `slotId,
  slotPath, batchId, batchCode, quantity`
- ☐ Lịch nhập chia nhiều slot (Task 99) → `actualAllocations` có đủ số dòng tương ứng
- ☐ Lịch xuất chia nhiều slot/batch → `actualAllocations` có đủ số dòng tương ứng (trước đây rỗng vì chưa
  lưu)
- ☐ `suggestedAllocations` luôn có dữ liệu ngay từ lúc tạo lịch (Task 98), không đổi bởi task này
- ☐ Không đổi `executeInboundSchedule`
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Quên `orderBy: { sortOrder: 'asc' }` trong `scheduleInclude.allocations`** → thứ tự hiển thị vị trí trên
  FE có thể bị đảo lộn ngẫu nhiên, mất đi thứ tự ưu tiên đã tính từ thuật toán.
- **Nhầm tên biến vòng lặp thực tế trong `executeOutboundSchedule`** khi thêm đoạn `createMany` — phải đọc
  đúng code hiện tại (biến có thể tên khác `pickLines`/`line`), không copy máy móc theo tài liệu này nếu code
  thật khác tên.
- **Insert `ScheduleAllocation` ACTUAL ở Outbound NGOÀI `tx.$transaction`** → mất tính nhất quán nếu
  transaction rollback ở bước khác.

## 🔄 Cách test
1. `GET /schedules/:id` cho 1 lịch nhập vừa tạo (chưa thực hiện) — phải thấy `suggestedAllocations` có dữ
   liệu, `actualAllocations` rỗng.
2. Thực hiện lịch đó — gọi lại `GET /schedules/:id`, `actualAllocations` giờ phải có dữ liệu khớp với các
   Transaction đã tạo.
3. Lặp lại với 1 lịch xuất chia nhiều batch/slot — kiểm tra tương tự.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/schedules/schedules.service.ts
```

## 📝 Commit message
```
feat(schedules): expose suggested/actual allocations and persist ACTUAL for outbound
```

## 🔀 PR title
```
[Task 100] Expose multi-location allocations in schedule detail API
```

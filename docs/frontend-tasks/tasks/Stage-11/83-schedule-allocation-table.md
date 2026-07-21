# Task 83 [BACKEND] — Thêm bảng ScheduleAllocation (nhiều vị trí/lô cho 1 lịch)

## 🎯 Mục tiêu
Thêm bảng mới `ScheduleAllocation` để 1 `Schedule` có thể gắn với **nhiều slot / nhiều batch** (khi số
lượng nhập/xuất lớn phải chia nhiều vị trí), thay vì chỉ 1 `suggestedSlotId`/`actualSlotId` như hiện tại.

**Nguyên tắc bắt buộc: CHỈ THÊM BẢNG MỚI + RELATION, KHÔNG xoá `suggestedSlotId`/`actualSlotId`/
`suggestedBatchId`/`actualBatchId` hiện có trên `Schedule`** (giữ lại để tương thích ngược — các field đó
sẽ tiếp tục lưu vị trí/lô "chính" đầu tiên, còn `ScheduleAllocation` lưu **toàn bộ danh sách** vị trí/lô).
Việc dùng bảng này trong logic thực tế (`computeInboundSuggestion`, `computeOutboundSuggestion`,
`executeInboundSchedule`) là các task 98-99 ở Stage 16.

## 📖 Giải thích nghiệp vụ
Hiện tại khi đặt lịch số lượng lớn, thuật toán (`schedules.service.ts`, hàm `computeInboundSuggestion`/
`computeOutboundSuggestion`) đã tính toán ra danh sách nhiều vị trí phù hợp (biến `allocations` nội bộ, có
cờ `splitRequired`), nhưng **API chỉ trả về vị trí đầu tiên**, và bảng `Schedule` cũng chỉ có chỗ lưu 1
`suggestedSlotId`. Kết quả: nhân viên kho không thấy được "cần chia hàng vào mấy chỗ", và khi thực hiện
lịch nhập, hệ thống báo lỗi nếu 1 slot không đủ chỗ chứa hết số lượng.

Bảng `ScheduleAllocation` giải quyết gốc rễ: mỗi dòng là "trong lịch X, tại vị trí/lô Y, số lượng Z",
`Schedule` 1-n `ScheduleAllocation`. Có 2 loại (`kind`): `SUGGESTED` (gợi ý lúc preview) và `ACTUAL` (thực tế
lúc thực hiện) — dùng chung 1 bảng, phân biệt bằng field `kind`, để không phải tạo 2 bảng riêng.

## 🧠 Giải thích Prisma cần biết
- Quan hệ 1-n: `Schedule` có nhiều `ScheduleAllocation`, mỗi `ScheduleAllocation` thuộc về đúng 1
  `Schedule` (`scheduleId`, có `onDelete: Cascade` để khi xoá Schedule thì xoá luôn allocation liên quan —
  tránh rác dữ liệu).
- `ScheduleAllocation` tham chiếu `Slot` (bắt buộc, mọi allocation phải gắn 1 slot cụ thể) và `Batch`
  (optional — vì lúc `SUGGESTED` cho Inbound có thể chưa có `Batch` thật, batch chỉ được tạo khi thực hiện).
- Thêm `sortOrder Int @default(0)` để giữ đúng thứ tự hiển thị nhiều vị trí trên UI (vị trí ưu tiên nhất
  hiển thị trước).

## 📖 Các file cần đọc trước
- `apps/backend/prisma/schema.prisma` (model `Schedule`, `Slot`, `Batch` — sau khi Task 82 đã merge)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/prisma/schema.prisma`
  - Thêm model mới `ScheduleAllocation`
  - Thêm enum mới `AllocationKind` (`SUGGESTED`, `ACTUAL`)
  - Thêm relation `allocations ScheduleAllocation[]` vào model `Schedule`
  - Thêm relation ngược `scheduleAllocations ScheduleAllocation[]` vào model `Slot` và `Batch`

## 📂 File KHÔNG được sửa
- Không đụng field nào khác ngoài phần thêm mới nói trên.
- Không đụng file `.ts` nào trong `apps/backend/src`.
- Không tạo migration ở task này (Task 84 sẽ gộp cả Task 82 + 83 vào 1 migration).

## 🔌 API cần dùng
Không có — task schema thuần.

## 🪜 Các bước thực hiện
1. Thêm enum mới ngay trên model `Schedule`:
   ```prisma
   enum AllocationKind {
     SUGGESTED
     ACTUAL
   }
   ```
2. Thêm model mới `ScheduleAllocation` (đặt sau model `Schedule` trong file):
   ```prisma
   model ScheduleAllocation {
     id         String         @id @default(uuid())
     scheduleId String
     schedule   Schedule       @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
     kind       AllocationKind

     slotId String
     slot   Slot   @relation(fields: [slotId], references: [id])

     batchId String?
     batch   Batch?  @relation(fields: [batchId], references: [id])

     quantity  Int
     sortOrder Int   @default(0)

     createdAt DateTime @default(now())

     @@index([scheduleId, kind])
     @@map("schedule_allocations")
   }
   ```
3. Trong model `Schedule`, thêm dòng relation (đặt gần các relation khác, ví dụ dưới `transaction`):
   ```prisma
   allocations ScheduleAllocation[]
   ```
4. Trong model `Slot`, thêm relation ngược (đặt gần các relation `schedulesSugg`/`schedulesActual` hiện có):
   ```prisma
   scheduleAllocations ScheduleAllocation[]
   ```
5. Trong model `Batch`, thêm relation ngược tương tự:
   ```prisma
   scheduleAllocations ScheduleAllocation[]
   ```
6. Chạy `npx prisma format` rồi `npx prisma validate` (KHÔNG chạy `migrate dev`).

## 💻 Ví dụ code
Xem đầy đủ trong mục "Các bước thực hiện" ở trên — đó chính là code cần thêm.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/83.txt`

## ✅ Checklist nghiệm thu
- ☐ Enum `AllocationKind` (`SUGGESTED`, `ACTUAL`) đã thêm
- ☐ Model `ScheduleAllocation` đã thêm, có đủ field `scheduleId, kind, slotId, batchId, quantity, sortOrder`
- ☐ `Schedule` có relation `allocations ScheduleAllocation[]`
- ☐ `Slot` và `Batch` có relation ngược `scheduleAllocations ScheduleAllocation[]`
- ☐ `onDelete: Cascade` có trên relation `scheduleId` để tránh rác dữ liệu khi xoá Schedule
- ☐ `npx prisma validate` không lỗi
- ☐ Chưa tạo migration nào

## ❌ Lỗi thường gặp
- **Quên relation ngược ở `Slot`/`Batch`** → Prisma báo lỗi "field is missing an opposite relation field"
  khi validate. Phải thêm đủ cả 2 chiều quan hệ.
- **Đặt `batchId` là bắt buộc (không `?`)** → sai, vì lúc gợi ý Inbound (`SUGGESTED`) có thể chưa có batch
  thật (batch chỉ tạo khi thực hiện lịch).
- **Quên `onDelete: Cascade`** → sau này xoá 1 Schedule test sẽ bị lỗi foreign key vì còn allocation con
  tham chiếu tới.

## 🔄 Cách test
1. `cd apps/backend && npx prisma format && npx prisma validate`.
2. `git diff prisma/schema.prisma` — kiểm tra chỉ có phần thêm mới, field cũ không đổi.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/prisma/schema.prisma
```
(Nếu Task 82 đã merge trước, rollback task này không ảnh hưởng field của Task 82 vì đứng riêng phần diff.)

## 📝 Commit message
```
feat(schema): add ScheduleAllocation table for multi-slot inbound/outbound suggestions
```

## 🔀 PR title
```
[Task 83] Add ScheduleAllocation model for multi-location suggestions
```

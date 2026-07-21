# Task 98 [BACKEND] — Trả về TOÀN BỘ danh sách vị trí gợi ý (không chỉ 1) + lưu `ScheduleAllocation`

## 🎯 Mục tiêu
Sửa `computeInboundSuggestion` để trả về **toàn bộ danh sách vị trí** cần dùng khi số lượng lớn hơn 1 slot
chứa được (`alternativeSlots`), thay vì chỉ hiển thị `slot` chính đầu tiên như hiện tại. Lưu danh sách này
(và danh sách outbound đã có sẵn qua `pickingList`) vào bảng `ScheduleAllocation` (kind `SUGGESTED`) — làm
nền tảng dữ liệu cho Task 99 (thực hiện chia nhiều slot) và Task 111 (UI hiển thị nhiều lựa chọn).

**Điều kiện tiên quyết: Task 83 (bảng `ScheduleAllocation`), Task 97 đã merge.**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
`computeInboundSuggestion` (dòng 100-182) đã **tính toán đủ dữ liệu** — biến `allocations` (từ
`this.slotScoring.findBestSlots`) là mảng nhiều slot khi cần chia hàng, nhưng dòng 122-123:
```ts
// Chỉ hiển thị 1 slot chính (đề xuất tốt nhất) trên Card, đúng theo thiết kế UI.
const top = allocations[0];
```
**cố tình chỉ lấy phần tử đầu tiên**, cờ `splitRequired` chỉ dùng để hiện cảnh báo text
("hệ thống sẽ cần dùng thêm N vị trí khác") chứ không liệt kê cụ thể N vị trí đó là gì. Đây chính xác là
điều anh mô tả: "Đặt lịch, số lượng nhiều nên để nhiều lựa chọn chỗ nhập kho".

Ngược lại, phía Outbound (`computeOutboundSuggestion`, xem `OutboundSuggestionResult.pickingList: PickLine[]`)
**đã trả đủ danh sách nhiều vị trí/lô** — không cần sửa phần tính toán, chỉ cần lưu thêm vào
`ScheduleAllocation` cho nhất quán dữ liệu giữa 2 chiều nhập/xuất.

## 🧠 Giải thích Prisma cần biết
- `ScheduleAllocation` (Task 83) có `kind: SUGGESTED | ACTUAL`. Task này chỉ tạo record với `kind:
  'SUGGESTED'`, lưu tại thời điểm `createInboundSchedule`/`createOutboundSchedule` (tạo lịch), KHÔNG phải
  lúc thực hiện (đó là Task 99, `kind: 'ACTUAL'`).
- Dùng `tx.scheduleAllocation.createMany(...)` để insert hàng loạt trong cùng 1 lần, tránh N query rời rạc.
- Với Inbound, `batchId` chưa tồn tại lúc đặt lịch (Batch chỉ tạo khi Thực hiện) → để `null` trong
  `ScheduleAllocation.batchId` cho các record `kind: SUGGESTED` của Inbound.

## 📖 Các file cần đọc trước
- `apps/backend/src/schedules/schedules.service.ts` (toàn bộ hàm `computeInboundSuggestion`,
  `createInboundSchedule`, `computeOutboundSuggestion`, `createOutboundSchedule`, và interface
  `InboundSuggestionResult`)
- `apps/backend/src/common/services/fefo.service.ts` (type `PickLine` — cấu trúc dữ liệu 1 dòng pick)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/schedules/schedules.service.ts`:
  - Interface `InboundSuggestionResult`: thêm field `alternativeSlots: AlternativeSlot[]`
  - Hàm `computeInboundSuggestion`: build đủ danh sách `alternativeSlots` từ toàn bộ `allocations` (không
    chỉ `top`)
  - Hàm `createInboundSchedule`: sau khi tạo `Schedule`, insert `ScheduleAllocation` (kind `SUGGESTED`) cho
    từng phần tử `alternativeSlots`
  - Hàm `createOutboundSchedule`: sau khi tạo `Schedule`, insert `ScheduleAllocation` (kind `SUGGESTED`) cho
    từng phần tử `pickingList`

## 📂 File KHÔNG được sửa
- `SlotScoringService`, `FefoService` — không đổi cách TÍNH allocations/pickingList, chỉ đổi cách SỬ DỤNG
  kết quả đã tính sẵn
- `executeInboundSchedule`, `executeOutboundSchedule` (Task 99 phụ trách)

## 🔌 API cần dùng
- `POST /schedules/inbound/preview`, `POST /schedules/inbound` — response `suggestion` giờ có thêm field
  `alternativeSlots: [{ slotId, slotPath, allocateQty, score }]` (rỗng nếu chỉ cần 1 slot).
- `POST /schedules/outbound`, `POST /schedules/outbound/preview` — không đổi response (đã có `pickingList`
  từ trước), chỉ thêm việc lưu `ScheduleAllocation` phía sau hậu trường.

## 🪜 Các bước thực hiện
1. Thêm type mới trong `schedules.service.ts` (đặt cạnh `InboundSuggestionResult`):
   ```ts
   export interface AlternativeSlot {
     slotId: string;
     slotPath: string;
     allocateQty: number;
     score: number; // 0-100, cùng thang điểm với suggestion.score
   }
   ```
2. Trong interface `InboundSuggestionResult`, thêm field:
   ```ts
   alternativeSlots: AlternativeSlot[]; // Toàn bộ vị trí cần dùng khi splitRequired, kể cả vị trí chính (top)
   ```
3. Trong `computeInboundSuggestion`, sau khi có `allocations` (biến đã tồn tại), build danh sách đầy đủ —
   cần query chi tiết (`slotPath`) cho TỪNG slot trong `allocations`, không chỉ `top`:
   ```ts
   const slotIds = allocations.map((a) => a.slot.id);
   const slotDetails = await this.prisma.slot.findMany({
     where: { id: { in: slotIds } },
     include: { level: { include: { rack: { include: { zone: true } } } } },
   });
   const slotDetailMap = new Map(slotDetails.map((s) => [s.id, s]));

   const alternativeSlots: AlternativeSlot[] = allocations.map((a) => {
     const detail = slotDetailMap.get(a.slot.id)!;
     return {
       slotId: a.slot.id,
       slotPath: formatSlotLocation({
         zoneCode: detail.level.rack.zone.code,
         rackCode: detail.level.rack.code,
         levelNumber: detail.level.levelNumber,
         slotCode: detail.code,
       }),
       allocateQty: a.allocateQty,
       score: Math.round(a.score * 100),
     };
   });
   ```
   Thêm `alternativeSlots` vào object trả về cuối hàm (giữ nguyên toàn bộ field cũ khác).
4. Trong `createInboundSchedule`, sau khi tạo `schedule` thành công, insert allocation:
   ```ts
   if (suggestion.alternativeSlots.length > 0) {
     await this.prisma.scheduleAllocation.createMany({
       data: suggestion.alternativeSlots.map((s, idx) => ({
         scheduleId: schedule.id,
         kind: 'SUGGESTED' as const,
         slotId: s.slotId,
         batchId: null,
         quantity: s.allocateQty,
         sortOrder: idx,
       })),
     });
   }
   ```
5. Trong `createOutboundSchedule`, tìm đoạn tạo `schedule` (tương tự cấu trúc `createInboundSchedule`), sau
   khi tạo xong, insert allocation từ `suggestion.pickingList`:
   ```ts
   if (suggestion.pickingList.length > 0) {
     await this.prisma.scheduleAllocation.createMany({
       data: suggestion.pickingList.map((line, idx) => ({
         scheduleId: schedule.id,
         kind: 'SUGGESTED' as const,
         slotId: line.slotId,
         batchId: line.batchId,
         quantity: line.quantity,
         sortOrder: idx,
       })),
     });
   }
   ```
   (Kiểm tra đúng tên field trong `PickLine` — nếu khác `slotId`/`batchId`/`quantity`, dùng đúng tên thật
   trong `fefo.service.ts`, không đoán bừa.)
6. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
Xem đầy đủ ở mục "Các bước thực hiện".

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/98.txt`

## ✅ Checklist nghiệm thu
- ☐ `InboundSuggestionResult` có thêm `alternativeSlots: AlternativeSlot[]`, liệt kê ĐỦ mọi vị trí cần dùng
  (không chỉ 1)
- ☐ Trường hợp 1 slot đã đủ chứa (`splitRequired: false`) → `alternativeSlots` có đúng 1 phần tử (chính là
  vị trí chính), không rỗng
- ☐ Tạo lịch nhập/xuất → `ScheduleAllocation` (kind `SUGGESTED`) được insert đủ số dòng tương ứng
  `alternativeSlots`/`pickingList`
- ☐ Inbound: `batchId` của `ScheduleAllocation` (kind SUGGESTED) luôn `null` (vì batch chưa tồn tại)
- ☐ Không đổi response cũ nào khác ngoài việc THÊM field `alternativeSlots`
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Chỉ lưu `ScheduleAllocation` cho Inbound, quên Outbound** (hoặc ngược lại) → dữ liệu không đồng bộ giữa
  2 chiều, Task 100/111 sau này chỉ hiển thị đúng 1 chiều.
- **Query chi tiết slot bằng vòng lặp `for` gọi `findUnique` N lần** thay vì 1 lần `findMany({ where: { id:
  { in: slotIds } } })` → N+1 query, chậm khi số lượng lớn cần chia nhiều slot.
- **Đoán sai tên field trong `PickLine`** (vd viết `line.slot.id` thay vì `line.slotId`) — PHẢI mở
  `fefo.service.ts` đọc đúng type trước khi viết code, không suy đoán.

## 🔄 Cách test
1. Tạo 1 sản phẩm/kịch bản mà 1 slot không đủ chứa hết số lượng cần nhập (số lượng lớn, hoặc slot dung
   lượng nhỏ) — gọi preview, response phải có `alternativeSlots` với ≥ 2 phần tử, tổng `allocateQty` bằng
   đúng `quantity` yêu cầu.
2. Tạo lịch nhập với kịch bản trên, vào Prisma Studio kiểm tra bảng `schedule_allocations` — phải có đủ số
   dòng tương ứng, `kind = SUGGESTED`.
3. Lặp lại tương tự cho lịch xuất (outbound) chia nhiều batch/slot.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/schedules/schedules.service.ts
```

## 📝 Commit message
```
feat(schedules): expose full alternative slot list and persist SUGGESTED allocations
```

## 🔀 PR title
```
[Task 98] Return full multi-slot suggestion list and persist ScheduleAllocation
```

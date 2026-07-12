# Task 57 — Mở rộng `types.ts` cho Racking (Zone/Rack/Level/Slot)

**Nhóm:** G – Racking
**Thời lượng ước tính:** 1.5 giờ
**File:** apps/frontend/src/types.ts (sửa)
**Phụ thuộc:** Không có

## Bối cảnh

Backend có 4 module CRUD đầy đủ: `zones`, `racks`, `levels`, `slots` (đều yêu cầu đăng nhập, không có
`@Public()`). Cấu trúc phân cấp: Warehouse → Zone → Rack → Level → Slot. Đối chiếu field thật với
`apps/backend/src/{zones,racks,levels,slots}/dto/*.dto.ts` và `SUCCESS_EXAMPLES.{zone,rack,level,slot}`
trong `swagger-examples.ts` trước khi viết type — KHÔNG đoán field.


## Yêu cầu

1. Thêm `Zone = { id, warehouseId, code, createdAt, updatedAt }` (đối chiếu `CreateZoneDto`/`SUCCESS_EXAMPLES.zone`).
2. Thêm `Rack = { id, zoneId, code, createdAt, updatedAt }`.
3. Thêm `Level = { id, rackId, levelNumber, createdAt, updatedAt }`.
4. Thêm `Slot = { id, levelId, code, maxCapacity, usedCapacity, availableCapacity, occupancyRate, currentProductId: string | null, distanceToGate, outboundFrequencyScore, createdAt, updatedAt }` — chú ý: `usedCapacity`/`availableCapacity`/`occupancyRate`/`currentProductId` do BACKEND tự tính, KHÔNG có trong `CreateSlotDto`/`UpdateSlotDto` (chỉ dùng để hiển thị, không dùng để gửi lên khi tạo/sửa).
5. Thêm `CreateSlotPayload = { levelId, code, maxCapacity, distanceToGate }` và `UpdateSlotPayload = { code?, maxCapacity?, distanceToGate?, outboundFrequencyScore? }` — đúng theo `slot.dto.ts`, khác hẳn Zone/Rack/Level về field.
6. Thêm 3 cặp `Create*Payload`/`Update*Payload` còn lại cho Zone/Rack/Level (dựa theo `CreateXDto`/`UpdateXDto` thật, `Update*` các field đều optional).

## Không được làm

- Không tự thêm field không có trong DTO backend (vd. không tự bịa `name`, `description` nếu backend không có).
- Không gộp 4 entity thành 1 type chung `RackingItem` — giữ riêng biệt vì mỗi entity có field khác nhau và quan hệ cha-con rõ ràng.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Tất cả field đối chiếu đúng 100% với `apps/backend/src/{zones,racks,levels,slots}/dto/*.ts`.

## Cách tự kiểm tra

Mở lần lượt 4 file DTO backend, so từng field với type vừa viết — đây là task nền cho cả Stage 8 nên phải chính xác tuyệt đối.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/57.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

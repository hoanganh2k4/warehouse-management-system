# Task 61 — `slot.service.ts`: CRUD cho Slot (list/detail public, ghi cần đăng nhập)

**Nhóm:** G – Racking
**Thời lượng ước tính:** 2 giờ
**File:** apps/frontend/src/services/slot.service.ts (tạo mới)
**Phụ thuộc:** Task 57 (types), Task 06 (`api-client`)

## Bối cảnh

**Slot khác 3 entity còn lại theo 2 điểm quan trọng — đọc kỹ trước khi code:**
1. `GET /slots` và `GET /slots/:id` là **public** (`@Public()`), không cần đăng nhập — chỉ
   `POST`/`PUT`/`DELETE` mới cần Bearer token.
2. `GET /slots` **CÓ phân trang** (`SlotQueryDto`: `levelId?`, `warehouseId?`, `keyword?`, `page?`, `limit?`)
   và trả `{ items: Slot[], meta }`, khác hẳn Zone/Rack/Level (`GET` trả mảng thuần không phân trang).


## Yêu cầu

1. Export `slotService` với 5 hàm: `getAll(params: { levelId?: string; warehouseId?: string; keyword?: string; page?: number; limit?: number })`, `getById(id: string)`, `create(payload: CreateSlotPayload)`, `update(id: string, payload: UpdateSlotPayload)`, `remove(id: string)`.
2. `getAll` gọi `GET /slots` kèm `{ params }`, trả về `PaginatedResult<Slot>` (**có** `meta`, khác 3 service kia).
3. `getById` gọi `GET /slots/:id`.
4. `create` gọi `POST /slots`, `update` gọi `PUT /slots/:id`, `remove` gọi `DELETE /slots/:id`.

## Không được làm

- Không copy nguyên `zone.service.ts`/`rack.service.ts` rồi đổi tên — chữ ký `getAll` và kiểu trả về khác nhau, copy máy móc sẽ sai kiểu dữ liệu.
- Không gửi `usedCapacity`/`availableCapacity`/`occupancyRate`/`currentProductId` trong `create`/`update` — đây là field backend tự tính, gửi lên sẽ bị `class-validator` từ chối hoặc bị bỏ qua.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `getAll` trả đúng `{ items, meta }`, gọi được KHÔNG cần đăng nhập.
- [ ] `create`/`update`/`remove` gọi được khi đã đăng nhập, trả lỗi 401 khi chưa đăng nhập.
- [ ] `npx tsc --noEmit` không lỗi.

## Cách tự kiểm tra

Gọi `getAll` khi CHƯA đăng nhập để xác nhận vẫn thành công (public); gọi `create` khi CHƯA đăng nhập để xác nhận bị 401.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/61.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

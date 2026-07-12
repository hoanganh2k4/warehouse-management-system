# Task 58 — `zone.service.ts`: CRUD đầy đủ cho Zone

**Nhóm:** G – Racking
**Thời lượng ước tính:** 2 giờ
**File:** apps/frontend/src/services/zone.service.ts (tạo mới)
**Phụ thuộc:** Task 57 (types), Task 06 (`api-client`)

## Bối cảnh

Zone là cấp cao nhất trong hệ thống Racking, thuộc về 1 `warehouseId`. Toàn bộ endpoint `/zones` yêu cầu đăng nhập (không có `@Public()`).
Vì đây là entity đơn giản (không phân trang, không search phức tạp), gộp cả 5 hàm CRUD vào
1 task duy nhất thay vì tách nhỏ như Products, để tránh quá vụn.


## Yêu cầu

1. Export `zoneService` với 5 hàm: `getAll()`, `getById(id: string)`, `create(payload: CreateZonePayload)`, `update(id: string, payload: UpdateZonePayload)`, `remove(id: string)`.
2. `getAll` gọi `GET /zones`, trả về `Zone[]` (không có `meta` — endpoint này KHÔNG phân trang, khác Products/Inventory).
3. `getById` gọi `GET /zones/:id`.
4. `create` gọi `POST /zones`, `update` gọi `PUT /zones/:id`, `remove` gọi `DELETE /zones/:id`.

## Không được làm

- Không tự thêm `page`/`limit` vào `getAll` — backend endpoint này trả mảng thuần, không phân trang (khác với Products/Inventory/Transactions).
- Không gọi chéo sang service khác (vd. rack.service.ts không tự gọi zone.service.ts) — mỗi service độc lập, việc phối hợp để ở tầng component/hook.

## Kết quả kỳ vọng (Definition of Done)

- [ ] 5 hàm đều đúng method HTTP + endpoint như trên.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Gọi thử `getAll()` (đã đăng nhập) trả về mảng Zone thật.

## Cách tự kiểm tra

Đăng nhập, gọi thử cả 5 hàm trong console DevTools theo đúng thứ tự create → getById → update → getAll → remove, xác nhận dữ liệu nhất quán ở mỗi bước.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/58.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

# Task 60 — `level.service.ts`: CRUD đầy đủ cho Level

**Nhóm:** G – Racking
**Thời lượng ước tính:** 2 giờ
**File:** apps/frontend/src/services/level.service.ts (tạo mới)
**Phụ thuộc:** Task 57 (types), Task 06 (`api-client`)

## Bối cảnh

Level thuộc về 1 Rack (`rackId`). Toàn bộ endpoint `/levels` yêu cầu đăng nhập (không có `@Public()`).
Vì đây là entity đơn giản (không phân trang, không search phức tạp), gộp cả 5 hàm CRUD vào
1 task duy nhất thay vì tách nhỏ như Products, để tránh quá vụn.


## Yêu cầu

1. Export `levelService` với 5 hàm: `getAll(rackId?: string)`, `getById(id: string)`, `create(payload: CreateLevelPayload)`, `update(id: string, payload: UpdateLevelPayload)`, `remove(id: string)`.
2. `getAll` gọi `GET /levels`, trả về `Level[]` (không có `meta` — endpoint này KHÔNG phân trang, khác Products/Inventory).
3. `getById` gọi `GET /levels/:id`.
4. `create` gọi `POST /levels`, `update` gọi `PUT /levels/:id`, `remove` gọi `DELETE /levels/:id`.

## Không được làm

- Không tự thêm `page`/`limit` vào `getAll` — backend endpoint này trả mảng thuần, không phân trang (khác với Products/Inventory/Transactions).
- Không gọi chéo sang service khác (vd. rack.service.ts không tự gọi zone.service.ts) — mỗi service độc lập, việc phối hợp để ở tầng component/hook.

## Kết quả kỳ vọng (Definition of Done)

- [ ] 5 hàm đều đúng method HTTP + endpoint như trên.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Gọi thử `getAll()` (đã đăng nhập) trả về mảng Level thật.

## Cách tự kiểm tra

Đăng nhập, gọi thử cả 5 hàm trong console DevTools theo đúng thứ tự create → getById → update → getAll → remove, xác nhận dữ liệu nhất quán ở mỗi bước.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/60.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

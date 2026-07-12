# Task 59 — `rack.service.ts`: CRUD đầy đủ cho Rack

**Nhóm:** G – Racking
**Thời lượng ước tính:** 2 giờ
**File:** apps/frontend/src/services/rack.service.ts (tạo mới)
**Phụ thuộc:** Task 57 (types), Task 06 (`api-client`)

## Bối cảnh

Rack thuộc về 1 Zone (`zoneId`), danh sách có thể lọc theo `zoneId` (`GET /racks?zoneId=`). Toàn bộ endpoint `/racks` yêu cầu đăng nhập (không có `@Public()`).
Vì đây là entity đơn giản (không phân trang, không search phức tạp), gộp cả 5 hàm CRUD vào
1 task duy nhất thay vì tách nhỏ như Products, để tránh quá vụn.


## Yêu cầu

1. Export `rackService` với 5 hàm: `getAll(zoneId?: string)`, `getById(id: string)`, `create(payload: CreateRackPayload)`, `update(id: string, payload: UpdateRackPayload)`, `remove(id: string)`.
2. `getAll` gọi `GET /racks`, hỗ trợ filter `zoneId` qua query string, trả về `Rack[]` (không có `meta` — endpoint này KHÔNG phân trang, khác Products/Inventory).
3. `getById` gọi `GET /racks/:id`.
4. `create` gọi `POST /racks`, `update` gọi `PUT /racks/:id`, `remove` gọi `DELETE /racks/:id`.

## Không được làm

- Không tự thêm `page`/`limit` vào `getAll` — backend endpoint này trả mảng thuần, không phân trang (khác với Products/Inventory/Transactions).
- Không gọi chéo sang service khác (vd. rack.service.ts không tự gọi zone.service.ts) — mỗi service độc lập, việc phối hợp để ở tầng component/hook.

## Kết quả kỳ vọng (Definition of Done)

- [ ] 5 hàm đều đúng method HTTP + endpoint như trên.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Gọi thử `getAll()` (đã đăng nhập) trả về mảng Rack thật.

## Cách tự kiểm tra

Đăng nhập, gọi thử cả 5 hàm trong console DevTools theo đúng thứ tự create → getById → update → getAll → remove, xác nhận dữ liệu nhất quán ở mỗi bước.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/59.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

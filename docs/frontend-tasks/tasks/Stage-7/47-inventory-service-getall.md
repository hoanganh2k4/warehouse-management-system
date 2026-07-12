# Task 47 — `inventory.service.ts`: hàm `getInventory(params)`

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 1.5 giờ
**File:** apps/frontend/src/services/inventory.service.ts (tạo mới)
**Phụ thuộc:** Task 06 (`api-client`), Task 46 (types)

## Bối cảnh

`GET /inventory` là **public** (`@Public()` trong `InventoryController`) — không cần đăng nhập,
khác với `inbound`/`outbound` (2 task sau) là cần Bearer token.
Response: `{ items: InventoryItem[], meta: PaginationMeta }`.


## Yêu cầu

1. Tạo `inventory.service.ts`, export `inventoryService.getInventory(params: GetInventoryParams): Promise<PaginatedResult<InventoryItem>>`.
2. Gọi `GET /inventory` kèm `{ params }`.
3. Chỉ viết đúng 1 hàm này trong task — `getOne`, `inbound`, `outbound` thuộc các task khác.

## Không được làm

- Không thêm hàm `getInventoryById` (không cần cho task hiện tại, list là đủ).
- Không tự lọc/sort lại `items` ở frontend — để backend xử lý qua query param.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Gọi thử (không cần đăng nhập) `getInventory({ page: 1, limit: 20 })` trả về đúng hình dạng `{ items, meta }`.

## Cách tự kiểm tra

Backend chạy sẵn, gọi thử trong console DevTools không cần login, xác nhận vẫn thành công (public endpoint).

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/47.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

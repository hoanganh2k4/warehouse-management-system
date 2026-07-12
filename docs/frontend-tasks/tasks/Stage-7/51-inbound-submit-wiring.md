# Task 51 — `inventory.service.ts.inbound()` + wiring submit + toast lỗi 409

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 2 giờ
**Files liên quan:** 
- `apps/frontend/src/services/inventory.service.ts (sửa: thêm hàm `inbound`)`
- `apps/frontend/src/pages/inventory/InventoryInbound.tsx (tạo mới)`
- `apps/frontend/src/App.tsx (sửa: thêm route `inventory/inbound`, bọc `ProtectedRoute`)`
**Phụ thuộc:** Task 50 (`InboundForm`), Task 47 (file service đã tồn tại)

## Bối cảnh

`POST /inventory/inbound` yêu cầu đăng nhập. 2 lỗi nghiệp vụ có thể xảy ra (409 Conflict):
`noSlotAvailable` (không còn slot trống) và `insufficientCapacity` (slot không đủ sức chứa) —
xử lý giống Task 32 (error 409 toast của Product create) nhưng có 2 message khác nhau tuỳ trường hợp.


## Yêu cầu

1. Thêm `inbound(payload: InboundPayload): Promise<InboundResult>` vào `inventory.service.ts`, gọi `POST /inventory/inbound`.
2. Tạo trang `InventoryInbound.tsx`: render `InboundForm`, khi submit gọi `inventoryService.inbound`, thành công thì hiện Toast success + điều hướng về `/inventory`.
3. Bắt lỗi 409: hiện `Toast` với đúng `error.message` backend trả về (không tự chế message khác).
4. Thêm route `inventory/inbound` trong `App.tsx`, bọc trong `<ProtectedRoute />`.

## Không được làm

- Không tự sửa message lỗi 409 thành text khác — hiển thị nguyên `err.message` từ backend để đúng ngữ cảnh (no slot vs insufficient capacity).
- Không cho phép double-submit — disable nút khi đang gọi API (`submitting=true`).

## Kết quả kỳ vọng (Definition of Done)

- [ ] Nhập kho thành công → về `/inventory`, thấy Toast xác nhận, dữ liệu mới xuất hiện trong bảng.
- [ ] Thử nhập kho với `quantity` cực lớn (không đủ slot) → thấy đúng Toast lỗi 409 tương ứng.
- [ ] Chưa đăng nhập vào thẳng `/inventory/inbound` → bị redirect `/login`.

## Cách tự kiểm tra

Test cả 2 luồng: nhập kho hợp lệ (thành công) và nhập kho với số lượng vượt sức chứa slot (409).

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/51.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

# Task 53 — `inventory.service.ts.outbound()` + wiring submit + toast lỗi 409 (insufficientStock)

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 1.5 giờ
**Files liên quan:** 
- `apps/frontend/src/services/inventory.service.ts (sửa: thêm hàm `outbound`)`
- `apps/frontend/src/pages/inventory/InventoryOutbound.tsx (tạo mới)`
- `apps/frontend/src/App.tsx (sửa: thêm route `inventory/outbound`, bọc `ProtectedRoute`)`
**Phụ thuộc:** Task 52, Task 51 (làm theo đúng pattern đã dùng cho Inbound)

## Bối cảnh

Giống hệt pattern Task 51 nhưng cho luồng xuất kho; lỗi nghiệp vụ ở đây là `insufficientStock` (409).

## Yêu cầu

1. Thêm `outbound(payload: OutboundPayload): Promise<OutboundResult>` gọi `POST /inventory/outbound`.
2. Tạo `InventoryOutbound.tsx` render `OutboundForm`, thành công → Toast success + điều hướng `/inventory`.
3. Lỗi 409 (`insufficientStock`) → hiện `Toast` với `err.message` thật từ backend.
4. Thêm route `inventory/outbound`, bọc `ProtectedRoute`.

## Không được làm

- Không copy-paste rồi để sai tên route/service — kiểm tra kỹ `inbound` vs `outbound` không lẫn lộn.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Xuất kho thành công → về `/inventory`, thấy Toast xác nhận.
- [ ] Xuất kho vượt tồn kho thực tế → thấy đúng Toast lỗi `insufficientStock`.

## Cách tự kiểm tra

Test xuất kho với số lượng nhỏ hơn tồn (thành công) và số lượng vượt tồn kho hiện có (409).

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/53.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

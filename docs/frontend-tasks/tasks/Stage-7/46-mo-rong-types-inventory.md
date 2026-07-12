# Task 46 — Mở rộng `types.ts` cho Inventory

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 1 giờ
**File:** apps/frontend/src/types.ts (sửa)
**Phụ thuộc:** Không có (chỉ thêm type)

## Bối cảnh

Backend `InventoryQueryDto`/`InboundDto`/`OutboundDto` và response mẫu (`SUCCESS_EXAMPLES.inventory`,
`.inbound`, `.outbound`) đã cố định hình dạng dữ liệu. Task này chỉ thêm type, chưa gọi API.


## Yêu cầu

1. Thêm `InventoryItem = { id: string; batchId: string; slotId: string; quantity: number; updatedAt: string }`.
2. Thêm `GetInventoryParams = { warehouseId?: string; productId?: string; batchId?: string; slotId?: string; page?: number; limit?: number }`.
3. Thêm `InboundPayload = { productId: string; quantity: number; manufactureDate: string; expiryDate: string; note?: string }`.
4. Thêm `OutboundPayload = { productId: string; quantity: number; note?: string }`.
5. Thêm `InboundResult` phản ánh đúng response `{ batch: {...}, allocations: Array<{ slotId, slotCode, quantity, score }> }` (xem `SUCCESS_EXAMPLES.inbound` trong `apps/backend/src/common/swagger/swagger-examples.ts` để lấy chính xác field).

## Không được làm

- Không đổi tên field so với response backend thật (vd. không đổi `quantity` thành `qty`).
- Không xoá/sửa type `Product`, `Batch` đã có — chỉ thêm mới.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Tất cả field trong 4 type mới khớp 100% với response/DTO thật của backend (đối chiếu file swagger-examples.ts).

## Cách tự kiểm tra

Mở `apps/backend/src/common/swagger/swagger-examples.ts` và `apps/backend/src/inventory/dto/inventory.dto.ts`, đối chiếu từng field trước khi coi là xong.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/46.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

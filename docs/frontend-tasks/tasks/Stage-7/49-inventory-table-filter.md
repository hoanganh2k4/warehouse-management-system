# Task 49 — Bảng tồn kho + filter theo sản phẩm/kho + phân trang

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 2.5 giờ
**File:** apps/frontend/src/pages/inventory/InventoryList.tsx (sửa), apps/frontend/src/components/InventoryTable.tsx (tạo mới)
**Phụ thuộc:** Task 48

## Bối cảnh

Tương tự `ProductTable` + phần search/pagination của `ProductList` (Task 17/18), nhưng field hiển thị khác: không có tên sản phẩm trực tiếp trong `InventoryItem` (chỉ có `batchId`/`slotId`) — hiển thị ID rút gọn tạm thời, việc join tên sản phẩm/slot code đẹp hơn có thể để task cải tiến sau (ghi chú lại trong PR).

## Yêu cầu

1. Tạo `InventoryTable` nhận props `items: InventoryItem[]`, hiển thị cột: Batch ID (rút gọn 8 ký tự đầu), Slot ID (rút gọn), Số lượng (`quantity`), Cập nhật lúc (`updatedAt` format `dd/MM/yyyy HH:mm`).
2. Thêm ô input lọc theo `productId`/`warehouseId` (dạng text UUID tạm thời — dropdown chọn tên sẽ làm ở task cải tiến sau).
3. Thêm phân trang giống Products (nút Trước/Sau dựa vào `meta.page`/`meta.totalPages`).
4. Wiring `loading`/`error`/`empty state` giống Task 20/21/22 của Products (dùng lại `Toast` cho error nếu phù hợp).

## Không được làm

- Không tự bịa API join tên sản phẩm — nếu cần tên đẹp, phải note lại thành task backend riêng, không tự chế field không có thật.
- Không copy nguyên `ProductTable.tsx` rồi sửa tên biến — tạo component `InventoryTable` riêng, tránh phá `ProductTable` hiện tại.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Bảng render đúng dữ liệu thật từ `/inventory`.
- [ ] Phân trang hoạt động đúng (`meta.totalPages`).
- [ ] Trạng thái loading/error/empty đều có UI rõ ràng, không phải màn hình trắng.

## Cách tự kiểm tra

So dữ liệu bảng với response Swagger `/inventory`; thử filter với 1 `productId` thật lấy từ `/products`; thử trang không có data để kiểm tra empty state.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/49.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

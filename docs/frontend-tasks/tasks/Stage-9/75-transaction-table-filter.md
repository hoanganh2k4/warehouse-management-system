# Task 75 — Bảng giao dịch + filter (loại GD, khoảng ngày, sản phẩm) + phân trang

**Nhóm:** H – Transactions
**Thời lượng ước tính:** 2.5 giờ
**File:** apps/frontend/src/components/TransactionTable.tsx (tạo mới), apps/frontend/src/pages/transactions/TransactionList.tsx (sửa)
**Phụ thuộc:** Task 74

## Bối cảnh

Nhiều filter hơn Inventory — cần dropdown loại GD (IMPORT/EXPORT) + 2 date input (from/to) + dropdown sản phẩm.

## Yêu cầu

1. `TransactionTable` hiển thị cột: Loại (badge màu khác nhau IMPORT/EXPORT), Số lượng, Batch ID (rút gọn), Từ Slot/Đến Slot (rút gọn, hiện "—" nếu `null`), Ghi chú, Thời gian (`createdAt` format `dd/MM/yyyy HH:mm`).
2. Filter: dropdown `type` (Tất cả/IMPORT/EXPORT), 2 date input `from`/`to`, dropdown sản phẩm (tái dùng cách load danh sách sản phẩm như `InboundForm`).
3. Phân trang giống các module trước.
4. Loading/error/empty state đầy đủ.

## Không được làm

- Không tự dịch nhầm nghĩa IMPORT/EXPORT — IMPORT = Nhập kho, EXPORT = Xuất kho, giữ đúng nhãn tiếng Việt nhất quán với Inventory.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Bảng + filter hoạt động đúng với dữ liệu thật, phân trang đúng `meta.totalPages`.

## Cách tự kiểm tra

Thử filter riêng từng field (type, khoảng ngày, sản phẩm) và kết hợp nhiều filter cùng lúc, đối chiếu kết quả với Swagger.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-9/75.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

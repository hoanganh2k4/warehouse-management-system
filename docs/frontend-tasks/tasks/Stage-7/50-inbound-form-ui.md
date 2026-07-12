# Task 50 — UI form Nhập kho (`InboundForm`)

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 2 giờ
**File:** apps/frontend/src/components/InboundForm.tsx (tạo mới)
**Phụ thuộc:** Task 46 (types), Task 06 (đã có `productService.getProducts` để chọn sản phẩm)

## Bối cảnh

Form nhập kho cần chọn sản phẩm (dropdown, gọi `productService.getProducts` lấy danh sách), nhập số lượng, ngày sản xuất, hạn sử dụng, ghi chú. Đây là task write-data đầu tiên của Inventory nên **bắt buộc đăng nhập**.

## Yêu cầu

1. Tạo component `InboundForm` với props `onSubmit: (payload: InboundPayload) => void`, `submitting: boolean`.
2. Dropdown chọn sản phẩm: gọi `productService.getProducts({ page: 1, limit: 100 })` khi mount, hiển thị `skuCode — name`.
3. Input số: `quantity` (số nguyên dương, `min=1`).
4. 2 input date: `manufactureDate`, `expiryDate` — validate `expiryDate > manufactureDate` (chặn submit nếu sai, hiện lỗi inline).
5. Textarea `note` (optional).
6. Nút Submit disable khi `submitting=true` hoặc form chưa hợp lệ.

## Không được làm

- Không tự gọi API `inbound()` trong component này — component chỉ emit `onSubmit(payload)`, việc gọi API để Task 51.
- Không cho phép chọn `expiryDate` <= `manufactureDate` — phải chặn ở validate, không dựa vào backend trả lỗi.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Form hiển thị đúng danh sách sản phẩm thật trong dropdown.
- [ ] Validate ngày hoạt động đúng (thử nhập HSD trước NSX → báo lỗi ngay, không cho submit).
- [ ] `npx tsc --noEmit` không lỗi.

## Cách tự kiểm tra

Mở form, thử để trống các trường bắt buộc → nút Submit phải disable; nhập HSD < NSX → phải hiện lỗi ngay khi blur/change.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/50.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

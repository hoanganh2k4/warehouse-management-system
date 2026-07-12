# Task 52 — UI form Xuất kho (`OutboundForm`)

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 1.5 giờ
**File:** apps/frontend/src/components/OutboundForm.tsx (tạo mới)
**Phụ thuộc:** Task 46 (types)

## Bối cảnh

Đơn giản hơn `InboundForm` — không có ngày SX/HSD vì backend tự chọn lô theo FEFO (hết hạn trước xuất trước).

## Yêu cầu

1. Props: `onSubmit: (payload: OutboundPayload) => void`, `submitting: boolean`.
2. Dropdown chọn sản phẩm (tái sử dụng logic load danh sách sản phẩm giống `InboundForm`, tách thành hook/component dùng chung nếu thấy hợp lý, note lại trong PR nếu không kịp refactor).
3. Input `quantity` (số nguyên dương).
4. Textarea `note` (optional).

## Không được làm

- Không thêm field `manufactureDate`/`expiryDate` — xuất kho không cần, backend tự chọn lô theo FEFO.
- Không tự gọi API `outbound()` trong component này.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Form hiển thị đúng danh sách sản phẩm, validate `quantity >= 1`.
- [ ] `npx tsc --noEmit` không lỗi.

## Cách tự kiểm tra

Thử để trống `productId`/`quantity` → nút Submit disable.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/52.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

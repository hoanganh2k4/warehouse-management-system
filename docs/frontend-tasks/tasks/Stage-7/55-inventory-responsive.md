# Task 55 — Responsive + lint/build kiểm tra Inventory

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 1 giờ
**File:** CSS liên quan tới Inventory (tạo/sửa nếu cần)
**Phụ thuộc:** Task 49, 51, 53, 54

## Bối cảnh

Bước hoàn thiện cuối module Inventory, giống Task 39/40 của Products.

## Yêu cầu

1. Kiểm tra bảng tồn kho, 2 form Nhập/Xuất kho trên mobile (< 480px) — form input không tràn, bảng cuộn ngang được (`overflow-x: auto`).
2. Chạy `npm run lint` và `npm run build`, sửa hết lỗi/cảnh báo liên quan Inventory.

## Không được làm

- Không sửa CSS/layout của module Products khi đang làm task này.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npm run lint` sạch, `npm run build` thành công.
- [ ] Giao diện Inventory dùng được ở 375px và 1440px.

## Cách tự kiểm tra

DevTools responsive mode ở 375px/768px/1440px cho cả 3 trang: List, Inbound, Outbound.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/55.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

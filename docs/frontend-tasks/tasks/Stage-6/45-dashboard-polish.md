# Task 45 — Responsive + lint/build kiểm tra Dashboard

**Nhóm:** E – Dashboard
**Thời lượng ước tính:** 1 giờ
**File:** apps/frontend/src/pages/dashboard/Dashboard.css (tạo mới nếu cần), không sửa file logic
**Phụ thuộc:** Task 44

## Bối cảnh

Bước hoàn thiện cuối của module Dashboard, giống Task 39/40 đã làm cho Products.

## Yêu cầu

1. Kiểm tra layout StatCard trên mobile (< 480px): các thẻ phải xếp dọc (grid/flex-wrap), không tràn ngang.
2. Chạy `npm run lint` và `npm run build` ở `apps/frontend`, sửa hết lỗi/cảnh báo phát sinh từ code Dashboard.
3. Viết báo cáo ngắn (5-10 dòng) liệt kê các bước đã test thủ công (đăng nhập, xem số liệu, resize màn hình).

## Không được làm

- Không sửa CSS của các trang Products đã có — chỉ động vào phần CSS mới cho Dashboard.
- Không tắt rule lint bằng `eslint-disable` để né lỗi — phải sửa tận gốc.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npm run lint` sạch, `npm run build` thành công.
- [ ] Giao diện Dashboard không vỡ layout ở độ rộng 375px (iPhone SE) và 1440px (desktop).
- [ ] Báo cáo test thủ công đính kèm trong PR.

## Cách tự kiểm tra

Dùng DevTools responsive mode để thử các breakpoint 375px/768px/1440px; chạy `npm run lint && npm run build`.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-6/45.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

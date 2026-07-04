# Task 39 — Responsive (chỉ CSS)

**Nhóm:** G – Hoàn thiện
**Thời lượng ước tính:** 2 giờ
**File sửa:** `apps/frontend/src/App.css`
**Phụ thuộc bắt buộc:** Toàn bộ Nhóm A–F đã xong (task này chỉnh CSS cho tất cả các trang/element đã tồn tại)

## Bối cảnh

Đây là task **chỉ sửa CSS**, không sửa bất kỳ file `.tsx` nào, không đổi cấu trúc JSX/class name đã dùng ở các component. Mục tiêu: layout dùng được ở màn hình nhỏ (điện thoại, ~375px) và tablet (~768px), không chỉ desktop.

Các khu vực cần rà soát (đã được tạo qua các task trước, tất cả đều là CSS thuần, không đổi tên class):
- `app-shell` / `Sidebar` — hiện là layout 2 cột cố định (sidebar + main), trên mobile cần thu gọn hoặc ẩn/hiện được.
- `stat-row` (4 `StatCard`) — trên mobile nên xuống dòng (`flex-wrap` hoặc `grid` responsive) thay vì bị bó hẹp ngang.
- `product-table` (bảng sản phẩm, có thêm cột Actions từ Task 38) — bảng dễ bị tràn ngang trên màn hình hẹp, cần `overflow-x: auto` trên `.table-wrap` (kiểm tra xem đã có chưa, thêm nếu thiếu).
- Form (`ProductCreate.tsx`, `ProductEdit.tsx`) — `.form-group`, `.form-actions` cần full-width trên mobile.
- `ConfirmDialog` (`.dialog-box`) — cần giới hạn `max-width` nhưng co giãn theo màn hình nhỏ (`width: 90%` hoặc tương tự), không bị tràn màn hình.
- `Toast` — trên mobile nên full-width thay vì cố định width nhỏ ở góc, tránh che nội dung.
- Pagination controls (Task 18) — không bị vỡ dòng xấu trên mobile.

## Yêu cầu

1. Thêm media query breakpoint chuẩn, ví dụ:
   ```css
   @media (max-width: 768px) {
     /* tablet trở xuống */
   }

   @media (max-width: 480px) {
     /* mobile nhỏ */
   }
   ```
2. Với mỗi khu vực liệt kê ở trên, kiểm tra bằng DevTools responsive mode (Chrome: `Ctrl+Shift+M`) ở 3 mốc: 375px, 768px, 1280px — chỉnh CSS tới khi không có phần tử nào bị tràn ngang gây thanh cuộn ngang toàn trang (`overflow-x` trên `<body>`).
3. Với `Sidebar`, cách đơn giản nhất (không cần hamburger menu phức tạp — ngoài scope): thu nhỏ chiều rộng, hoặc chuyển thành thanh ngang phía trên (`flex-direction: row` với `flex-wrap: wrap`) ở breakpoint `max-width: 768px`. Chọn cách nào ít rủi ro nhất về mặt CSS, không cần đẹp hoàn hảo.
4. Không tự thêm class mới cho các component đã có sẵn nếu có thể dùng media query nhắm vào class hiện tại — chỉ thêm class mới khi thực sự không có cách nào khác diễn đạt bằng media query đơn thuần.

## Không được làm

- Không sửa bất kỳ file `.tsx` nào — nếu phát hiện cần thêm/đổi class name để làm responsive tốt hơn, dừng lại, ghi chú lại, báo anh Đăng (đổi class trong `.tsx` không thuộc "chỉ CSS" như mô tả task).
- Không cài thêm thư viện CSS framework (Tailwind, Bootstrap...) — dự án hiện dùng CSS thuần trong `App.css`.
- Không đổi màu sắc/typography tổng thể đã thống nhất — chỉ chỉnh layout/kích thước cho responsive, không redesign.
- Không thêm hamburger menu / JS toggle sidebar — nằm ngoài scope "chỉ CSS" (cần thêm state React).

## Kết quả kỳ vọng (Definition of Done)

- [ ] Ở 375px, 768px, 1280px: không có thanh cuộn ngang ở cấp `<body>` (trừ trường hợp cố ý cho bảng sản phẩm cuộn ngang trong `.table-wrap`, đó là chấp nhận được).
- [ ] Form Tạo/Sửa sản phẩm dùng được thoải mái trên mobile (input đủ rộng, không bị chữ tràn ra ngoài).
- [ ] `ConfirmDialog` và `Toast` hiển thị hợp lý trên mobile, không che hết màn hình cũng không bị cắt.
- [ ] Không có file `.tsx` nào bị sửa — kiểm tra `git status` chỉ thấy `App.css`.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-5/39.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

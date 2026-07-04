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

## Prompt AI (copy nguyên văn)

```
Tôi cần thêm responsive CSS vào file apps/frontend/src/App.css trong dự án React + TypeScript (dán toàn bộ nội dung file hiện tại vào đây):
[DÁN NỘI DUNG THẬT App.css VÀO ĐÂY]

Đây là toàn bộ các class hiện có liên quan đến layout (không đổi tên bất kỳ class nào): app-shell, sidebar (component Sidebar), app-main, stat-row, stat-card, panel, panel-header, table-wrap, product-table, form-group, form-actions, dialog-overlay, dialog-box, toast.

Yêu cầu: CHỈ thêm CSS (media query), KHÔNG đổi tên class nào đã có, KHÔNG được yêu cầu sửa bất kỳ file .tsx nào — nếu cảm thấy cần đổi class trong JSX để làm responsive tốt hơn, hãy nói rõ điều đó thay vì tự giả định class mới đã tồn tại trong JSX.

Thêm 2 breakpoint: @media (max-width: 768px) và @media (max-width: 480px). Trong đó:
1. Sidebar: chuyển layout từ cột dọc cố định sang dạng gọn hơn ở tablet/mobile (ví dụ giảm width, hoặc đổi flex-direction sang row với flex-wrap) — chọn cách đơn giản nhất, không cần hamburger menu (không có JS toggle).
2. stat-row: cho phép flex-wrap hoặc chuyển sang grid responsive để 4 StatCard không bị bó hẹp trên mobile.
3. table-wrap: đảm bảo có overflow-x: auto để bảng sản phẩm cuộn ngang được trên mobile thay vì làm vỡ layout trang.
4. form-group, form-actions: full-width trên mobile.
5. dialog-box: giới hạn max-width nhưng responsive (width: 90% trên mobile thay vì cố định px).
6. toast: full-width trên mobile (thay vì width cố định nhỏ ở góc màn hình).

Trả về toàn bộ nội dung file App.css sau khi thêm CSS responsive (giữ nguyên phần CSS gốc, chỉ bổ sung thêm).
```

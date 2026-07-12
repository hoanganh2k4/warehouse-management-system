# Task 44 — Route khung + UI trang Dashboard (StatCard)

**Nhóm:** E – Dashboard
**Thời lượng ước tính:** 2 giờ
**Files liên quan:** 
- `apps/frontend/src/pages/dashboard/Dashboard.tsx (tạo mới)`
- `apps/frontend/src/App.tsx (sửa: thêm route, bọc ProtectedRoute)`
- `apps/frontend/src/components/Sidebar.tsx (sửa: bỏ soon + active cho Dashboard)`
**Phụ thuộc:** Task 43 (`useDashboard`), component `StatCard.tsx` đã có sẵn (chưa dùng ở đâu)

## Bối cảnh

`StatCard` đã được tạo sẵn trong dự án (`components/StatCard.tsx`) nhưng chưa nơi nào import —
rõ ràng là để dành cho Dashboard. Vì endpoint yêu cầu đăng nhập, route `/dashboard`
**phải nằm trong `<ProtectedRoute />`**, khác với `/products` hiện tại đang public.


## Yêu cầu

1. Tạo `pages/dashboard/Dashboard.tsx`, dùng hook `useDashboard()`.
2. Hiển thị tối thiểu 6 `StatCard`: Sản phẩm (`products`), Lô hàng (`batches`), Tồn kho (`inventory`), Slot trống/tổng (`availableSlots`/`totalSlots`), Tỉ lệ lấp đầy (`occupancyPercent`%), Sắp hết hạn (`expiringSoon`).
3. Thêm route `path="dashboard"` trong `App.tsx`, đặt bên trong `<Route element={<ProtectedRoute />}>`.
4. Cập nhật `Sidebar.tsx`: xoá `soon: true` của mục Dashboard, dùng `<Link>` (hoặc `NavLink`) tới `/dashboard` thay vì `<button disabled>`, giữ style hiện tại.
5. Đổi `index` route trong `App.tsx` từ `Navigate to="/products"` sang `Navigate to="/dashboard"` (Dashboard là trang chủ hợp lý hơn) — **hỏi anh Đăng xác nhận trước khi đổi**, nếu không chắc thì giữ nguyên `/products`.

## Không được làm

- Không tự chuyển `Sidebar` sang dùng router cho TẤT CẢ mục (Inventory/Racking/Transactions/Team vẫn `soon` cho tới khi task tương ứng hoàn thành) — chỉ bỏ `soon` cho đúng mục Dashboard.
- Không hard-code số liệu mẫu — phải lấy từ `useDashboard()`.
- Không thêm biểu đồ/chart phức tạp (line chart, bar chart) — task này chỉ là StatCard, chart để task riêng nếu cần sau.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `/dashboard` render đúng 6 StatCard với số liệu thật từ API.
- [ ] Mục Dashboard trên Sidebar bấm được, điều hướng đúng, không còn nhãn `Soon`.
- [ ] Chưa đăng nhập mà vào thẳng `/dashboard` → bị redirect `/login` (nhờ `ProtectedRoute`).
- [ ] `npx tsc --noEmit` và `npm run build` không lỗi.

## Cách tự kiểm tra

Đăng nhập, vào `/dashboard`, so số liệu hiển thị với response Swagger `/dashboard/summary`. Sau đó đăng xuất (xoá token trong localStorage) và thử vào thẳng URL `/dashboard` để xác nhận redirect.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-6/44.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

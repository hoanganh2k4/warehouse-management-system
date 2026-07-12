# Task 62 — Route khung `/racking` + hiển thị danh sách Zone

**Nhóm:** G – Racking
**Thời lượng ước tính:** 2 giờ
**Files liên quan:** 
- `apps/frontend/src/pages/racking/RackingPage.tsx (tạo mới)`
- `apps/frontend/src/App.tsx (sửa: thêm route `racking`, bọc `ProtectedRoute`)`
- `apps/frontend/src/components/Sidebar.tsx (sửa: bỏ `soon` cho Racking)`
**Phụ thuộc:** Task 58 (`zone.service.ts`)

## Bối cảnh

Trang Racking dùng layout master-detail dạng cột: chọn Zone → hiện Rack → chọn Rack → hiện Level → chọn Level → hiện Slot (4 task tiếp theo mới thêm các cột Rack/Level/Slot). Task này chỉ dựng khung + cột Zone đầu tiên.

## Yêu cầu

1. Tạo `RackingPage.tsx`, gọi `zoneService.getAll()` khi mount, hiển thị danh sách Zone dạng list bấm chọn được (lưu `selectedZoneId` bằng `useState`).
2. Thêm route `path="racking"` trong `App.tsx`, bọc trong `<ProtectedRoute />` (toàn bộ module Racking cần đăng nhập).
3. Sidebar: bỏ `soon: true` cho mục Racking, chuyển sang `<Link to="/racking">`.
4. Xử lý loading/error cơ bản khi load danh sách Zone.

## Không được làm

- Không code cột Rack/Level/Slot trong task này — chỉ cột Zone, các task 63/64/65 mới thêm tiếp.
- Không quên bọc route trong `ProtectedRoute` — toàn bộ Racking API yêu cầu đăng nhập, khác Products/Inventory list.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `/racking` hiện danh sách Zone thật, bấm chọn được (có class `is-active` hoặc tương đương khi chọn).
- [ ] Chưa đăng nhập vào `/racking` → redirect `/login`.
- [ ] `npx tsc --noEmit` không lỗi.

## Cách tự kiểm tra

Đăng nhập, vào `/racking`, xác nhận danh sách Zone đúng với dữ liệu thật trong DB/Swagger.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-8/62.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

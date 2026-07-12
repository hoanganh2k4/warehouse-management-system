# Task 80 — Route khung `TeamList` + hook `useTeamMembers`

**Nhóm:** I – Team (Frontend)
**Thời lượng ước tính:** 1.5 giờ
**Files liên quan:** 
- `apps/frontend/src/hooks/useTeamMembers.ts (tạo mới)`
- `apps/frontend/src/pages/team/TeamList.tsx (tạo mới, khung)`
- `apps/frontend/src/App.tsx (sửa: thêm route `team`, bọc `ProtectedRoute`)`
- `apps/frontend/src/components/Sidebar.tsx (sửa: bỏ `soon` cho Team)`
**Phụ thuộc:** Task 79

## Bối cảnh

Giống pattern Task 74 (Transactions).

## Yêu cầu

1. Tạo hook `useTeamMembers(params)` — state `items`, `meta`, `loading`, `error`, `refetch`, không polling.
2. Tạo `TeamList.tsx` khung: tiêu đề "Nhân sự" + gọi hook.
3. Thêm route `team` trong `App.tsx`, bên trong `<ProtectedRoute />`.
4. Sidebar: bỏ `soon` cho Team, `<Link to="/team">`.

## Không được làm

- Không code bảng UI đầy đủ trong task này — Task 81 mới làm bảng.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Đăng nhập, vào `/team` thấy tiêu đề trang, không lỗi console.
- [ ] Chưa đăng nhập → redirect `/login`.

## Cách tự kiểm tra

Test cả 2 trạng thái đăng nhập / chưa đăng nhập, và test khi Task 77 backend CHƯA deploy (phải thấy lỗi rõ ràng, không phải màn hình trắng).

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-10/80.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

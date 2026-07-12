# Task 81 — Bảng nhân sự + loading/error/empty + responsive

**Nhóm:** I – Team (Frontend)
**Thời lượng ước tính:** 2 giờ
**File:** apps/frontend/src/components/TeamTable.tsx (tạo mới), apps/frontend/src/pages/team/TeamList.tsx (sửa)
**Phụ thuộc:** Task 80

## Bối cảnh

Task cuối module Team — gộp bảng + phân trang + responsive + lint/build vào 1 task vì scope nhỏ hơn hẳn Racking/Inventory (chỉ đọc, không có form).

## Yêu cầu

1. `TeamTable` hiển thị cột: Họ tên (`fullName`, fallback `username` nếu `fullName` null), Username, Email (fallback "—" nếu null), Vai trò (`role.name`), Ngày tham gia (`createdAt` format `dd/MM/yyyy`).
2. Phân trang giống các module trước.
3. Loading/error/empty state đầy đủ.
4. Bảng cuộn ngang được trên mobile (`overflow-x: auto`).
5. Chạy `npm run lint` và `npm run build`, sửa hết lỗi/cảnh báo liên quan Team.

## Không được làm

- Không hiển thị bất kỳ field nhạy cảm nào nếu backend lỡ trả về (double-check, không tự tin tuyệt đối vào Task 77).

## Kết quả kỳ vọng (Definition of Done)

- [ ] Bảng hiển thị đúng dữ liệu thật, phân trang đúng, responsive ở 375px/1440px.
- [ ] `npm run lint` sạch, `npm run build` thành công.

## Cách tự kiểm tra

Đăng nhập, vào `/team`, đối chiếu dữ liệu với Swagger `/users`; test responsive DevTools.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-10/81.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

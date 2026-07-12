# Task 79 — `user.service.ts`: hàm `getTeamMembers(params)`

**Nhóm:** I – Team (Frontend)
**Thời lượng ước tính:** 1 giờ
**File:** apps/frontend/src/services/user.service.ts (tạo mới)
**Phụ thuộc:** Task 78, Task 77 (API backend phải sẵn sàng)

## Bối cảnh

`GET /users` yêu cầu đăng nhập (theo thiết kế Task 77).

## Yêu cầu

1. Export `userService.getTeamMembers(params: GetTeamMembersParams): Promise<PaginatedResult<TeamMember>>`.
2. Gọi `GET /users` kèm `{ params }`.

## Không được làm

- Không thêm hàm create/update/delete — backend (Task 77) chưa hỗ trợ, đừng gọi endpoint không tồn tại.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Gọi thử (đã đăng nhập, sau khi Task 77 deploy) trả đúng `{ items, meta }`.

## Cách tự kiểm tra

Đăng nhập, gọi thử trong console DevTools sau khi xác nhận Task 77 đã chạy được trên backend dev.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-10/79.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

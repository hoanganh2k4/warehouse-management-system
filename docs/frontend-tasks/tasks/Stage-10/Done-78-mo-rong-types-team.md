# Task 78 — Mở rộng `types.ts` cho Team

**Nhóm:** I – Team (Frontend)
**Thời lượng ước tính:** 0.5 giờ
**File:** apps/frontend/src/types.ts (sửa)
**Phụ thuộc:** Task 77 (API `/users` phải tồn tại và có hình dạng response cố định trước khi làm task này)

## Bối cảnh

Type khớp với response `UserSummary` mà Task 77 vừa tạo ở backend.

## Yêu cầu

1. Thêm `TeamMember = { id: string; username: string; email: string | null; fullName: string | null; role: { id: string; name: string }; createdAt: string }`.
2. Thêm `GetTeamMembersParams = { page?: number; limit?: number }`.

## Không được làm

- Không thêm field `passwordHash` hay bất kỳ field nhạy cảm nào — API backend (Task 77) không trả field đó.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Field khớp đúng response thật của `GET /users` (đối chiếu Swagger sau khi Task 77 hoàn thành).

## Cách tự kiểm tra

Đối chiếu response Swagger `/users` sau khi backend deploy xong Task 77.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-10/78.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

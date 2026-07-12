# Task 77 — [BACKEND] Tạo `GET /users` — danh sách nhân viên

**Nhóm:** I – Team (Backend)
**Thời lượng ước tính:** 2 giờ
**Files liên quan:** 
- `apps/backend/src/users/users.module.ts (tạo mới)`
- `apps/backend/src/users/users.controller.ts (tạo mới)`
- `apps/backend/src/users/users.service.ts (tạo mới)`
- `apps/backend/src/users/dto/user-query.dto.ts (tạo mới)`
- `apps/backend/src/app.module.ts (sửa: import `UsersModule`)`
**Phụ thuộc:** Không có — đây là task backend độc lập, làm TRƯỚC các task frontend 78-81 của Team

## Bối cảnh

**Đây là task backend, giao cho người phụ trách backend (anh Đăng hoặc người có kinh nghiệm NestJS/Prisma),
không phải task frontend atomic như các task còn lại trong tài liệu này.** Model `User` đã tồn tại trong
Prisma schema (`id, username, email, fullName, roleId, role, createdAt, updatedAt, deletedAt`) nhưng
CHƯA có controller/service nào expose nó ra API — đây là điều kiện tiên quyết để làm giao diện Team.
Tham khảo cấu trúc module `products` (`ProductsModule`/`.controller`/`.service`) làm mẫu.


## Yêu cầu

1. Tạo `UsersModule` theo đúng cấu trúc NestJS hiện có (constructor injection `PrismaService`, giống `ProductsService`).
2. Endpoint `GET /users` — yêu cầu đăng nhập (không `@Public()`, phù hợp với việc đây là dữ liệu nội bộ nhân viên), hỗ trợ phân trang (`page`, `limit` giống `InventoryQueryDto`), trả `PaginatedResult`-style: `{ items: UserSummary[], meta: { page, limit, total, totalPages } }`.
3. `UserSummary` KHÔNG được lộ `passwordHash` — chỉ trả `id, username, email, fullName, role: { id, name }, createdAt`.
4. Chỉ lấy user có `deletedAt: null` (soft-delete convention giống `Product`).
5. Đăng ký `SUCCESS_EXAMPLES.userList` trong `swagger-examples.ts` và document Swagger đầy đủ giống các module khác (dùng `@ApiSuccessExample`, `@ApiAuthReadErrors`, `@ApiTags('Users')`).

## Không được làm

- TUYỆT ĐỐI không trả `passwordHash` ra API dưới bất kỳ hình thức nào — kể cả trong log hay error message.
- Không tạo thêm endpoint create/update/delete user trong task này — chỉ scope đọc danh sách (Team page hiện tại chỉ cần xem, chưa cần quản lý).

## Kết quả kỳ vọng (Definition of Done)

- [ ] `GET /users` (đã đăng nhập) trả đúng danh sách, không có `passwordHash`.
- [ ] Chưa đăng nhập gọi `/users` → 401.
- [ ] Swagger UI (`/api-docs`) hiển thị đầy đủ tag `Users` với ví dụ response.
- [ ] `npx tsc --noEmit` phía backend không lỗi, `npm run build` (backend) thành công.

## Cách tự kiểm tra

Gọi thử qua Swagger UI hoặc Postman với/không có token; kiểm tra kỹ response JSON không chứa `passwordHash`.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-10/77.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

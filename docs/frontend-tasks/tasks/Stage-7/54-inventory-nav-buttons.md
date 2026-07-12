# Task 54 — Thêm nút điều hướng Nhập kho / Xuất kho trên `InventoryList`

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 0.5 giờ
**File:** apps/frontend/src/pages/inventory/InventoryList.tsx (sửa)
**Phụ thuộc:** Task 51, Task 53

## Bối cảnh

Task nhỏ, chỉ nối UI — 2 route con đã hoạt động, còn thiếu lối vào từ trang danh sách.

## Yêu cầu

1. Thêm 2 nút/link trên đầu `InventoryList`: "Nhập kho" → `/inventory/inbound`, "Xuất kho" → `/inventory/outbound`.
2. Ẩn 2 nút này nếu người dùng chưa đăng nhập (dùng `useAuth().isAuthenticated()`), thay bằng gợi ý "Đăng nhập để nhập/xuất kho".

## Không được làm

- Không tự thêm quyền theo role (RBAC) — chỉ cần check đã đăng nhập hay chưa, đơn giản đúng scope task.

## Kết quả kỳ vọng (Definition of Done)

- [ ] 2 nút hiển thị đúng điều kiện đăng nhập, điều hướng đúng route.

## Cách tự kiểm tra

Đăng xuất → vào `/inventory` xác nhận thấy dòng gợi ý đăng nhập thay vì 2 nút; đăng nhập lại → thấy đủ 2 nút.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/54.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

# Task 48 — Route khung `InventoryList` + hook `useInventory`

**Nhóm:** F – Inventory
**Thời lượng ước tính:** 1.5 giờ
**Files liên quan:** 
- `apps/frontend/src/pages/inventory/InventoryList.tsx (tạo mới, chỉ khung rỗng)`
- `apps/frontend/src/hooks/useInventory.ts (tạo mới)`
- `apps/frontend/src/App.tsx (sửa: thêm route `inventory`)`
- `apps/frontend/src/components/Sidebar.tsx (sửa: bỏ `soon` cho Inventory)`
**Phụ thuộc:** Task 47

## Bối cảnh

Giống Task 23 (route khung ProductDetail) + Task 15 (useProducts) nhưng áp dụng cho Inventory. `/inventory` là route public (giống `/products`), KHÔNG cần bọc `ProtectedRoute`.

## Yêu cầu

1. Tạo hook `useInventory(params: GetInventoryParams)` — state `items`, `meta`, `loading`, `error`, `refetch`, cấu trúc y hệt `useProducts` (không cần polling).
2. Tạo `InventoryList.tsx` chỉ render tiêu đề "Tồn kho" + gọi hook (chưa cần bảng dữ liệu — Task 49 mới làm bảng).
3. Thêm route `path="inventory"` trong `App.tsx`, đặt NGANG HÀNG với `products` (ngoài `ProtectedRoute`).
4. Sidebar: bỏ `soon: true` cho mục Inventory, chuyển sang `<Link to="/inventory">`.

## Không được làm

- Không code UI bảng/filter trong task này — chỉ khung route + hook, để Task 49 xử lý UI.
- Không bọc `/inventory` trong `ProtectedRoute` — endpoint list là public.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Vào `/inventory` (không cần đăng nhập) thấy tiêu đề trang, không lỗi console.
- [ ] `npx tsc --noEmit` không lỗi.

## Cách tự kiểm tra

Vào thẳng `/inventory` khi chưa đăng nhập, xác nhận KHÔNG bị redirect `/login`.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-7/48.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

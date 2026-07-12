# Task 74 — Route khung `TransactionList` + hook `useTransactions`

**Nhóm:** H – Transactions
**Thời lượng ước tính:** 1.5 giờ
**Files liên quan:** 
- `apps/frontend/src/hooks/useTransactions.ts (tạo mới)`
- `apps/frontend/src/pages/transactions/TransactionList.tsx (tạo mới, khung)`
- `apps/frontend/src/App.tsx (sửa: thêm route `transactions`, bọc `ProtectedRoute`)`
- `apps/frontend/src/components/Sidebar.tsx (sửa: bỏ `soon` cho Transactions)`
**Phụ thuộc:** Task 73

## Bối cảnh

Giống pattern Task 48 (Inventory) nhưng route này PHẢI bọc `ProtectedRoute` vì endpoint yêu cầu đăng nhập.

## Yêu cầu

1. Tạo hook `useTransactions(params)` — state `items`, `meta`, `loading`, `error`, `refetch`, không polling.
2. Tạo `TransactionList.tsx` khung: tiêu đề "Lịch sử giao dịch" + gọi hook.
3. Thêm route `transactions` trong `App.tsx`, bên trong `<ProtectedRoute />`.
4. Sidebar: bỏ `soon` cho Transactions, `<Link to="/transactions">`.

## Không được làm

- Không code bảng/filter trong task này — Task 75 mới làm UI đầy đủ.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Đăng nhập, vào `/transactions` thấy tiêu đề trang, không lỗi console.
- [ ] Chưa đăng nhập vào `/transactions` → redirect `/login`.

## Cách tự kiểm tra

Test cả 2 trạng thái đăng nhập / chưa đăng nhập.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-9/74.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

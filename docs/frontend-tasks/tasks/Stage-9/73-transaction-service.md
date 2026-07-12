# Task 73 — `transaction.service.ts`: hàm `getTransactions(params)`

**Nhóm:** H – Transactions
**Thời lượng ước tính:** 1 giờ
**File:** apps/frontend/src/services/transaction.service.ts (tạo mới)
**Phụ thuộc:** Task 72, Task 06

## Bối cảnh

`GET /transactions` yêu cầu đăng nhập (không `@Public()`), khác Products/Inventory list.

## Yêu cầu

1. Export `transactionService.getTransactions(params: GetTransactionsParams): Promise<PaginatedResult<Transaction>>`.
2. Gọi `GET /transactions` kèm `{ params }`.

## Không được làm

- Không thêm hàm khác trong file này (không cần create/update/delete — Transactions chỉ đọc, được sinh ra tự động từ Inbound/Outbound).

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Gọi thử (đã đăng nhập) trả đúng hình dạng `{ items, meta }`.

## Cách tự kiểm tra

Đăng nhập, gọi thử trong console DevTools, đối chiếu với Swagger `/transactions`.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-9/73.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

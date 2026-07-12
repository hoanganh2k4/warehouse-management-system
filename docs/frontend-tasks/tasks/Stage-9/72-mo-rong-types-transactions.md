# Task 72 — Mở rộng `types.ts` cho Transactions

**Nhóm:** H – Transactions
**Thời lượng ước tính:** 1 giờ
**File:** apps/frontend/src/types.ts (sửa)
**Phụ thuộc:** Không có

## Bối cảnh

Đối chiếu `TransactionQueryDto` (`apps/backend/src/transactions/dto/transaction.dto.ts`) và
`SUCCESS_EXAMPLES.transactionList` — `GET /transactions` yêu cầu đăng nhập, trả `PaginatedResult<Transaction>`.


## Yêu cầu

1. Thêm `TransactionType = 'IMPORT' | 'EXPORT'` (enum thật từ Prisma — kiểm tra lại `generated/prisma/client` backend nếu có thêm giá trị khác ngoài 2 giá trị này, đừng giả định thiếu).
2. Thêm `Transaction = { id, type: TransactionType, quantity, batchId, slotToId, slotFromId, userId, note, createdAt }` (chú ý `slotToId`/`slotFromId`/`note` đều có thể `null`).
3. Thêm `GetTransactionsParams = { from?: string; to?: string; type?: TransactionType; productId?: string; warehouseId?: string; page?: number; limit?: number }`.

## Không được làm

- Không gộp `slotToId`/`slotFromId` thành 1 field — 2 chiều nhập/xuất dùng 2 field riêng theo đúng backend.

## Kết quả kỳ vọng (Definition of Done)

- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Field khớp 100% với DTO + response mẫu backend.

## Cách tự kiểm tra

Đối chiếu `transaction.dto.ts` và `SUCCESS_EXAMPLES.transactionList`.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-9/72.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

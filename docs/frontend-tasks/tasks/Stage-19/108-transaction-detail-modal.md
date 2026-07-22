# Task 108 [FRONTEND] — Modal "Chi tiết giao dịch" hiển thị tồn kho trước/sau

## 🎯 Mục tiêu
Thêm nút "Chi tiết" trên mỗi dòng ở `TransactionTable`, mở `TransactionDetailModal` (component mới) hiển
thị đầy đủ: tồn kho **trước/sau** giao dịch, số thứ tự trong ngày (`dailySeq`), và mã đơn (`orderCode` nếu
có) — dùng dữ liệu từ `GET /transactions/:id` (Task 91, backend).

**Điều kiện tiên quyết: Task 91 (backend, endpoint chi tiết + field before/after) và Task 92 (backend,
orderCode) đã merge.**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
`TransactionTable.tsx` hiện chỉ có các cột Loại/Sản phẩm/Số lượng/Mã lô/Từ vị trí/Đến vị trí/Ghi chú/Thời
gian — **không có cách nào xem "trước khi giao dịch có bao nhiêu, sau khi giao dịch còn bao nhiêu"**, và
hoàn toàn không có hành động "xem chi tiết" nào trên mỗi dòng (khác với `ScheduleTable` đã có sẵn
`onViewDetail`). Đây chính xác là điều anh mô tả: "Chưa có detail transaction: trước khi nhập/xuất trong kho
có bao nhiêu, sau khi nhập/xuất thay đổi như thế nào".

## 🧠 Giải thích React cần biết
- Theo đúng pattern đã có sẵn cho Schedule (`ScheduleTable` có prop `onViewDetail`, `TransactionList.tsx`
  quản lý state `detailSchedule`, mở `ScheduleDetailModal`) — áp dụng lại pattern y hệt cho Transaction, để
  đồng bộ trải nghiệm.
- Cần thêm `getTransactionById` vào `transaction.service.ts` (hiện chỉ có `getTransactions`), gọi
  `GET /transactions/:id`.

## 📖 Các file cần đọc trước
- `apps/frontend/src/components/TransactionTable.tsx` (toàn bộ)
- `apps/frontend/src/components/ScheduleDetailModal.tsx` (tham khảo cấu trúc modal chi tiết đã có)
- `apps/frontend/src/services/transaction.service.ts`
- `apps/frontend/src/pages/transactions/TransactionList.tsx` (đoạn quản lý `detailSchedule`/`ScheduleDetailModal`
  để copy đúng pattern cho Transaction)
- `apps/frontend/src/types.ts` (`type Transaction`)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/frontend/src/types.ts` (thêm field vào `Transaction`)
- Sửa: `apps/frontend/src/services/transaction.service.ts` (thêm `getTransactionById`)
- Sửa: `apps/frontend/src/components/TransactionTable.tsx` (thêm cột/nút "Chi tiết", prop `onViewDetail`)
- Tạo mới: `apps/frontend/src/components/TransactionDetailModal.tsx`
- Sửa: `apps/frontend/src/pages/transactions/TransactionList.tsx` (state `detailTransaction`, render modal
  mới)

## 📂 File KHÔNG được sửa
- `apps/frontend/src/components/ScheduleDetailModal.tsx`, `ScheduleTable.tsx` (chỉ tham khảo, không sửa)
- Backend — task này thuần frontend

## 🔌 API cần dùng
`GET /transactions/:id` (Task 91) — response có `quantityBefore`, `quantityAfter`, `dailySeq`, và (nếu Task
92 đã merge) thông tin liên quan tới `orderCode` qua schedule.

## 🪜 Các bước thực hiện
1. Trong `types.ts`, sửa `Transaction`, thêm field: `quantityBefore: number | null`,
   `quantityAfter: number | null`, `dailySeq: number | null`, `orderCode: string | null` (đặt trước
   `createdAt`).
2. Trong `transaction.service.ts`, thêm:
   ```ts
   getTransactionById(id: string): Promise<Transaction> {
     return apiClient.get(`/transactions/${id}`);
   },
   ```
3. Trong `TransactionTable.tsx`:
   - Thêm prop `onViewDetail: (transaction: Transaction) => void` vào `TransactionTableProps`.
   - Thêm cột `<th>Hành động</th>` cuối bảng (cả skeleton lẫn dữ liệu thật).
   - Thêm `<td><button type="button" className="btn-link" onClick={() => onViewDetail(item)}>Chi tiết</button></td>`
     ở mỗi dòng.
4. Tạo `TransactionDetailModal.tsx` (dựa theo cấu trúc `ScheduleDetailModal.tsx`):
   ```tsx
   import { useEffect, useState } from 'react';
   import type { Transaction } from '../types';
   import { transactionService } from '../services/transaction.service';

   type TransactionDetailModalProps = {
     transactionId: string;
     onClose: () => void;
   };

   export function TransactionDetailModal({ transactionId, onClose }: TransactionDetailModalProps) {
     const [detail, setDetail] = useState<Transaction | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
       let cancelled = false;
       setLoading(true);
       transactionService
         .getTransactionById(transactionId)
         .then((result) => { if (!cancelled) setDetail(result); })
         .catch(() => { if (!cancelled) setError('Không tải được chi tiết giao dịch.'); })
         .finally(() => { if (!cancelled) setLoading(false); });
       return () => { cancelled = true; };
     }, [transactionId]);

     return (
       <div className="dialog-overlay" onClick={onClose}>
         <div className="dialog-box dialog-box-wide" onClick={(e) => e.stopPropagation()}>
           <h3 className="dialog-title">Chi tiết giao dịch</h3>
           {loading && <p>Đang tải...</p>}
           {!loading && error && <p className="form-error">{error}</p>}
           {!loading && !error && detail && (
             <div className="schedule-detail-grid">
               <span className="schedule-detail-label">Mã đơn</span>
               <span>{detail.orderCode ?? '—'}</span>

               <span className="schedule-detail-label">Sản phẩm</span>
               <span>{detail.productSkuCode} — {detail.productName}</span>

               <span className="schedule-detail-label">Số lượng thay đổi</span>
               <span>{detail.quantity}</span>

               <span className="schedule-detail-label">Tồn kho trước</span>
               <span>{detail.quantityBefore ?? '—'}</span>

               <span className="schedule-detail-label">Tồn kho sau</span>
               <span>{detail.quantityAfter ?? '—'}</span>

               <span className="schedule-detail-label">Thứ tự trong ngày</span>
               <span>{detail.dailySeq ?? '—'}</span>
             </div>
           )}
           <div className="dialog-actions">
             <button type="button" className="btn-secondary" onClick={onClose}>Đóng</button>
           </div>
         </div>
       </div>
     );
   }
   ```
5. Trong `TransactionList.tsx`: thêm state `const [detailTransactionId, setDetailTransactionId] =
   useState<string | null>(null);`, truyền `onViewDetail={(t) => setDetailTransactionId(t.id)}` vào
   `<TransactionTable />`, render `{detailTransactionId && <TransactionDetailModal transactionId={detailTransactionId} onClose={() => setDetailTransactionId(null)} />}`
   ở cuối JSX (đặt cạnh `{detailSchedule && ...}` đã có).
6. Chạy `npm run build --workspace=frontend`.

## 💻 Ví dụ code
Xem đầy đủ ở mục "Các bước thực hiện".

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/108.txt`

## ✅ Checklist nghiệm thu
- ☐ Mỗi dòng trong bảng Lịch sử giao dịch có nút "Chi tiết"
- ☐ Bấm "Chi tiết" mở modal, hiển thị đúng tồn kho trước/sau, thứ tự trong ngày, mã đơn (nếu có)
- ☐ Đóng modal hoạt động đúng (click nút Đóng hoặc click ra ngoài overlay)
- ☐ Loading/error state hiển thị đúng khi đang tải/lỗi
- ☐ `npm run build --workspace=frontend` không lỗi

## ❌ Lỗi thường gặp
- **Quên `cancelled` flag trong `useEffect`** → nếu người dùng đóng modal rồi mở modal khác nhanh, response
  cũ có thể ghi đè state của modal mới (race condition).
- **Không xử lý `quantityBefore`/`quantityAfter` là `null`** (dữ liệu cũ trước khi có Task 91) → hiển thị
  "null" thô thay vì "—" thân thiện.

## 🔄 Cách test
1. `npm run dev --workspace=frontend`, vào tab "Lịch sử giao dịch".
2. Bấm "Chi tiết" ở 1 dòng bất kỳ — modal phải mở, hiển thị đủ thông tin.
3. Test với giao dịch tạo TRƯỚC khi có Task 91 (nếu có dữ liệu cũ) — `quantityBefore/After` phải hiện "—",
   không crash.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/types.ts apps/frontend/src/services/transaction.service.ts apps/frontend/src/components/TransactionTable.tsx apps/frontend/src/pages/transactions/TransactionList.tsx
rm apps/frontend/src/components/TransactionDetailModal.tsx
```

## 📝 Commit message
```
feat(transactions): add transaction detail modal showing before/after quantities
```

## 🔀 PR title
```
[Task 108] Add Transaction detail modal (before/after stock, order code)
```

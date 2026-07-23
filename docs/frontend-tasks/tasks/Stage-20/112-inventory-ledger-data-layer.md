# Task 112 [FRONTEND] — Tầng dữ liệu cho "Sổ biến động kho" (types, service, hook, table)

## 🎯 Mục tiêu
Tạo tầng dữ liệu (types, service, hook) và component bảng `InventoryLedgerTable` cho tính năng mới **"Sổ
biến động kho"** — đọc từ `GET /inventory/ledger` (Task 102, backend). Task này CHƯA gắn vào trang nào cả
(việc gắn UI/tab làm ở Task 113) — chỉ chuẩn bị đầy đủ tầng dữ liệu + component hiển thị độc lập, có thể
build/lint qua nhưng chưa render ra route nào.

**Điều kiện tiên quyết: Task 102 (backend, `GET /inventory/ledger`) và Task 103 (backend, sort ổn định cho
`GET /inventory`) đã merge.**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
Anh đã yêu cầu tách rõ 2 khái niệm (xem `README-stage-11-21.md`, vấn đề #11):
> "Inventory nên tách thành Inventory (biến động theo thời điểm) + Detail Inventory (chi tiết theo ngày,
> sắp theo thứ tự)"

Hiện `InventoryList.tsx` (trang `/inventory`) chỉ hiển thị **ảnh chụp tồn kho hiện tại** (đúng theo
`GET /inventory` cũ — sẽ đóng vai trò "Detail Inventory", đã sort ổn định ở Task 103) — **hoàn toàn chưa có
UI nào** hiển thị dữ liệu biến động theo thời gian (`GET /inventory/ledger`, Task 102). Task này bù đắp phần
còn thiếu: tầng dữ liệu + bảng hiển thị cho "Sổ biến động kho", theo đúng pattern đã dùng cho
`Transaction`/`TransactionTable` (`useTransactions` + `transactionService.getTransactions` +
`TransactionTable.tsx`).

## 🧠 Giải thích React/TypeScript cần biết
- Copy đúng pattern 3 lớp đã có: `types.ts` (type dữ liệu + type params) → `services/inventory.service.ts`
  (thêm method `getLedger`) → `hooks/useInventoryLedger.ts` (fetch + loading/error/refetch, giống hệt cấu
  trúc `useTransactions.ts`).
- `InventoryLedgerTable.tsx` copy cấu trúc/CSS class từ `TransactionTable.tsx` (bảng `product-table`, badge
  loại giao dịch `badge badge-success`/`badge badge-danger`, skeleton loading) — thêm 1 điểm khác biệt:
  cột "Thay đổi" (`changeQuantity`) phải tô màu xanh khi dương (`+50`), đỏ khi âm (`-30`), dùng class có sẵn
  `text-success`/`text-danger` nếu tồn tại trong `App.css`, không có thì tạo class mới tối giản
  `.ledger-change-positive { color: var(--color-success, #16a34a); }` /
  `.ledger-change-negative { color: var(--color-danger, #dc2626); }` trong `App.css` (kiểm tra biến CSS đã
  dùng trong file trước khi thêm, giữ đúng convention màu sắc hiện có).

## 📖 Các file cần đọc trước
- `apps/frontend/src/types.ts` (đoạn `Transaction`, `GetTransactionsParams`, `InventoryItem`,
  `GetInventoryParams`)
- `apps/frontend/src/services/transaction.service.ts`, `apps/frontend/src/services/inventory.service.ts`
- `apps/frontend/src/hooks/useTransactions.ts`
- `apps/frontend/src/components/TransactionTable.tsx` (toàn bộ — copy cấu trúc bảng, badge, skeleton,
  `formatDateTime`)
- `apps/frontend/src/App.css` (tìm biến màu `--color-success`/`--color-danger` hoặc class tương đương đã
  dùng cho badge)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/frontend/src/types.ts` (thêm `InventoryLedgerItem`, `GetInventoryLedgerParams`)
- Sửa: `apps/frontend/src/services/inventory.service.ts` (thêm `getLedger`)
- Tạo mới: `apps/frontend/src/hooks/useInventoryLedger.ts`
- Tạo mới: `apps/frontend/src/components/InventoryLedgerTable.tsx`
- Sửa: `apps/frontend/src/App.css` (chỉ thêm class màu cho cột "Thay đổi", nếu chưa có sẵn class phù hợp)

## 📂 File KHÔNG được sửa
- `apps/frontend/src/pages/inventory/InventoryList.tsx` (chưa gắn UI ở task này — làm ở Task 113)
- `apps/frontend/src/App.tsx`, `apps/frontend/src/components/Sidebar.tsx` (không thêm route/nav ở task này)
- `apps/frontend/src/components/TransactionTable.tsx`, `hooks/useTransactions.ts` (chỉ tham khảo, không sửa)

## 🔌 API cần dùng
`GET /inventory/ledger?productId=&slotId=&from=&to=&page=&limit=` (Task 102) — response mẫu:
```json
{
  "items": [
    {
      "transactionId": "uuid",
      "occurredAt": "2026-07-22T08:30:00.000Z",
      "type": "IMPORT",
      "productSkuCode": "SKU001",
      "productName": "Sữa tươi 1L",
      "slotPath": "A-01-02-05",
      "changeQuantity": 50,
      "balanceBefore": 100,
      "balanceAfter": 150,
      "dailySeq": 3,
      "orderCode": "SCH-20260722-0004"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

## 🪜 Các bước thực hiện
1. Trong `types.ts`, thêm (đặt sau `GetTransactionsParams`):
   ```ts
   export type InventoryLedgerItem = {
     transactionId: string;
     occurredAt: string;
     type: TransactionType;
     productSkuCode: string;
     productName: string;
     slotPath: string | null;
     changeQuantity: number;
     balanceBefore: number;
     balanceAfter: number;
     dailySeq: number;
     orderCode: string | null;
   };

   export type GetInventoryLedgerParams = {
     productId?: string;
     slotId?: string;
     from?: string;
     to?: string;
     page?: number;
     limit?: number;
   };
   ```
2. Trong `services/inventory.service.ts`, thêm method:
   ```ts
   getLedger(params: GetInventoryLedgerParams): Promise<PaginatedResult<InventoryLedgerItem>> {
     return apiClient.get('/inventory/ledger', { params });
   },
   ```
   (nhớ thêm `InventoryLedgerItem`, `GetInventoryLedgerParams` vào import `type` ở đầu file.)
3. Tạo `hooks/useInventoryLedger.ts`, copy nguyên cấu trúc `useTransactions.ts`, đổi tên state/hàm và gọi
   `inventoryService.getLedger` thay vì `transactionService.getTransactions`, dependency array của
   `useEffect` đổi thành `[params.productId, params.slotId, params.from, params.to, params.page,
   params.limit, reloadToken]`.
4. Tạo `components/InventoryLedgerTable.tsx`, copy cấu trúc `TransactionTable.tsx` (skeleton + bảng thật),
   với các cột: Thời gian (`occurredAt`, dùng lại hàm `formatDateTime` — copy nguyên hàm này vào file mới,
   không import chéo từ `TransactionTable.tsx`), Loại (badge, tái dùng logic `typeLabel`/`typeBadgeClass`),
   Sản phẩm (`productSkuCode` — `productName`), Vị trí (`slotPath ?? '—'`), Thay đổi (`changeQuantity`,
   hiển thị `+50`/`-30` kèm class màu — số dương thêm dấu `+` thủ công vì JS không tự thêm), Tồn trước
   (`balanceBefore`), Tồn sau (`balanceAfter`), STT ngày (`dailySeq`), Mã đơn (`orderCode ?? '—'`).
   Props: `{ items: InventoryLedgerItem[]; totalCount: number; loading: boolean; error: string | null }`
   (đúng convention props của `TransactionTable`/`InventoryTable`).
5. Nếu `App.css` chưa có class màu phù hợp, thêm 2 class tối giản cạnh các class `badge-*` hiện có:
   ```css
   .ledger-change-positive { color: #16a34a; font-weight: 600; }
   .ledger-change-negative { color: #dc2626; font-weight: 600; }
   ```
6. Chạy `npm run lint --workspace=frontend` và `npm run build --workspace=frontend`.

## 💻 Ví dụ code
Cột "Thay đổi" trong `InventoryLedgerTable.tsx`:
```tsx
<td>
  <span className={item.changeQuantity >= 0 ? 'ledger-change-positive' : 'ledger-change-negative'}>
    {item.changeQuantity >= 0 ? `+${item.changeQuantity}` : item.changeQuantity}
  </span>
</td>
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/112.txt`

## ✅ Checklist nghiệm thu
- ☐ `types.ts` có `InventoryLedgerItem`, `GetInventoryLedgerParams`
- ☐ `inventoryService.getLedger` gọi đúng `GET /inventory/ledger` với query params
- ☐ `useInventoryLedger` trả về `{ items, meta, loading, error, refetch }`, refetch hoạt động đúng
- ☐ `InventoryLedgerTable` render đủ 8 cột, có skeleton loading, có state rỗng/lỗi giống `TransactionTable`
- ☐ Cột "Thay đổi" tô màu đúng: xanh khi dương (có dấu `+`), đỏ khi âm
- ☐ Component/hook mới KHÔNG được import hoặc gắn vào bất kỳ trang/route nào ở task này
- ☐ `npm run lint --workspace=frontend` và `npm run build --workspace=frontend` không lỗi

## ❌ Lỗi thường gặp
- **Gắn luôn `InventoryLedgerTable` vào `InventoryList.tsx` hoặc thêm route mới** — task này CHỈ chuẩn bị
  tầng dữ liệu/component, việc gắn UI (tab, filter, route) thuộc Task 113, làm trước sẽ đụng file mà Task
  113 cần sửa theo cách khác.
- **Quên dấu `+` cho số dương** — `changeQuantity` dương JS hiển thị mặc định không có dấu `+` (`50` chứ
  không phải `+50`), phải tự thêm bằng template string.
- **Copy nhầm `orderBy`/sort logic vào hook** — sort đã được backend xử lý (Task 102), hook chỉ cần fetch và
  giữ nguyên thứ tự response trả về, không tự sort lại ở frontend.

## 🔄 Cách test
1. `npm run build --workspace=frontend` — đảm bảo không lỗi type dù chưa có trang nào dùng.
2. Có thể viết tạm 1 trang test cục bộ (không commit) để render `<InventoryLedgerTable />` với dữ liệu giả,
   kiểm tra hiển thị đúng màu sắc cột "Thay đổi" trước khi làm Task 113.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/types.ts apps/frontend/src/services/inventory.service.ts apps/frontend/src/App.css
rm apps/frontend/src/hooks/useInventoryLedger.ts apps/frontend/src/components/InventoryLedgerTable.tsx
```

## 📝 Commit message
```
feat(inventory): add data layer + table for Inventory Ledger (types, service, hook, component)
```

## 🔀 PR title
```
[Task 112] Inventory Ledger data layer (types, service, hook, InventoryLedgerTable)
```
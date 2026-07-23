# Task 113 [FRONTEND] — Gắn 2 tab "Chi tiết tồn kho" / "Sổ biến động kho" vào trang `/inventory`

## 🎯 Mục tiêu
Cập nhật trang `/inventory` (`InventoryList.tsx`) thành 2 tab, theo đúng pattern `tab-nav` đã dùng ở
`TransactionList.tsx` (tab "Lịch sử giao dịch" / "Lịch nhập / xuất"):
- Tab **"Chi tiết tồn kho"** (Detail Inventory) — chính là bảng cũ, dùng `GET /inventory` (đã sort ổn định ở
  Task 103), giữ nguyên hành vi hiện có.
- Tab **"Sổ biến động kho"** (Inventory Ledger) — bảng mới `InventoryLedgerTable` + hook `useInventoryLedger`
  (Task 112), có bộ lọc sản phẩm/vị trí/khoảng thời gian.

**Điều kiện tiên quyết: Task 112 (tầng dữ liệu Ledger) đã merge.**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
Theo đúng định nghĩa lại của anh (vấn đề #11, #12 trong `README-stage-11-21.md`) và cách backend đã tách ở
Stage 17: `GET /inventory` = "Detail Inventory" (chi tiết tồn kho hiện tại theo từng batch/slot), `GET
/inventory/ledger` = "Inventory" (biến động theo thời điểm). Trang `/inventory` hiện tại (`InventoryList.tsx`)
chỉ có 1 bảng duy nhất, tiêu đề chung chung "Tồn kho" — không phân biệt 2 khái niệm, gây nhầm lẫn đúng như
anh mô tả. Task này áp dụng lại UI pattern tab đã có sẵn cho Transaction (đã quen thuộc với người dùng cuối)
để tách rõ 2 khái niệm trên cùng 1 route, tránh phải thêm route/menu mới không cần thiết.

## 🧠 Giải thích React cần biết
- Copy đúng cấu trúc state 2-tab của `TransactionList.tsx`: 1 state `activeTab: 'detail' | 'ledger'`, mỗi
  tab có state filter/page riêng, gọi hook tương ứng (`useInventory` cho tab "Chi tiết tồn kho" — giữ
  nguyên, `useInventoryLedger` cho tab "Sổ biến động kho" — mới), render có điều kiện theo `activeTab`.
- Bộ lọc tab Ledger: tái sử dụng `filter-field`/`filter-input`/`sort-select` class đã có (giống bộ lọc
  `TransactionList.tsx` cho `from`/`to`), thêm dropdown chọn sản phẩm (copy cách `TransactionList.tsx` tải
  danh sách `productService.getProducts({ page: 1, limit: 100 })` vào state rồi render `<option>`).
- KHÔNG cần gọi `productService` lại nếu tách hook dùng chung — nhưng vì `InventoryList.tsx` hiện chưa có
  danh sách sản phẩm nào cả, phải thêm `useEffect` tải sản phẩm y hệt đoạn đã có trong
  `TransactionList.tsx` (copy đúng đoạn, không tự viết lại logic khác).

## 📖 Các file cần đọc trước
- `apps/frontend/src/pages/inventory/InventoryList.tsx` (toàn bộ — file chính sẽ sửa)
- `apps/frontend/src/pages/transactions/TransactionList.tsx` (toàn bộ — tham khảo pattern 2-tab, bộ lọc
  ngày, tải danh sách sản phẩm)
- `apps/frontend/src/components/InventoryLedgerTable.tsx`, `apps/frontend/src/hooks/useInventoryLedger.ts`
  (từ Task 112)
- `apps/frontend/src/hooks/useInventory.ts`, `apps/frontend/src/components/InventoryTable.tsx` (giữ nguyên,
  chỉ tham khảo cách đang dùng trong `InventoryList.tsx`)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/frontend/src/pages/inventory/InventoryList.tsx` (thêm tab, filter cho Ledger, đổi tiêu đề mô tả)

## 📂 File KHÔNG được sửa
- `apps/frontend/src/components/InventoryLedgerTable.tsx`, `apps/frontend/src/hooks/useInventoryLedger.ts`,
  `apps/frontend/src/services/inventory.service.ts`, `apps/frontend/src/types.ts` (đã hoàn thiện ở Task 112,
  không sửa lại trừ khi phát hiện lỗi thật sự — nếu có, ghi rõ lý do trong PR)
- `apps/frontend/src/App.tsx`, `apps/frontend/src/components/Sidebar.tsx` (không đổi route/nav — vẫn dùng
  chung route `/inventory` hiện có, không cần route mới)
- `apps/frontend/src/pages/inventory/InventoryInbound.tsx`, `InventoryOutbound.tsx` (không liên quan)

## 🔌 API cần dùng
- `GET /inventory` (đã dùng sẵn qua `useInventory`, không đổi)
- `GET /inventory/ledger` (qua `useInventoryLedger`, Task 112)
- `GET /products?page=1&limit=100` (qua `productService.getProducts`, để đổ dropdown lọc sản phẩm cho tab
  Ledger — copy đúng cách `TransactionList.tsx` đang làm)

## 🪜 Các bước thực hiện
1. Trong `InventoryList.tsx`, đổi `<h1>Tồn kho</h1>` → `<h1>Tồn kho</h1>` giữ nguyên ở mức trang, nhưng thêm
   `<nav className="tab-nav" aria-label="Chuyển đổi giữa chi tiết tồn kho và sổ biến động kho">` (copy y hệt
   cấu trúc `tab-nav`/`tab-button` trong `TransactionList.tsx`) với 2 nút: "Chi tiết tồn kho" (`activeTab ===
   'detail'`), "Sổ biến động kho" (`activeTab === 'ledger'`).
2. Thêm state: `const [activeTab, setActiveTab] = useState<'detail' | 'ledger'>('detail');`.
3. Thêm state filter riêng cho tab Ledger: `ledgerProductIdFilter`, `ledgerFromFilter`, `ledgerToFilter`,
   `ledgerPage` (tách biệt hoàn toàn với state filter `sku`/`zone`/`page` của tab "Chi tiết tồn kho" — không
   dùng chung để tránh 2 tab ghi đè filter của nhau khi chuyển qua lại).
4. Thêm `useEffect` tải `products` (copy nguyên đoạn từ `TransactionList.tsx`, dùng `productService`, import
   thêm `Product` type và `productService`).
5. Gọi hook mới:
   ```ts
   const {
     items: ledgerItems,
     meta: ledgerMeta,
     loading: ledgerLoading,
     error: ledgerError,
   } = useInventoryLedger({
     page: ledgerPage,
     limit: 20,
     productId: ledgerProductIdFilter || undefined,
     from: ledgerFromFilter || undefined,
     to: ledgerToFilter || undefined,
   });
   ```
6. Bọc bảng "Chi tiết tồn kho" hiện có (đoạn `<section className="panel">...<InventoryTable ... /></section>`
   và phân trang đi kèm) trong `{activeTab === 'detail' && (...)}`.
7. Thêm khối mới `{activeTab === 'ledger' && (...)}` — cấu trúc `<section className="panel">` tương tự, có
   `<div className="panel-header"><h2>Sổ biến động kho</h2>...</div>`, bộ lọc (dropdown sản phẩm + 2 input
   ngày `from`/`to`, copy đúng JSX từ `TransactionList.tsx`, đặt trong `page-header-controls` HOẶC 1 hàng
   filter riêng trong panel body — chọn theo cách nào khớp CSS sẵn có hơn, ưu tiên đặt trong
   `page-header-controls` giống Transaction để đồng bộ vị trí filter giữa 2 trang), `<InventoryLedgerTable
   items={ledgerItems} totalCount={ledgerMeta?.total ?? 0} loading={ledgerLoading} error={ledgerError} />`,
   và khối `pagination-controls` dùng `ledgerPage`/`ledgerMeta`.
8. Cập nhật `<p className="page-desc">` ở đầu trang để mô tả rõ cả 2 khái niệm, ví dụ: "Chi tiết tồn kho
   hiện tại theo lô hàng/vị trí, và sổ biến động nhập/xuất theo thời gian."
9. Đảm bảo nút "Nhập kho"/"Xuất kho" (`Link` hiện có) vẫn hiển thị ở `page-header-controls` chung, không phụ
   thuộc `activeTab` (giữ nguyên hành vi hiện tại — luôn hiển thị bất kể đang ở tab nào).
10. Chạy `npm run lint --workspace=frontend` và `npm run build --workspace=frontend`.

## 💻 Ví dụ code
Khối tab-nav (đặt sau `page-header`, trước `section.panel`):
```tsx
<nav className="tab-nav" aria-label="Chuyển đổi giữa chi tiết tồn kho và sổ biến động kho">
  <button
    type="button"
    className={`tab-button ${activeTab === 'detail' ? 'active' : ''}`}
    onClick={() => setActiveTab('detail')}
  >
    Chi tiết tồn kho
  </button>
  <button
    type="button"
    className={`tab-button ${activeTab === 'ledger' ? 'active' : ''}`}
    onClick={() => setActiveTab('ledger')}
  >
    Sổ biến động kho
  </button>
</nav>
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/113.txt`

## ✅ Checklist nghiệm thu
- ☐ Trang `/inventory` có 2 tab: "Chi tiết tồn kho" (mặc định) và "Sổ biến động kho"
- ☐ Tab "Chi tiết tồn kho" giữ nguyên hành vi cũ (filter sku/zone, phân trang, bảng `InventoryTable`)
- ☐ Tab "Sổ biến động kho" hiển thị `InventoryLedgerTable`, lọc được theo sản phẩm/khoảng thời gian, phân
  trang riêng biệt với tab kia
- ☐ Chuyển qua lại 2 tab không làm mất/ghi đè filter đã nhập ở tab còn lại
- ☐ Nút "Nhập kho"/"Xuất kho" vẫn hiển thị đúng như cũ (theo trạng thái đăng nhập), không phụ thuộc tab đang
  chọn
- ☐ Không thêm route mới, không sửa `App.tsx`/`Sidebar.tsx`
- ☐ `npm run lint --workspace=frontend` và `npm run build --workspace=frontend` không lỗi

## ❌ Lỗi thường gặp
- **Dùng chung 1 state `page` cho cả 2 tab** — chuyển tab rồi quay lại sẽ bị nhảy trang sai, hoặc filter tab
  này áp dụng nhầm sang tab kia. Bắt buộc tách state riêng theo đúng bước 3.
- **Gọi `useInventoryLedger` ngay cả khi `activeTab === 'detail'`** — không sai về mặt kỹ thuật (hook vẫn
  chạy được) nhưng gây gọi API thừa mỗi lần đổi filter dù đang không xem tab đó; nếu muốn tối ưu có thể tham
  khảo cách `useSchedules` nhận thêm tham số `enabled` (xem `TransactionList.tsx` dùng `activeTab ===
  'schedule'` làm điều kiện `enabled`) — không bắt buộc phải làm nếu Task 112 chưa hỗ trợ `enabled`, nhưng
  nên ghi chú lại trong PR nếu bỏ qua tối ưu này.
- **Quên `productService`/`Product` import** khi copy đoạn tải sản phẩm từ `TransactionList.tsx`.

## 🔄 Cách test
1. `npm run dev --workspace=frontend`, vào `/inventory`.
2. Kiểm tra tab mặc định là "Chi tiết tồn kho", dữ liệu và filter cũ hoạt động như trước.
3. Chuyển sang tab "Sổ biến động kho" — kiểm tra bảng hiển thị đúng, lọc theo sản phẩm/ngày hoạt động, phân
   trang hoạt động.
4. Nhập filter ở tab "Chi tiết tồn kho", chuyển sang tab "Sổ biến động kho" rồi quay lại — filter tab "Chi
   tiết tồn kho" phải còn nguyên giá trị đã nhập.
5. Thực hiện 1 giao dịch nhập/xuất kho mới → vào tab "Sổ biến động kho" → giao dịch mới phải xuất hiện.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/pages/inventory/InventoryList.tsx
```

## 📝 Commit message
```
feat(inventory): split /inventory page into Detail Inventory + Ledger tabs
```

## 🔀 PR title
```
[Task 113] Add Detail Inventory / Inventory Ledger tabs to /inventory page
```
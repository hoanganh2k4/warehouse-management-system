# Task 109 [FRONTEND] — Ô tìm kiếm theo mã đơn (`orderCode`)

## 🎯 Mục tiêu
Thêm ô tìm kiếm "Mã đơn" trên trang Lịch sử giao dịch, cho phép tra cứu nhanh: nhập mã đơn (`SCH-...`) →
lọc đúng giao dịch/lịch liên quan — đúng yêu cầu "Thực hiện nhập/xuất hàng có mã đơn riêng → khi xuất/nhập
thì sẽ tra dữ liệu thông qua mã đơn riêng".

**Điều kiện tiên quyết: Task 92 (backend — sinh `orderCode`, lọc `GET /transactions?orderCode=`, endpoint
`GET /schedules/by-code/:orderCode`) đã merge.**

## 📖 Giải thích nghiệp vụ
`TransactionList.tsx` hiện có bộ lọc theo Loại/Sản phẩm/Từ ngày/Đến ngày — **không có cách tra theo mã
đơn**. Vì mã đơn (`orderCode`) là định danh nhân viên kho cầm theo (ghi trên phiếu giấy, dán lên kiện hàng),
đây là cách tra cứu tự nhiên nhất khi làm việc thực tế, quan trọng hơn cả lọc theo ngày/sản phẩm trong nhiều
tình huống.

## 🧠 Giải thích React cần biết
- Áp dụng cho CẢ 2 tab: "Lịch sử giao dịch" (dùng `GET /transactions?orderCode=`) và "Lịch nhập/xuất" (dùng
  `GET /schedules/by-code/:orderCode` — trả đúng 1 kết quả, không phải danh sách, cần xử lý UI khác 1 chút:
  nếu tìm thấy, tự động mở `ScheduleDetailModal` cho kết quả đó; nếu không tìm thấy, hiện thông báo).
- Debounce input (400ms) theo đúng pattern đã dùng ở `InventoryList.tsx` (search theo `sku`/`zone`).

## 📖 Các file cần đọc trước
- `apps/frontend/src/pages/transactions/TransactionList.tsx` (toàn bộ)
- `apps/frontend/src/pages/inventory/InventoryList.tsx` (tham khảo pattern debounce input đã có)
- `apps/frontend/src/hooks/useTransactions.ts`, `apps/frontend/src/hooks/useSchedules.ts`
- `apps/frontend/src/services/schedule.service.ts` (kiểm tra có sẵn hàm gọi `GET /schedules/:id` chưa, để
  thêm `getByOrderCode` theo đúng convention)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/frontend/src/types.ts` (thêm `orderCode?: string` vào `GetTransactionsParams`)
- Sửa: `apps/frontend/src/services/schedule.service.ts` (thêm `getByOrderCode`)
- Sửa: `apps/frontend/src/pages/transactions/TransactionList.tsx` (thêm ô tìm kiếm dùng chung cho cả 2 tab)

## 📂 File KHÔNG được sửa
- `apps/frontend/src/hooks/useTransactions.ts` — CHỈ nếu hook đã tự động forward mọi param trong object
  params xuống `transactionService.getTransactions` thì không cần sửa gì (kiểm tra trước khi kết luận); nếu
  hook có whitelist tham số cứng, thêm `orderCode` vào đúng whitelist đó (báo rõ trong PR nếu phải sửa file
  này, không tự ý coi là "không được sửa" một cách cứng nhắc — ưu tiên nguyên tắc "làm đúng chức năng" hơn
  danh sách file, nhưng phải ghi chú rõ)
- `apps/frontend/src/components/ScheduleDetailModal.tsx` (dùng lại nguyên trạng)

## 🔌 API cần dùng
- `GET /transactions?orderCode=...` (Task 92)
- `GET /schedules/by-code/:orderCode` (Task 92)

## 🪜 Các bước thực hiện
1. Trong `types.ts`, thêm `orderCode?: string;` vào `GetTransactionsParams`.
2. Trong `schedule.service.ts`, thêm:
   ```ts
   getByOrderCode(orderCode: string): Promise<Schedule> {
     return apiClient.get(`/schedules/by-code/${orderCode}`);
   },
   ```
3. Trong `TransactionList.tsx`:
   - Thêm state `orderCodeInput`, `orderCode` (debounce 400ms, theo đúng pattern `skuInput`/`sku` ở
     `InventoryList.tsx`), và state `orderCodeSearchError: string | null`.
   - Thêm 1 ô input "Tìm theo mã đơn (VD: SCH-20260722-0001)" trong `page-header-controls`, áp dụng cho cả 2
     tab (đặt phía trên `<nav className="tab-nav">`, không lồng trong từng tab).
   - Truyền `orderCode: orderCode || undefined` vào `useTransactions(...)` — chỉ có tác dụng lọc khi đang ở
     tab "history".
   - Khi `orderCode` thay đổi VÀ đang ở tab "schedule": gọi `scheduleService.getByOrderCode(orderCode)`
     trong `useEffect`; nếu thành công, set `detailSchedule` với kết quả (tự động mở
     `ScheduleDetailModal`); nếu lỗi (404), set `orderCodeSearchError` hiển thị dưới ô input, KHÔNG throw
     lỗi làm crash trang.
4. Chạy `npm run build --workspace=frontend`.

## 💻 Ví dụ code (đoạn effect tra cứu theo mã đơn ở tab "schedule")
```tsx
useEffect(() => {
  if (activeTab !== 'schedule' || !orderCode) {
    setOrderCodeSearchError(null);
    return;
  }
  let cancelled = false;
  scheduleService
    .getByOrderCode(orderCode)
    .then((result) => {
      if (cancelled) return;
      setDetailSchedule(result);
      setOrderCodeSearchError(null);
    })
    .catch(() => {
      if (cancelled) return;
      setOrderCodeSearchError(`Không tìm thấy lịch với mã đơn "${orderCode}".`);
    });
  return () => {
    cancelled = true;
  };
}, [activeTab, orderCode]);
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/109.txt`

## ✅ Checklist nghiệm thu
- ☐ Ô tìm kiếm mã đơn hiển thị trên cả 2 tab
- ☐ Tab "Lịch sử giao dịch": nhập mã đơn → danh sách lọc đúng theo `orderCode`
- ☐ Tab "Lịch nhập/xuất": nhập mã đơn hợp lệ → tự động mở `ScheduleDetailModal` đúng lịch đó
- ☐ Tab "Lịch nhập/xuất": nhập mã đơn không tồn tại → hiện thông báo lỗi rõ ràng, không crash trang
- ☐ Xoá ô tìm kiếm → quay lại danh sách đầy đủ như trước (không bị kẹt filter)
- ☐ `npm run build --workspace=frontend` không lỗi

## ❌ Lỗi thường gặp
- **Không debounce input** → gọi API liên tục khi đang gõ, giống lỗi tiềm ẩn nếu copy sai pattern.
- **Quên `cancelled` flag trong effect tra cứu theo mã đơn** → race condition khi gõ nhanh, kết quả cũ ghi
  đè kết quả mới.
- **Coi lỗi 404 là lỗi hệ thống** (hiện thông báo kiểu "Có lỗi xảy ra") → phải phân biệt rõ "không tìm
  thấy" (bình thường, người dùng gõ sai/gõ thiếu) với lỗi thật sự.

## 🔄 Cách test
1. `npm run dev --workspace=frontend`, vào trang Lịch sử giao dịch.
2. Tạo 1 lịch nhập, lấy `orderCode` (xem qua Swagger hoặc DB).
3. Gõ mã đó vào ô tìm kiếm ở tab "Lịch sử giao dịch" (sau khi đã thực hiện lịch, có giao dịch phát sinh) —
   phải lọc đúng giao dịch liên quan.
4. Chuyển sang tab "Lịch nhập/xuất", gõ đúng mã đó — phải tự mở modal chi tiết lịch.
5. Gõ 1 mã sai/không tồn tại — phải hiện lỗi rõ ràng, không crash.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/types.ts apps/frontend/src/services/schedule.service.ts apps/frontend/src/pages/transactions/TransactionList.tsx
```

## 📝 Commit message
```
feat(transactions): add order-code search across transaction history and schedules
```

## 🔀 PR title
```
[Task 109] Add order-code lookup search on Transactions page
```

# Task 105 [FRONTEND] — Màu sắc/badge cảnh báo hết hạn ở Tồn kho & chi tiết Slot

## 🎯 Mục tiêu
Hiển thị **hạn sử dụng cụ thể + màu/badge cảnh báo** (OK/WARNING/CRITICAL/EXPIRED) ở trang Tồn kho
(`InventoryList`/`InventoryTable`) và ở popup chi tiết Slot (`SlotDetailDialog`) trong Racking — dùng dữ
liệu `expiryDate`/`expiryStatus`/`daysUntilExpiry` đã có sẵn từ `GET /inventory` (Task 89, backend).

**Điều kiện tiên quyết: Task 89 đã merge (backend).**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
Đã xác nhận trong code hiện tại:
- `InventoryTable.tsx` (dòng 88-93, 96-109): bảng tồn kho hiển thị Sản phẩm/Mã lô/Vị trí/Số lượng/Cập nhật
  lúc — **hoàn toàn không có cột hạn sử dụng**.
- `SlotDetailDialog.tsx` (dòng 44-76): popup chi tiết slot hiển thị Sức chứa/Còn trống/Khoảng cách/Hàng hoá
  — **không có thông tin hạn sử dụng của lô hàng đang nằm trong slot đó**.
- `type InventoryItem` (`types.ts`, dòng 115-125) chưa có field `expiryDate`/`expiryStatus`/`daysUntilExpiry`
  dù backend (sau Task 89) đã trả các field này.

Đây chính là điều anh mô tả: "Hàng hết hạn chưa có dữ liệu cụ thể: khi nào gần hết hạn thì báo hay hiển thị
màu sắc khác".

## 🧠 Giải thích React cần biết
- `SlotDetailDialog` hiện chỉ nhận `product` (thông tin sản phẩm), KHÔNG có thông tin lô/hạn sử dụng theo
  slot. Cách lấy dữ liệu đơn giản nhất, không cần thêm API mới: gọi lại `inventoryService.getInventory({
  slotId: slot.id })` (param `slotId` đã tồn tại sẵn trong `GetInventoryParams`, backend `GET /inventory`
  đã hỗ trợ lọc theo `slotId`) ngay khi mở dialog — vì 1 slot có thể chứa nhiều batch (dù hiếm), hiển thị
  dạng danh sách nhỏ.
- Dùng `useState` + `useEffect` cục bộ trong `SlotDetailDialog` để fetch, giữ đúng pattern
  loading/error đơn giản đã dùng cho `product`/`productLoading` trong cùng component.
- Định nghĩa 1 hàm helper dùng chung `getExpiryBadgeClass(status)` và `getExpiryLabel(status)` — đặt trong
  file util mới `utils/expiry.utils.ts` (đặt cạnh `utils/Capacity.utils.ts` đã có, theo đúng convention thư
  mục) để dùng lại được ở cả `InventoryTable` và `SlotDetailDialog`, tránh viết trùng logic màu sắc ở 2 nơi.

## 📖 Các file cần đọc trước
- `apps/frontend/src/components/InventoryTable.tsx` (toàn bộ)
- `apps/frontend/src/pages/racking/components/SlotDetailDialog.tsx` (toàn bộ)
- `apps/frontend/src/types.ts` (`InventoryItem`, `GetInventoryParams`)
- `apps/frontend/src/services/inventory.service.ts` (`getInventory`)
- `apps/frontend/src/utils/Capacity.utils.ts` (tham khảo cách viết 1 util helper hiện có trong dự án, đồng
  bộ style)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/frontend/src/types.ts` (thêm field vào `InventoryItem`)
- Tạo mới: `apps/frontend/src/utils/expiry.utils.ts`
- Sửa: `apps/frontend/src/components/InventoryTable.tsx` (thêm cột "Hạn sử dụng")
- Sửa: `apps/frontend/src/pages/racking/components/SlotDetailDialog.tsx` (thêm phần hiển thị lô hàng + hạn
  sử dụng, tự fetch dữ liệu)
- Sửa: `apps/frontend/src/App.css` (hoặc file CSS chung của dự án đang dùng cho class `slot-status-badge`,
  `state-panel`... — thêm class màu mới cho badge hết hạn, dùng đúng file CSS hiện có, không tạo file CSS
  rời rạc mới)

## 📂 File KHÔNG được sửa
- `apps/frontend/src/pages/inventory/InventoryList.tsx` (không cần đổi, chỉ đổi component con
  `InventoryTable`)
- `apps/frontend/src/pages/racking/RackingPage.tsx` (không đổi cách gọi `SlotDetailDialog`, component tự
  fetch thêm dữ liệu bên trong, không cần prop mới từ cha)
- Backend — task này thuần frontend

## 🔌 API cần dùng
- `GET /inventory` (đã dùng sẵn qua `inventoryService.getInventory`) — giờ response có thêm
  `expiryDate`, `expiryStatus`, `daysUntilExpiry` (từ Task 89), dùng lại đúng API này với `params: { slotId }`
  trong `SlotDetailDialog`, không gọi API mới.

## 🪜 Các bước thực hiện
1. Trong `types.ts`, sửa `InventoryItem`, thêm 3 field:
   ```ts
   export type InventoryItem = {
     id: string;
     batchId: string;
     batchCode: string;
     slotId: string;
     slotCode: string;
     productSkuCode: string;
     productName: string;
     quantity: number;
     expiryDate: string;
     expiryStatus: 'OK' | 'WARNING' | 'CRITICAL' | 'EXPIRED';
     daysUntilExpiry: number;
     updatedAt: string;
   };
   ```
2. Tạo `utils/expiry.utils.ts`:
   ```ts
   export type ExpiryStatus = 'OK' | 'WARNING' | 'CRITICAL' | 'EXPIRED';

   export function getExpiryBadgeClass(status: ExpiryStatus): string {
     switch (status) {
       case 'EXPIRED': return 'expiry-badge is-expired';
       case 'CRITICAL': return 'expiry-badge is-critical';
       case 'WARNING': return 'expiry-badge is-warning';
       default: return 'expiry-badge is-ok';
     }
   }

   export function getExpiryLabel(status: ExpiryStatus, daysUntilExpiry: number): string {
     if (status === 'EXPIRED') return `Đã hết hạn ${Math.abs(daysUntilExpiry)} ngày`;
     if (status === 'CRITICAL') return `Còn ${daysUntilExpiry} ngày`;
     if (status === 'WARNING') return `Còn ${daysUntilExpiry} ngày`;
     return 'Còn hạn';
   }

   export function formatDate(value: string): string {
     const date = new Date(value);
     const pad = (n: number) => String(n).padStart(2, '0');
     return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
   }
   ```
3. Trong `InventoryTable.tsx`: thêm cột `<th>Hạn sử dụng</th>` (đặt sau cột "Số lượng", trước "Cập nhật
   lúc"), cả ở phần skeleton loading (thêm 1 `<td>` skeleton) lẫn bảng dữ liệu thật:
   ```tsx
   <td>
     <span className={getExpiryBadgeClass(item.expiryStatus)}>
       {formatDate(item.expiryDate)} · {getExpiryLabel(item.expiryStatus, item.daysUntilExpiry)}
     </span>
   </td>
   ```
   Import `getExpiryBadgeClass, getExpiryLabel, formatDate` từ `../utils/expiry.utils`.
4. Trong `SlotDetailDialog.tsx`:
   - Thêm `useState`/`useEffect` để fetch `inventoryService.getInventory({ slotId: slot.id, limit: 10 })`
     khi `slot.id` đổi, lưu vào state `slotBatches`, `slotBatchesLoading`.
   - Thêm 1 mục mới trong `<dl className="warehouse-map-popup-list">`, sau mục "Hàng hoá":
     ```tsx
     <div>
       <dt>Hạn sử dụng lô hàng</dt>
       <dd>
         {slotBatchesLoading && 'Đang tải...'}
         {!slotBatchesLoading && slotBatches.length === 0 && 'Không có lô hàng'}
         {!slotBatchesLoading &&
           slotBatches.map((b) => (
             <div key={b.id} className={getExpiryBadgeClass(b.expiryStatus)}>
               {b.batchCode}: {formatDate(b.expiryDate)} · {getExpiryLabel(b.expiryStatus, b.daysUntilExpiry)}
             </div>
           ))}
       </dd>
     </div>
     ```
5. Thêm CSS cho `.expiry-badge` và 4 biến thể `.is-ok/.is-warning/.is-critical/.is-expired` vào file CSS
   dùng chung hiện có (tìm đúng file đang chứa `.slot-status-badge` để thêm cạnh đó, giữ cùng convention màu
   sắc của dự án — ví dụ xanh lá cho OK, vàng cho WARNING, cam cho CRITICAL, đỏ cho EXPIRED).
6. Chạy `npm run build --workspace=frontend`.

## 💻 Ví dụ code
Xem đầy đủ ở mục "Các bước thực hiện".

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/105.txt`

## ✅ Checklist nghiệm thu
- ☐ Trang Tồn kho hiển thị cột "Hạn sử dụng" với badge màu theo đúng 4 trạng thái
- ☐ Mở chi tiết 1 Slot đang có hàng trong Racking → thấy được hạn sử dụng của (các) lô hàng trong slot đó,
  có màu badge tương ứng
- ☐ Slot trống → hiển thị "Không có lô hàng", không lỗi
- ☐ 4 trạng thái có 4 màu khác nhau rõ ràng (OK xanh lá, WARNING vàng, CRITICAL cam, EXPIRED đỏ)
- ☐ Không đổi cách gọi `SlotDetailDialog` từ `RackingPage.tsx` (không cần prop mới từ cha)
- ☐ `npm run build --workspace=frontend` không lỗi

## ❌ Lỗi thường gặp
- **Gọi API `getInventory({ slotId })` mỗi lần render** (không có dependency array đúng trong `useEffect`)
  → gọi API liên tục, vòng lặp vô hạn. Phải có `[slot.id]` làm dependency.
- **Không xử lý trường hợp slot trống** (`slotBatches.length === 0`) → hiển thị rỗng gây khó hiểu, phải có
  thông báo rõ ràng.
- **Trộn lẫn thang màu** (ví dụ dùng đỏ cho WARNING thay vì CRITICAL/EXPIRED) → gây hoảng loạn giả cho nhân
  viên kho khi thấy màu đỏ nhưng thực ra còn 25 ngày mới hết hạn.

## 🔄 Cách test
1. `npm run dev --workspace=frontend`.
2. Vào trang Tồn kho — kiểm tra cột "Hạn sử dụng" hiện đúng ngày + badge màu cho từng dòng.
3. Vào Racking, click vào 1 slot đang có hàng có lô sắp hết hạn (< 7 ngày, sửa dữ liệu test qua Prisma
   Studio nếu cần) — badge phải hiện màu cam/đỏ tương ứng.
4. Click vào 1 slot trống — phải hiện "Không có lô hàng", không crash.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/types.ts apps/frontend/src/components/InventoryTable.tsx apps/frontend/src/pages/racking/components/SlotDetailDialog.tsx apps/frontend/src/App.css
rm apps/frontend/src/utils/expiry.utils.ts
```

## 📝 Commit message
```
feat(inventory,racking): show expiry date and status badges in inventory table and slot detail
```

## 🔀 PR title
```
[Task 105] Add expiry status colors/badges to Inventory list and Slot detail
```

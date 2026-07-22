# Task 106 [FRONTEND] — Hiển thị cờ "Hàng nặng" trong chi tiết Slot

## 🎯 Mục tiêu
Hiển thị badge "⚠ Hàng nặng" trong `SlotDetailDialog` khi sản phẩm đang chiếm slot đó có `isHeavy = true`
— giúp nhân viên kho nhận biết trực quan lý do vì sao slot này được thuật toán ưu tiên xếp ở level thấp
(Task 94, backend), và tránh nhầm lẫn khi cân nhắc di chuyển/sắp xếp lại thủ công.

**Điều kiện tiên quyết: không phụ thuộc task backend nào mới — `Product.isHeavy` đã có sẵn trong API sản
phẩm hiện tại.**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
`SlotDetailDialog.tsx` (dòng 64-75) đã fetch và hiển thị `product` (qua prop `product: Product | null`) khi
slot có `currentProductId`, nhưng chỉ hiển thị `skuCode — name`, **không hiển thị `product.isHeavy`** dù
field này đã tồn tại sẵn trong `type Product` (`types.ts`, dòng 27: `isHeavy: boolean`) — dữ liệu đã có sẵn
trong props, chỉ cần thêm dòng hiển thị, không cần gọi thêm API nào.

## 🧠 Giải thích React cần biết
- Đây là thay đổi UI đơn giản nhất trong Stage 18 — chỉ thêm 1 điều kiện render dựa trên prop đã có sẵn
  (`product?.isHeavy`), không cần state/effect mới.

## 📖 Các file cần đọc trước
- `apps/frontend/src/pages/racking/components/SlotDetailDialog.tsx` (toàn bộ)
- `apps/frontend/src/types.ts` (`type Product`, xác nhận field `isHeavy: boolean`)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/frontend/src/pages/racking/components/SlotDetailDialog.tsx`
- Sửa: file CSS chung của dự án (thêm class badge mới, ví dụ `.heavy-badge`, đặt cạnh `.slot-status-badge`
  đã có)

## 📂 File KHÔNG được sửa
- `apps/frontend/src/types.ts` (field `isHeavy` đã tồn tại sẵn, không cần đổi)
- `apps/frontend/src/pages/racking/RackingPage.tsx` (không cần đổi cách truyền prop `product`, dữ liệu đã
  đủ)

## 🔌 API cần dùng
Không cần gọi thêm API — dữ liệu `product.isHeavy` đã có sẵn trong prop hiện tại.

## 🪜 Các bước thực hiện
1. Trong `SlotDetailDialog.tsx`, tìm mục `<dt>Hàng hoá</dt>` (dòng 64-75).
2. Ngay sau đoạn hiển thị tên sản phẩm, thêm badge có điều kiện:
   ```tsx
   <dd>
     {!slot.currentProductId && 'Trống'}
     {slot.currentProductId && productLoading && 'Đang tải...'}
     {slot.currentProductId && !productLoading && product && (
       <>
         {product.skuCode} — {product.name}
         {product.isHeavy && <span className="heavy-badge">⚠ Hàng nặng</span>}
       </>
     )}
     {slot.currentProductId &&
       !productLoading &&
       !product &&
       'Không tải được thông tin sản phẩm'}
   </dd>
   ```
3. Thêm CSS cho `.heavy-badge` vào file CSS chung (màu nền cam/vàng nhạt, chữ đậm, bo góc nhỏ — theo đúng
   style các badge khác `.slot-status-badge.is-full-badge` đang dùng trong cùng file, để đồng bộ hình
   dáng).
4. Chạy `npm run build --workspace=frontend`.

## 💻 Ví dụ code
Xem đầy đủ ở mục "Các bước thực hiện".

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/106.txt`

## ✅ Checklist nghiệm thu
- ☐ Slot đang chứa sản phẩm `isHeavy = true` → hiện badge "⚠ Hàng nặng" cạnh tên sản phẩm trong dialog
- ☐ Slot đang chứa sản phẩm `isHeavy = false` → không hiện badge, không đổi giao diện khác
- ☐ Slot trống hoặc đang tải → hành vi giữ nguyên như cũ (không lỗi, không hiện badge sai chỗ)
- ☐ Không gọi thêm API nào mới
- ☐ `npm run build --workspace=frontend` không lỗi

## ❌ Lỗi thường gặp
- **Quên kiểm tra `product` tồn tại trước khi đọc `product.isHeavy`** → lỗi runtime nếu `product` là `null`
  (trường hợp "Không tải được thông tin sản phẩm"). Phải đặt điều kiện `isHeavy` bên trong nhánh đã chắc
  chắn `product` tồn tại (như ví dụ ở trên).
- **Hiện badge kể cả khi slot trống** → sai, vì không có sản phẩm nào để đánh giá "nặng hay không".

## 🔄 Cách test
1. `npm run dev --workspace=frontend`.
2. Vào Racking, mở chi tiết 1 slot đang chứa sản phẩm có `isHeavy = true` (kiểm tra/qua Products page hoặc
   Prisma Studio) — phải thấy badge "⚠ Hàng nặng".
3. Mở chi tiết 1 slot chứa sản phẩm tiêu chuẩn — không thấy badge.
4. Mở chi tiết slot trống — không lỗi, không có badge.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/pages/racking/components/SlotDetailDialog.tsx
```

## 📝 Commit message
```
feat(racking): show heavy-product badge in slot detail dialog
```

## 🔀 PR title
```
[Task 106] Display heavy-product indicator in Slot detail dialog
```

# Task 85 [BACKEND] — Cập nhật seed.ts để dữ liệu mẫu có đủ field mới

## 🎯 Mục tiêu
Cập nhật `prisma/seed.ts` để mỗi `Transaction` mẫu sinh ra có đủ `quantityBefore`/`quantityAfter`/`dailySeq`
(Task 82), và các `Schedule` mẫu (nếu seed có tạo) có `orderCode` hợp lệ — để môi trường dev sau khi
`prisma migrate reset` luôn có dữ liệu đúng chuẩn mới, không cần chạy thêm script backfill thủ công.

**Điều kiện tiên quyết: Task 82, 83, 84 đã merge xong.**

## 📖 Giải thích nghiệp vụ
Task 84 chỉ backfill dữ liệu **đang có sẵn trong DB dev hiện tại**. Nhưng dev khác khi clone code mới, chạy
`npx prisma migrate reset` (lệnh xoá sạch + seed lại từ đầu — dev hay dùng khi schema đổi nhiều) sẽ **không
có script backfill nào chạy** vì `migrate reset` chỉ tự động chạy `seed.ts`. Nếu không sửa `seed.ts`, toàn
bộ transaction mẫu mới tạo ra vẫn thiếu `quantityBefore/After/dailySeq`, và các trang mới làm ở Stage 14/17
(hiển thị chi tiết trước/sau, sort liên tiếp theo ngày) sẽ không có dữ liệu để test.

## 🧠 Giải thích Prisma/NestJS cần biết
- `seed.ts` hiện tính `usedCapacity`/`availableCapacity`/`occupancyRate` **thủ công ngay trong vòng lặp**
  trước khi tạo `Transaction` — nghĩa là tại thời điểm tạo transaction nhập kho, biến `quantity` seed chính
  là số lượng **sau** giao dịch (vì slot đang trống, nhập từ 0 → quantity), còn **trước** giao dịch là 0.
  Với đoạn xuất kho mẫu, biến `inventory.quantity` (đọc trước khi update) chính là số **trước**, và
  `newQuantity` là số **sau**.
- `dailySeq` seed cần tính theo đúng logic sẽ dùng ở Task 91 (Stage 14): đếm theo `(loại giao dịch, ngày
  `createdAt`)` — trong seed hiện tại các transaction IMPORT được tạo với `createdAt` set thủ công trải đều
  14 ngày (dòng `importedAt.setDate(...)`), nên `dailySeq` của mỗi transaction IMPORT trong seed luôn là 1
  (vì code hiện tại mỗi ngày chỉ tạo tối đa 1 giao dịch IMPORT — không cần logic đếm phức tạp, nhưng vẫn
  phải set field này thay vì để `null` để có dữ liệu mẫu đúng dạng cho FE test).

## 📖 Các file cần đọc trước
- `apps/backend/prisma/seed.ts` (toàn bộ, đặc biệt đoạn từ dòng ~300 tới cuối — phần tạo `Inventory` +
  `Transaction` nhập/xuất mẫu)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/prisma/seed.ts` (chỉ đoạn tạo `Transaction`, không đổi phần tạo Product/Slot/Batch
  khác nếu không liên quan)

## 📂 File KHÔNG được sửa
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/backfill-order-code.ts`
- Bất kỳ file nào trong `apps/backend/src`

## 🔌 API cần dùng
Không có — seed chạy trực tiếp qua Prisma Client.

## 🪜 Các bước thực hiện
1. Ở đoạn tạo `Transaction` cho giao dịch **nhập kho** (quanh dòng 348), thêm vào `data`:
   - `quantityBefore: 0` (vì slot seed đang trống trước khi nhập theo logic hiện tại)
   - `quantityAfter: quantity` (chính là biến `quantity` đã tính usedCapacity ở trên)
   - `dailySeq: 1` (mỗi ngày seed chỉ tạo 1 giao dịch nhập cho slot đó)
2. Ở đoạn tạo `Transaction` cho giao dịch **xuất kho** (quanh dòng 393), thêm vào `data`:
   - `quantityBefore: inventory.quantity` (số lượng đọc được trước khi update — biến đã có sẵn trong scope)
   - `quantityAfter: newQuantity` (biến đã có sẵn trong scope)
   - `dailySeq: 1`
3. Chạy `npx prisma migrate reset` trên DB dev (⚠️ chỉ trên DB dev, lệnh này xoá sạch dữ liệu) để seed lại
   từ đầu, kiểm tra log không lỗi.
4. Mở Prisma Studio, kiểm tra vài record `Transaction` bất kỳ — phải thấy `quantityBefore`/`quantityAfter`/
   `dailySeq` có giá trị, không còn `NULL`.

## 💻 Ví dụ code (đoạn diff minh hoạ)
```ts
// Đoạn tạo transaction NHẬP KHO — thêm 3 dòng field mới
await prisma.transaction.create({
  data: {
    type: TransactionType.IMPORT,
    batchId: batch.id,
    slotToId: slot.id,
    quantity,
    quantityBefore: 0,
    quantityAfter: quantity,
    dailySeq: 1,
    userId: i % 3 === 0 ? adminUser.id : staffUser.id,
    note: 'Dữ liệu mẫu — nhập kho',
    createdAt: importedAt,
  },
});

// ...

// Đoạn tạo transaction XUẤT KHO — thêm 3 dòng field mới
await prisma.transaction.create({
  data: {
    type: TransactionType.EXPORT,
    batchId: batch.id,
    slotFromId: slot.id,
    quantity: exportQty,
    quantityBefore: inventory.quantity,
    quantityAfter: newQuantity,
    dailySeq: 1,
    userId: staffUser.id,
    note: 'Dữ liệu mẫu — xuất kho',
    createdAt: exportedAt,
  },
});
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/85.txt`

## ✅ Checklist nghiệm thu
- ☐ Transaction IMPORT mẫu có `quantityBefore: 0`, `quantityAfter` bằng số lượng nhập, `dailySeq: 1`
- ☐ Transaction EXPORT mẫu có `quantityBefore` = tồn kho trước khi trừ, `quantityAfter` = tồn kho sau khi
  trừ, `dailySeq: 1`
- ☐ `npx prisma migrate reset` chạy xong không lỗi, log in ra đúng số lượng đã seed như cũ
- ☐ Prisma Studio kiểm tra bảng `transactions` — không còn record nào có `quantityBefore`/`quantityAfter`
  là NULL trong dữ liệu vừa seed
- ☐ Không đổi số lượng/logic sinh dữ liệu khác (số slot, số batch, số transaction) so với trước

## ❌ Lỗi thường gặp
- **Gán nhầm `quantityBefore`/`quantityAfter` ngược nhau** ở đoạn xuất kho (dễ nhầm vì đọc code nhanh) —
  luôn nhớ: `inventory.quantity` là số đọc TRƯỚC update = before; `newQuantity` là số SAU khi trừ = after.
- **Chạy `prisma migrate reset` trên nhầm database** (vd trỏ nhầm `.env` sang DB đang có dữ liệu thật) — bắt
  buộc kiểm tra biến `DATABASE_URL` trong `.env` trỏ đúng DB dev/local trước khi chạy.

## 🔄 Cách test
1. `cd apps/backend && npx prisma migrate reset` (xác nhận "yes" khi được hỏi).
2. Mở Prisma Studio (`npx prisma studio`), vào bảng `transactions`, kiểm tra vài dòng bất kỳ có đủ 3 field
   mới.
3. Chạy `npm run start:dev --workspace=backend`, gọi thử `GET /transactions` (Swagger UI), xác nhận response
   JSON có field `quantityBefore`, `quantityAfter`, `dailySeq`.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/prisma/seed.ts
npx prisma migrate reset   # seed lại theo bản cũ sau khi rollback file
```

## 📝 Commit message
```
chore(seed): populate quantityBefore/quantityAfter/dailySeq for sample transactions
```

## 🔀 PR title
```
[Task 85] Update seed data with new transaction detail fields
```

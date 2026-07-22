# Task 102 [BACKEND] — API "Sổ biến động kho" (`GET /inventory/ledger`) — Inventory theo đúng nghĩa mới

## 🎯 Mục tiêu
Thêm endpoint mới `GET /inventory/ledger`, trả về **dòng thời gian biến động tồn kho** (thời điểm, tăng/giảm
bao nhiêu, tồn trước/sau) — đúng theo định nghĩa lại của anh: *"Inventory thì ghi là vào lúc nào kho tăng/
giảm bao nhiêu"*. Đây là endpoint MỚI, không đổi `GET /inventory` hiện có (API đó sẽ đóng vai trò "Detail
Inventory" — xem Task 103).

**Điều kiện tiên quyết: Task 101 đã merge** (mọi `Transaction`, dù tạo qua Schedule hay qua Inventory trực
tiếp, đều có đủ `quantityBefore`/`quantityAfter`/`dailySeq`).

## 📖 Giải thích nghiệp vụ — tại sao cần API mới thay vì sửa API cũ
Đã phân tích đúng ý anh mô tả:
> "Em nghĩ cái số liệu chỗ inventory á nó hợp với detail inventory hơn á, tại nó ghi chi tiết số liệu ngày
> hôm đó xuất nhập bao nhiêu... Còn cái inventory á thì anh ghi là vào lúc nào kho tăng/giảm bao nhiêu."

`GET /inventory` hiện tại (`inventory.service.ts`, `findAll`) là **ảnh chụp tồn kho hiện có** theo từng cặp
`(batch, slot)` — mỗi dòng là "batch X đang có Y đơn vị tại slot Z ngay bây giờ", không phải nhật ký biến
động theo thời gian. Dữ liệu này thực chất khớp với khái niệm **"Detail Inventory"** (chi tiết tồn kho hiện
tại) mà anh mô tả, không phải "Inventory" (biến động theo thời điểm).

Nguồn dữ liệu đúng cho "biến động theo thời điểm" chính là bảng `Transaction` — mỗi row đã là 1 sự kiện
"tại thời điểm X, kho tăng/giảm Y đơn vị, từ before → after" (có sẵn sau Task 91 + 101). Task này KHÔNG tạo
bảng mới, chỉ tạo 1 **read model** (view API) đọc từ `Transaction`, định dạng lại đúng ngữ nghĩa "sổ biến
động kho" — tránh trùng lặp nguồn dữ liệu (single source of truth vẫn là `Transaction`).

## 🧠 Giải thích NestJS/Prisma cần biết
- Không cần bảng/model mới — chỉ query `prisma.transaction.findMany` với `where`/`select` phù hợp, map lại
  tên field cho đúng ngữ cảnh "ledger" (sổ cái): `occurredAt` (= `createdAt`), `changeQuantity` (dương với
  IMPORT, âm với EXPORT — để FE vẽ biểu đồ tăng/giảm trực quan), `balanceAfter` (= `quantityAfter`).
- Hỗ trợ lọc theo `productId`, `slotId`, khoảng thời gian (`from`, `to`) — tái sử dụng
  `andConditions` pattern đã có trong `inventory.service.ts findAll` (danh sách điều kiện AND độc lập, tránh
  lỗi type union phức tạp của Prisma).
- Sort mặc định: `createdAt desc, dailySeq desc` (giống Task 93 đã áp dụng cho `GET /transactions` — dùng
  lại đúng công thức tie-break, không phát minh công thức sort khác).

## 📖 Các file cần đọc trước
- `apps/backend/src/inventory/inventory.service.ts` (toàn bộ, đặc biệt pattern `andConditions` trong
  `findAll`)
- `apps/backend/src/transactions/transactions.service.ts` (bản đã sửa ở Task 91/93 — tham khảo cách
  `select`/`orderBy`/`toTransactionView`, KHÔNG copy nguyên hàm, chỉ tham khảo cấu trúc)
- `apps/backend/src/common/utils/location.util.ts` (`formatSlotLocation`)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/inventory/inventory.service.ts` (thêm method mới `getLedger`)
- Sửa: `apps/backend/src/inventory/inventory.controller.ts` (thêm route mới `GET /inventory/ledger`)
- Sửa: `apps/backend/src/inventory/dto/inventory.dto.ts` (thêm `InventoryLedgerQueryDto`)

## 📂 File KHÔNG được sửa
- `findAll()`, `findOne()`, `inbound()`, `outbound()` trong `inventory.service.ts` — task này chỉ THÊM
  method mới, không sửa method cũ
- `apps/backend/src/transactions/**` (chỉ đọc để tham khảo, không sửa)

## 🔌 API cần dùng (API MỚI thêm ở task này)
`GET /inventory/ledger?productId=&slotId=&from=&to=&page=&limit=`

Response mẫu:
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
(`orderCode` là `null` nếu giao dịch tạo qua `/inventory/inbound|outbound` trực tiếp, không qua Schedule.)

## 🪜 Các bước thực hiện
1. Trong `inventory.dto.ts`, thêm:
   ```ts
   export class InventoryLedgerQueryDto {
     @ApiPropertyOptional() @IsOptional() @IsUUID() productId?: string;
     @ApiPropertyOptional() @IsOptional() @IsUUID() slotId?: string;
     @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string;
     @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string;
     @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
     @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
   }
   ```
   (kiểm tra decorator/import đã dùng trong `inventory.dto.ts`/`transaction.dto.ts` để đồng bộ style, không
   tự bịa cách viết khác).
2. Trong `inventory.service.ts`, thêm method `getLedger(query: InventoryLedgerQueryDto)`:
   - Build `andConditions: Prisma.TransactionWhereInput[]` từ `productId` (qua `batch.productId`), `slotId`
     (qua `slotToId` HOẶC `slotFromId` — dùng `OR`), khoảng `from`/`to` trên `createdAt`.
   - Query `prisma.transaction.findMany` + `count`, `select` đủ field: `id, type, createdAt, quantity,
     quantityBefore, quantityAfter, dailySeq, batch (product.skuCode, product.name), slotFrom (để format
     path khi EXPORT), slotTo (để format path khi IMPORT), schedule (chỉ lấy orderCode)`.
   - `orderBy: [{ createdAt: 'desc' }, { dailySeq: 'desc' }]` (đúng công thức Task 93).
   - Map mỗi item: `changeQuantity = type === 'IMPORT' ? quantity : -quantity`, `slotPath` lấy từ `slotTo`
     nếu IMPORT, `slotFrom` nếu EXPORT, `balanceBefore = quantityBefore`, `balanceAfter = quantityAfter`,
     `orderCode = schedule?.orderCode ?? null`.
3. Trong `inventory.controller.ts`, thêm route:
   ```ts
   @Public()
   @Get('ledger')
   getLedger(@Query() query: InventoryLedgerQueryDto) {
     return this.service.getLedger(query);
   }
   ```
   (đặt TRƯỚC route `GET /inventory/:id` nếu Nest match theo thứ tự khai báo — kiểm tra thứ tự hiện có
   trong controller để tránh `:id` nuốt mất `ledger`, giống bài học ở Task 92).
4. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
Xem đầy đủ hướng dẫn ở mục "Các bước thực hiện" — cấu trúc method tương tự
`transactions.service.ts findAll` (Task 91/93) nhưng thêm bước map lại tên field cho đúng ngữ nghĩa ledger.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/102.txt`

## ✅ Checklist nghiệm thu
- ☐ `GET /inventory/ledger` hoạt động, trả đúng cấu trúc mẫu ở trên
- ☐ `changeQuantity` âm khi EXPORT, dương khi IMPORT
- ☐ `slotPath` lấy đúng slot theo chiều giao dịch (IMPORT → `slotTo`, EXPORT → `slotFrom`)
- ☐ `orderCode` là `null` đúng cho giao dịch tạo qua `/inventory/inbound|outbound` (không qua Schedule)
- ☐ Lọc được theo `productId`, `slotId`, khoảng thời gian `from`/`to`
- ☐ Sort ổn định `[{ createdAt: 'desc' }, { dailySeq: 'desc' }]`, khớp công thức Task 93
- ☐ Route `ledger` không bị route `:id` nuốt mất
- ☐ Không sửa `findAll()`, `findOne()`, `inbound()`, `outbound()` hiện có
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Tạo bảng/model mới để lưu "ledger"** thay vì đọc từ `Transaction` có sẵn → tạo ra 2 nguồn sự thật
  (source of truth) cho cùng 1 khái niệm, dễ lệch dữ liệu về sau (giống bài học Task 86). `Transaction` +
  `quantityBefore/After` (đã có từ Task 91) là đủ dữ liệu, không cần bảng mới.
- **Đặt route `ledger` sau route `:id`** → bị `:id` nuốt mất, lỗi 404/400 khi gọi `/inventory/ledger`.
- **Quên xử lý trường hợp EXPORT không có `slotTo`** (chỉ có `slotFrom`) và ngược lại → code select thiếu 1
  trong 2 relation sẽ lỗi `undefined` khi map.

## 🔄 Cách test
1. Thực hiện vài giao dịch nhập/xuất qua cả 2 luồng (Schedule và Inventory trực tiếp).
2. Gọi `GET /inventory/ledger` — kiểm tra mỗi giao dịch xuất hiện đúng 1 dòng, `changeQuantity` đúng dấu,
   `balanceBefore`/`balanceAfter` khớp với dữ liệu thực tế đã kiểm tra ở Task 91/101.
3. Test lọc theo `productId` — chỉ trả về giao dịch của đúng sản phẩm đó.
4. Test lọc theo `from`/`to` — chỉ trả về giao dịch trong khoảng thời gian.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/inventory/inventory.service.ts apps/backend/src/inventory/inventory.controller.ts apps/backend/src/inventory/dto/inventory.dto.ts
```

## 📝 Commit message
```
feat(inventory): add GET /inventory/ledger — time-based stock movement view
```

## 🔀 PR title
```
[Task 102] Add Inventory Ledger endpoint (stock movement over time)
```

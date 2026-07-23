# Task 88 — Kết quả rà soát `_count` / `.count()` / `.aggregate()` liên quan `deletedAt`

## Model có field `deletedAt` (soft-delete) trong `schema.prisma`
Xác nhận qua `awk '/^model /{m=$2} /deletedAt/{print m}' prisma/schema.prisma`:

- `User`
- `Product`
- `Supplier`
- `Customer`

(Các model khác như `Zone`, `Rack`, `Level`, `Slot`, `Batch`, `Schedule`, `Transaction`, `Inventory`,
`Category` **không** có `deletedAt` → không thuộc phạm vi audit này.)

## Toàn bộ điểm dùng `_count` / `.count(` / `.aggregate(` trong `src` (grep ngày rà soát)

| File : dòng | Model đích | Có `deletedAt` không? | Đã lọc `deletedAt: null` chưa? | Kết luận |
|---|---|---|---|---|
| `dashboard/dashboard.service.ts:26` | `Product` | Có | Có (`where: { deletedAt: null }`) | OK |
| `dashboard/dashboard.service.ts:27-30` | `Batch`, `Slot` | Không | — | OK (không áp dụng) |
| `categories/categories.service.ts:17,26` | `Product` (qua `_count.select.products`) | Có | **Đã sửa ở Task 87** (`{ where: { deletedAt: null } }`) | OK (đã fix) |
| `categories/categories.service.ts:58` | `Product` | Có | Có (`where: { categoryId, deletedAt: null }`) | OK |
| `users/users.service.ts:38` | `User` | Có | Có (`where = { deletedAt: null }` dùng chung cho `findMany` + `count`) | OK |
| `customers/customers.service.ts:35` | `Customer` | Có | Có (`where = { deletedAt: null, ... }` dùng chung) | OK |
| `products/products.service.ts:42` | `Product` | Có | Có (`where = { deletedAt: null, ... }` dùng chung) | OK |
| `reports/reports.service.ts:37` | `Product` | Có | Có (`where: { deletedAt: null }`) | OK |
| `suppliers/suppliers.service.ts:35` | `Supplier` | Có | Có (`where = { deletedAt: null, ... }` dùng chung) | OK |
| `levels/levels.service.ts:17,41` | `Slot` | Không | — | OK (không áp dụng) |
| `slots/slots.service.ts:57,106` | `Slot`, `Inventory` | Không | — | OK (không áp dụng) |
| `warehouses/warehouses.service.ts:16,25,46` | `Zone`, `Rack` | Không | — | OK (không áp dụng) |
| `zones/zones.service.ts:17,41` | `Rack` | Không | — | OK (không áp dụng) |
| `racks/racks.service.ts:17,41` | `Level` | Không | — | OK (không áp dụng) |
| `schedules/schedules.service.ts:262,790` | `Inventory`, `Schedule` | Không | — | OK (không áp dụng) |
| `transactions/transactions.service.ts:103` | `Transaction` | Không | — | OK (không áp dụng) |
| `inventory/inventory.service.ts:133` | `Inventory` | Không | — | OK (không áp dụng) |
| `batches/batches.service.ts:29` | `Batch` | Không | — | OK (không áp dụng) |
| `reports/reports.service.ts:107,110` | `Transaction` | Không | — | OK (không áp dụng) |
| `common/swagger/swagger-examples.ts` | — | — | — | Chỉ là dữ liệu mẫu cho Swagger docs, không phải query thật, bỏ qua |

## Kết luận

**Đã rà soát toàn bộ, không phát hiện thêm lỗi nào khác ngoài chỗ đã vá ở Task 87.**
Tất cả các nơi còn lại đều đang lọc đúng `deletedAt: null` (trực tiếp trong `where` hoặc dùng chung biến
`where` đã có điều kiện này). Không cần sửa thêm code nào khác trong task này.

## Test hồi quy đã thêm

`apps/backend/src/categories/categories.service.spec.ts` — kiểm tra `findAll()` và `findOne()` đều gọi
Prisma với `_count.select.products.where.deletedAt = null`, để nếu sau này có ai vô tình xoá điều kiện lọc
này, test sẽ báo đỏ ngay.

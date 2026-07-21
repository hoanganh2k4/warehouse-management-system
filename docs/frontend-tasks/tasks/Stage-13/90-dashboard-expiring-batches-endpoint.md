# Task 90 [BACKEND] — API `GET /dashboard/expiring-batches` — danh sách chi tiết hàng sắp hết hạn

## 🎯 Mục tiêu
Thêm endpoint mới trả **danh sách chi tiết** các lô hàng sắp/đã hết hạn (mã lô, sản phẩm, vị trí, số ngày
còn lại, trạng thái), dùng lại `getExpiryStatus` từ Task 89 — thay vì chỉ có con số đếm `expiringSoon` như
hiện tại ở `GET /dashboard/summary`.

**Điều kiện tiên quyết: Task 89 đã merge (cần `common/utils/expiry.util.ts`).**

## 📖 Giải thích nghiệp vụ
`GET /dashboard/summary` hiện chỉ trả `expiringSoon: number` (đếm số batch sắp hết hạn trong 30 ngày, còn
tồn kho > 0) — nhân viên kho biết "có 5 lô sắp hết hạn" nhưng không biết **lô nào, ở đâu, còn bao nhiêu
ngày** mà không phải mở riêng trang Batches rồi tự lọc bằng mắt. Task này thêm 1 API riêng, trả đủ thông tin
để FE (Task 106) render thẳng thành bảng/danh sách trên Dashboard.

**Không đổi `GET /dashboard/summary` trong task này** (giữ nguyên `expiringSoon` là số đếm, để không phá vỡ
FE đang dùng) — thêm endpoint mới song song, đúng tinh thần "atomic task, không đổi API cũ khi không bắt
buộc".

## 🧠 Giải thích NestJS/Prisma cần biết
- Endpoint mới, method riêng trong `DashboardService`, route riêng trong `DashboardController` — không sửa
  `getSummary()`.
- Query lấy `Batch` có `inventories.some.quantity > 0` (còn tồn kho, giống điều kiện `expiringSoon` hiện
  tại) và `expiryDate <= hôm nay + 30 ngày` (dùng đúng `EXPIRY_WARNING_DAYS` từ Task 89 thay vì hardcode lại
  số 30 lần thứ 2 trong code — import constant, không copy giá trị).
- Với mỗi batch, cần trả vị trí (zone/rack/level/slot) — dùng `formatSlotLocation` đã có sẵn trong
  `common/utils/location.util.ts` (đang được `inventory.service.ts` dùng), không viết lại logic format vị
  trí lần 2.
- Sắp xếp theo `expiryDate` tăng dần (lô gần hết hạn nhất lên đầu) để FE không cần tự sort lại.

## 📖 Các file cần đọc trước
- `apps/backend/src/common/utils/expiry.util.ts` (từ Task 89)
- `apps/backend/src/common/utils/location.util.ts` (hàm `formatSlotLocation`)
- `apps/backend/src/dashboard/dashboard.service.ts`, `dashboard.controller.ts` (toàn bộ)
- `apps/backend/src/inventory/inventory.service.ts` (đoạn dùng `formatSlotLocation` trong `toInventoryView`,
  để copy đúng cách gọi)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/dashboard/dashboard.service.ts` (thêm method mới `getExpiringBatches()`, không sửa
  `getSummary()`/`getChart()`)
- Sửa: `apps/backend/src/dashboard/dashboard.controller.ts` (thêm route mới `GET /dashboard/expiring-batches`)

## 📂 File KHÔNG được sửa
- `common/utils/expiry.util.ts`, `common/utils/location.util.ts` (chỉ import, không sửa)
- Method `getSummary()`, `getChart()` trong `dashboard.service.ts`
- Bất kỳ file frontend nào (Task 106 ở Stage 18 sẽ dùng API này)

## 🔌 API cần dùng (API MỚI thêm ở task này)
`GET /dashboard/expiring-batches` (yêu cầu quyền Manager, giống `summary`/`chart` hiện có — dùng chung
decorator `@Roles(MANAGER_ROLE)`).

Response mẫu:
```json
[
  {
    "batchId": "uuid",
    "batchCode": "LOT-2026-001",
    "productSkuCode": "SKU001",
    "productName": "Sữa tươi 1L",
    "expiryDate": "2026-07-25T00:00:00.000Z",
    "expiryStatus": "CRITICAL",
    "daysUntilExpiry": 4,
    "quantity": 80,
    "locations": ["A-01-02-05", "A-01-03-01"]
  }
]
```
(`locations` là mảng vì 1 batch có thể nằm rải ở nhiều slot — không gộp nhầm về 1 vị trí duy nhất.)

## 🪜 Các bước thực hiện
1. Trong `dashboard.service.ts`, import `getExpiryStatus`, `EXPIRY_WARNING_DAYS` từ `expiry.util.ts` và
   `formatSlotLocation` từ `location.util.ts`.
2. Viết method mới `getExpiringBatches()`:
   - Query `this.prisma.batch.findMany` với `where` giống điều kiện `expiringSoon` hiện có trong
     `getSummary()` (copy đúng điều kiện, dùng `EXPIRY_WARNING_DAYS` thay vì số 30 hardcode), `include`:
     `product` (lấy `skuCode`, `name`) và `inventories` (lấy `quantity`, `slot` với đủ `code`/`level.levelNumber`/
     `level.rack.code`/`level.rack.zone.code` để format vị trí).
   - `orderBy: { expiryDate: 'asc' }`.
   - Map từng batch: tính `getExpiryStatus(batch.expiryDate)`, tính tổng `quantity` (cộng dồn các
     `inventories`), tính mảng `locations` (map từng `inventory.slot` qua `formatSlotLocation`, lọc bỏ
     `inventory.quantity === 0` vì đó là vị trí cũ đã xuất hết).
3. Trong `dashboard.controller.ts`, thêm route:
   ```ts
   @Get('expiring-batches')
   @Roles(MANAGER_ROLE)
   @ApiAuthReadErrors()
   expiringBatches() {
     return this.service.getExpiringBatches();
   }
   ```
   (đặt sau route `chart`, dùng đúng decorator pattern các route khác trong file đang dùng).
4. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code (method mới trong DashboardService)
```ts
async getExpiringBatches() {
  const batches = await this.prisma.batch.findMany({
    where: {
      expiryDate: {
        lte: new Date(Date.now() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000),
      },
      inventories: { some: { quantity: { gt: 0 } } },
    },
    include: {
      product: { select: { skuCode: true, name: true } },
      inventories: {
        where: { quantity: { gt: 0 } },
        select: {
          quantity: true,
          slot: {
            select: {
              code: true,
              level: {
                select: {
                  levelNumber: true,
                  rack: {
                    select: { code: true, zone: { select: { code: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { expiryDate: 'asc' },
  });

  return batches.map((batch) => {
    const { status, daysUntilExpiry } = getExpiryStatus(batch.expiryDate);
    const quantity = batch.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    const locations = batch.inventories.map((inv) =>
      formatSlotLocation({
        zoneCode: inv.slot.level.rack.zone.code,
        rackCode: inv.slot.level.rack.code,
        levelNumber: inv.slot.level.levelNumber,
        slotCode: inv.slot.code,
      }),
    );

    return {
      batchId: batch.id,
      batchCode: batch.batchCode,
      productSkuCode: batch.product.skuCode,
      productName: batch.product.name,
      expiryDate: batch.expiryDate,
      expiryStatus: status,
      daysUntilExpiry,
      quantity,
      locations,
    };
  });
}
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/90.txt`

## ✅ Checklist nghiệm thu
- ☐ `GET /dashboard/expiring-batches` hoạt động, yêu cầu quyền Manager giống `summary`/`chart`
- ☐ Response là mảng, mỗi phần tử có đủ `batchId, batchCode, productSkuCode, productName, expiryDate,
  expiryStatus, daysUntilExpiry, quantity, locations`
- ☐ `locations` là mảng, đúng số lượng slot đang chứa batch đó (không gộp về 1 vị trí)
- ☐ Sort theo `expiryDate` tăng dần
- ☐ Dùng `EXPIRY_WARNING_DAYS` từ `expiry.util.ts`, không hardcode lại số 30
- ☐ `getSummary()` và `getChart()` không bị đổi
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Hardcode lại `30 * 24 * 60 * 60 * 1000`** thay vì dùng `EXPIRY_WARNING_DAYS` import từ Task 89 → sau này
  ai đổi ngưỡng cảnh báo chỉ sửa 1 chỗ mà quên chỗ này, tạo lỗi lệch số liệu y hệt bài học ở Task 86.
- **Không lọc `inventory.quantity: { gt: 0 }` trong `include.inventories`** → hiển thị cả những slot batch
  đó đã xuất hết hàng (quantity = 0), gây thông tin sai vị trí thực tế đang tồn.
- **Gộp `locations` thành 1 string nối dấu phẩy ngay tại backend** → làm cứng định dạng hiển thị, nên trả
  mảng để FE tự quyết định cách hiển thị (danh sách, badge, v.v.).

## 🔄 Cách test
1. `npm run start:dev --workspace=backend`, gọi `GET /dashboard/expiring-batches` qua Swagger (cần đăng nhập
   role Manager).
2. Sửa `expiryDate` của 1 batch trong Prisma Studio thành trong vòng 5 ngày tới → gọi lại API, batch đó phải
   xuất hiện với `expiryStatus: "CRITICAL"`.
3. Kiểm tra 1 batch nằm ở 2 slot khác nhau → `locations` phải có đúng 2 phần tử.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/dashboard/dashboard.service.ts apps/backend/src/dashboard/dashboard.controller.ts
```

## 📝 Commit message
```
feat(dashboard): add GET /dashboard/expiring-batches with detailed batch list
```

## 🔀 PR title
```
[Task 90] Add detailed expiring-batches endpoint to Dashboard
```

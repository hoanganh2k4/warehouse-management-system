# Task 89 [BACKEND] — Thêm `expiryStatus` (OK/WARNING/CRITICAL/EXPIRED) cho Batch & Inventory API

## 🎯 Mục tiêu
Tạo hàm dùng chung tính trạng thái hết hạn từ `expiryDate`, và gắn kết quả (`expiryStatus`,
`daysUntilExpiry`) vào response của `GET /batches`, `GET /batches/:id`, `GET /inventory`, `GET /inventory/:id`
— để frontend có dữ liệu cụ thể quyết định hiển thị màu/badge cảnh báo, thay vì phải tự tính lại (hoặc
không tính được vì thiếu dữ liệu).

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
Đã xác nhận trong code: `GET /inventory` và `GET /inventory/:id`
(`apps/backend/src/inventory/inventory.service.ts`, hàm `toInventoryView`) **hoàn toàn không trả về
`expiryDate`** — `select` của `batch` chỉ lấy `batchCode` và `product`, không lấy `expiryDate`. Đây là lý do
"Hàng hết hạn chưa có dữ liệu cụ thể" đúng nghĩa đen: FE không có dữ liệu để hiển thị, không phải chỉ là
thiếu UI.

Riêng `GET /batches` (`batches.service.ts`) đã trả `expiryDate` thô (vì `include: { product: true, ... }`
lấy nguyên `Batch`), nhưng cũng chưa có trạng thái tính sẵn (OK/sắp hết hạn/đã hết hạn) — FE phải tự so sánh
ngày, dễ sai lệch giữa các trang nếu mỗi nơi tự viết logic riêng (giống lỗi đồng bộ ở Task 86).

## 🧠 Giải thích NestJS/TypeScript cần biết
- Tạo 1 hàm thuần (pure function) dùng chung, đặt trong `common/utils/` để mọi service dùng lại được, tránh
  mỗi service tự viết 1 kiểu ngưỡng khác nhau (lặp lại đúng bài học từ Task 86).
- Ngưỡng đề xuất (có thể chỉnh qua constant, không hardcode rải rác):
  - `EXPIRED`: `expiryDate < hôm nay`
  - `CRITICAL`: còn ≤ 7 ngày
  - `WARNING`: còn ≤ 30 ngày (khớp đúng ngưỡng 30 ngày đang dùng ở `dashboard.service.ts` cho
    `expiringSoon`, để không tạo thêm 1 ngưỡng thứ 3 gây lệch số liệu)
  - `OK`: còn > 30 ngày

## 📖 Các file cần đọc trước
- `apps/backend/src/inventory/inventory.service.ts` (toàn bộ, đặc biệt `findAll`, `findOne`,
  `toInventoryView`)
- `apps/backend/src/batches/batches.service.ts` (toàn bộ)
- `apps/backend/src/dashboard/dashboard.service.ts` (đoạn tính `expiringSoon`, để lấy đúng ngưỡng 30 ngày
  đang dùng, đảm bảo nhất quán)

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/backend/src/common/utils/expiry.util.ts`
- Sửa: `apps/backend/src/inventory/inventory.service.ts` (thêm `expiryDate` vào `select`, gắn
  `expiryStatus`/`daysUntilExpiry` trong `toInventoryView`)
- Sửa: `apps/backend/src/batches/batches.service.ts` (gắn `expiryStatus`/`daysUntilExpiry` vào từng batch
  trả về ở `findAll`/`findOne`)
- Tạo mới (khuyến khích): `apps/backend/src/common/utils/expiry.util.spec.ts`

## 📂 File KHÔNG được sửa
- `apps/backend/src/dashboard/dashboard.service.ts` (việc dùng hàm mới ở Dashboard là Task 90, để tách nhỏ
  PR)
- `apps/backend/prisma/schema.prisma`
- Bất kỳ file frontend nào (Task 105 ở Stage 18 sẽ dùng field mới này)

## 🔌 API cần dùng
- `GET /batches`, `GET /batches/:id` — thêm field `expiryStatus`, `daysUntilExpiry` vào mỗi batch.
- `GET /inventory`, `GET /inventory/:id` — thêm field `expiryDate`, `expiryStatus`, `daysUntilExpiry` vào
  mỗi item (hiện hoàn toàn chưa có `expiryDate`, phải thêm cả field gốc lẫn field tính toán).

## 🪜 Các bước thực hiện
1. Tạo `common/utils/expiry.util.ts` với:
   - `export const EXPIRY_WARNING_DAYS = 30;`
   - `export const EXPIRY_CRITICAL_DAYS = 7;`
   - `export type ExpiryStatus = 'OK' | 'WARNING' | 'CRITICAL' | 'EXPIRED';`
   - `export function getExpiryStatus(expiryDate: Date): { status: ExpiryStatus; daysUntilExpiry: number }`
     — tính số ngày còn lại (làm tròn xuống theo ngày dương lịch, không tính giờ/phút) và trạng thái tương
     ứng theo ngưỡng ở trên.
2. Trong `inventory.service.ts`:
   - Thêm `expiryDate: true` vào `batch.select` ở cả 2 chỗ `findAll` và `findOne`.
   - Sửa type tham số và phần return của `toInventoryView` để nhận thêm `batch.expiryDate`, gọi
     `getExpiryStatus(item.batch.expiryDate)`, trả thêm 3 field: `expiryDate`, `expiryStatus`,
     `daysUntilExpiry`.
3. Trong `batches.service.ts`:
   - Viết 1 hàm nhỏ `attachExpiryStatus(batch)` (hoặc map trực tiếp) áp dụng `getExpiryStatus` lên
     `batch.expiryDate`, trả về `{ ...batch, expiryStatus, daysUntilExpiry }`.
   - Áp dụng cho từng item trong mảng kết quả `findAll` (dùng `.map`) và cho kết quả `findOne`.
4. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
```ts
// apps/backend/src/common/utils/expiry.util.ts
export const EXPIRY_WARNING_DAYS = 30;
export const EXPIRY_CRITICAL_DAYS = 7;

export type ExpiryStatus = 'OK' | 'WARNING' | 'CRITICAL' | 'EXPIRED';

export function getExpiryStatus(expiryDate: Date): {
  status: ExpiryStatus;
  daysUntilExpiry: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(expiryDate);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const daysUntilExpiry = Math.round(diffMs / (24 * 60 * 60 * 1000));

  let status: ExpiryStatus;
  if (daysUntilExpiry < 0) status = 'EXPIRED';
  else if (daysUntilExpiry <= EXPIRY_CRITICAL_DAYS) status = 'CRITICAL';
  else if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) status = 'WARNING';
  else status = 'OK';

  return { status, daysUntilExpiry };
}
```

```ts
// inventory.service.ts — trong toInventoryView, sau khi thêm expiryDate vào select
import { getExpiryStatus } from '../common/utils/expiry.util';

function toInventoryView(item: {
  // ...các field cũ...
  batch: {
    batchCode: string;
    expiryDate: Date;
    product: { skuCode: string; name: string };
  };
  // ...
}) {
  const { status, daysUntilExpiry } = getExpiryStatus(item.batch.expiryDate);
  return {
    // ...các field cũ...
    expiryDate: item.batch.expiryDate,
    expiryStatus: status,
    daysUntilExpiry,
  };
}
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/89.txt`

## ✅ Checklist nghiệm thu
- ☐ `expiry.util.ts` xuất `getExpiryStatus`, ngưỡng `WARNING = 30 ngày`, `CRITICAL = 7 ngày` (khớp ngưỡng
  30 ngày Dashboard đang dùng cho `expiringSoon`)
- ☐ `GET /inventory` và `GET /inventory/:id` trả thêm `expiryDate`, `expiryStatus`, `daysUntilExpiry` cho
  mỗi item
- ☐ `GET /batches` và `GET /batches/:id` trả thêm `expiryStatus`, `daysUntilExpiry` cho mỗi batch
- ☐ Không đổi field nào khác trong response cũ (chỉ thêm field mới)
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Dùng ngưỡng khác 30 ngày** cho WARNING (vd tự chọn 14 ngày) → lệch với `expiringSoon` ở Dashboard, tạo
  ra bug đồng bộ mới giống Task 86 vừa sửa. Bắt buộc dùng đúng 30 ngày.
- **Tính `daysUntilExpiry` bằng cách trừ trực tiếp `Date` có giờ/phút** (không set `setHours(0,0,0,0)`) →
  kết quả lệch 1 ngày tuỳ giờ chạy server, gây hiển thị sai ở biên (vd còn đúng 7 ngày 23 giờ bị tính thành
  8 ngày).
- **Quên thêm `expiryDate: true` vào `select` của `inventory.service.ts`** → gọi `getExpiryStatus(undefined)`
  sẽ crash lúc runtime dù build TypeScript vẫn qua nếu quên cập nhật type tham số.

## 🔄 Cách test
1. `npm run start:dev --workspace=backend`.
2. Gọi `GET /batches` qua Swagger — mỗi batch phải có `expiryStatus`/`daysUntilExpiry`.
3. Gọi `GET /inventory` — mỗi item phải có thêm `expiryDate`, `expiryStatus`, `daysUntilExpiry`.
4. Vào Prisma Studio, sửa `expiryDate` của 1 batch thành ngày mai → gọi lại API, batch đó phải ra
   `CRITICAL`. Sửa thành hôm qua → phải ra `EXPIRED`.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/inventory/inventory.service.ts apps/backend/src/batches/batches.service.ts
rm apps/backend/src/common/utils/expiry.util.ts
```

## 📝 Commit message
```
feat(expiry): add shared expiry-status util and expose it on Batch/Inventory APIs
```

## 🔀 PR title
```
[Task 89] Add expiryStatus/daysUntilExpiry to Batch and Inventory APIs
```

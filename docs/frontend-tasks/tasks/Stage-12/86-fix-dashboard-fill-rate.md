# Task 86 [BACKEND] — Sửa "Tỷ lệ lấp đầy" ở Dashboard tính theo dung lượng, đồng bộ với Racking

## 🎯 Mục tiêu
Sửa `occupancyPercent` trong `GET /dashboard/summary` để tính **theo dung lượng thực tế**
(`sum(usedCapacity) / sum(maxCapacity)`), thay vì đếm nhị phân "slot có dùng hay không" như hiện tại — để
con số khớp với cách trang Racking đang tính, không còn lệch nhau giữa 2 màn hình.

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể, không suy đoán)
Hiện có **2 công thức khác nhau** cho cùng khái niệm "tỷ lệ lấp đầy":

- **Dashboard** (`apps/backend/src/dashboard/dashboard.service.ts`, dòng 27-28 và 57-58):
  ```ts
  this.prisma.slot.count(),                                    // totalSlots
  this.prisma.slot.count({ where: { usedCapacity: { gt: 0 } } }), // occupiedSlots
  ...
  const occupancyPercent = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;
  ```
  → Đây là tỷ lệ **số slot có hàng / tổng số slot**. Một slot chỉ dùng 5% sức chứa vẫn tính như đầy 100%,
  một slot dùng 95% sức chứa cũng chỉ tính như 1 slot "có dùng" — sai lệch nặng so với thực tế.

- **Trang Racking** (`apps/frontend/src/pages/racking/components/RackingGridPanel.tsx`, dòng 41-46):
  ```ts
  const rackTotalCapacity = allSlots.reduce((sum, slot) => sum + slot.maxCapacity, 0);
  const rackUsedCapacity = allSlots.reduce((sum, slot) => sum + slot.usedCapacity, 0);
  const rackPercent = rackTotalCapacity > 0 ? (rackUsedCapacity / rackTotalCapacity) * 100 : 0;
  ```
  → Đây mới là công thức **đúng theo dung lượng**, tính từ field `usedCapacity`/`maxCapacity` vốn đã được
  đồng bộ sẵn trên từng `Slot` (qua `SlotCapacityService`, gọi mỗi khi Inventory thay đổi).

Vì 2 nơi dùng 2 công thức khác nhau, số "Tỷ lệ lấp đầy" trên Dashboard và số "Tỷ lệ sử dụng" trên Racking
luôn lệch nhau — đây chính là hiện tượng anh mô tả là "sai sót, chưa đồng bộ". Cách sửa đúng đắn nhất là làm
Dashboard dùng **chung công thức** với Racking (cả hai đều lấy từ `Slot.usedCapacity`/`maxCapacity`, vốn là
nguồn dữ liệu duy nhất, không tạo thêm nguồn số liệu thứ 3).

## 🧠 Giải thích NestJS/Prisma cần biết
- Có thể tính `sum(usedCapacity)`/`sum(maxCapacity)` bằng `this.prisma.slot.aggregate({ _sum: { usedCapacity: true, maxCapacity: true } })` — 1 query, không cần load hết record `Slot` về rồi cộng tay ở Node.
- Giữ lại `occupiedSlots`/`totalSlots`/`availableSlots` (đếm slot) vì đây là 2 chỉ số **khác nhau, đều hữu
  ích**: "bao nhiêu slot đang có hàng" (đếm slot) vs "phần trăm dung lượng đã dùng" (tính theo capacity). Chỉ
  đổi **công thức tính `occupancyPercent`**, không xoá field nào khác trong response.

## 📖 Các file cần đọc trước
- `apps/backend/src/dashboard/dashboard.service.ts` (toàn bộ, 115 dòng)
- `apps/frontend/src/pages/racking/components/RackingGridPanel.tsx` (dòng 30-50, chỉ để đối chiếu công
  thức, KHÔNG sửa file này ở task này)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/dashboard/dashboard.service.ts` (chỉ hàm `getSummary()`)
- Tạo mới (khuyến khích, không bắt buộc): `apps/backend/src/dashboard/dashboard.service.spec.ts` nếu chưa
  có, viết unit test cho công thức mới

## 📂 File KHÔNG được sửa
- `apps/backend/src/dashboard/dashboard.controller.ts`
- Bất kỳ file `.tsx`/`.ts` nào trong `apps/frontend` (task frontend tương ứng là Task 104 ở Stage 18)
- Hàm `getChart()` trong cùng file — không liên quan tới task này

## 🔌 API cần dùng
`GET /dashboard/summary` — response giữ nguyên các field cũ, chỉ đổi cách tính giá trị `occupancyPercent`.
Không đổi shape response (không thêm/xoá key) trong task này để tránh vỡ FE đang dùng — việc thêm field chi
tiết hơn (nếu cần) để dành cho Stage 18 nếu FE yêu cầu.

## 🪜 Các bước thực hiện
1. Mở `dashboard.service.ts`, trong `Promise.all` ở `getSummary()`, thêm 1 query mới:
   ```ts
   this.prisma.slot.aggregate({ _sum: { usedCapacity: true, maxCapacity: true } }),
   ```
   (đặt cạnh các query `slot.count` hiện có, nhớ thêm biến tương ứng vào phần destructure mảng kết quả).
2. Sau khối `Promise.all`, thay công thức cũ:
   ```ts
   const occupancyPercent =
     totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;
   ```
   bằng:
   ```ts
   const totalCapacity = slotCapacityAgg._sum.maxCapacity ?? 0;
   const usedCapacityTotal = slotCapacityAgg._sum.usedCapacity ?? 0;
   const occupancyPercent =
     totalCapacity > 0
       ? Math.round((usedCapacityTotal / totalCapacity) * 100)
       : 0;
   ```
   (đặt tên biến query mới là `slotCapacityAgg`, khớp với vị trí thêm ở bước 1).
3. Giữ nguyên toàn bộ field khác trong object trả về (`products`, `batches`, `totalSlots`, `availableSlots`,
   `occupiedSlots`, `inventory`, `expiringSoon`, `inboundToday`, `outboundToday`) — chỉ giá trị
   `occupancyPercent` được tính lại theo công thức mới.
4. Chạy `npm run build --workspace=backend`, không lỗi TypeScript.
5. Gọi thử `GET /dashboard/summary` (Swagger UI), so sánh `occupancyPercent` với con số "Tỷ lệ sử dụng" hiện
   ra ở trang Racking (cộng dồn thủ công qua vài rack nếu cần) — 2 số phải cùng logic (dùng chung công thức
   capacity-based, có thể không giống hệt về mặt số nếu Racking đang lọc theo rack cụ thể, nhưng công thức
   nền tảng phải nhất quán).

## 💻 Ví dụ code (đoạn diff minh hoạ đầy đủ hàm `getSummary`)
```ts
async getSummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    products,
    batches,
    totalSlots,
    occupiedSlots,
    slotCapacityAgg,
    inventoryAgg,
    expiringSoon,
    inboundToday,
    outboundToday,
  ] = await Promise.all([
    this.prisma.product.count({ where: { deletedAt: null } }),
    this.prisma.batch.count(),
    this.prisma.slot.count(),
    this.prisma.slot.count({ where: { usedCapacity: { gt: 0 } } }),
    this.prisma.slot.aggregate({
      _sum: { usedCapacity: true, maxCapacity: true },
    }),
    this.prisma.inventory.aggregate({ _sum: { quantity: true } }),
    this.prisma.batch.count({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
        inventories: { some: { quantity: { gt: 0 } } },
      },
    }),
    this.prisma.transaction.aggregate({
      where: {
        type: TransactionType.IMPORT,
        createdAt: { gte: today, lt: tomorrow },
      },
      _sum: { quantity: true },
    }),
    this.prisma.transaction.aggregate({
      where: {
        type: TransactionType.EXPORT,
        createdAt: { gte: today, lt: tomorrow },
      },
      _sum: { quantity: true },
    }),
  ]);

  const totalInventory = inventoryAgg._sum.quantity ?? 0;
  const availableSlots = totalSlots - occupiedSlots;

  const totalCapacity = slotCapacityAgg._sum.maxCapacity ?? 0;
  const usedCapacityTotal = slotCapacityAgg._sum.usedCapacity ?? 0;
  const occupancyPercent =
    totalCapacity > 0
      ? Math.round((usedCapacityTotal / totalCapacity) * 100)
      : 0;

  return {
    products,
    batches,
    totalSlots,
    availableSlots,
    occupiedSlots,
    occupancyPercent,
    inventory: totalInventory,
    expiringSoon,
    inboundToday: inboundToday._sum.quantity ?? 0,
    outboundToday: outboundToday._sum.quantity ?? 0,
  };
}
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/86.txt`

## ✅ Checklist nghiệm thu
- ☐ `occupancyPercent` tính bằng `sum(usedCapacity) / sum(maxCapacity) * 100`, không còn dùng
  `occupiedSlots / totalSlots`
- ☐ Response `GET /dashboard/summary` vẫn đủ nguyên các field cũ, không đổi shape
- ☐ `occupiedSlots`/`totalSlots`/`availableSlots` vẫn giữ nguyên cách tính cũ (đếm slot, không đổi)
- ☐ Chỉ 1 query `aggregate` mới được thêm, không tạo N+1 query
- ☐ `npm run build --workspace=backend` không lỗi
- ☐ Test thủ công qua Swagger: `occupancyPercent` giờ phản ánh đúng tỷ lệ dung lượng (vd toàn bộ slot cùng
  dùng 50% sức chứa thì phải ra ~50%, không phải 100% dù slot nào cũng "có hàng")

## ❌ Lỗi thường gặp
- **Quên xử lý case tất cả slot chưa có `maxCapacity`** (totalCapacity = 0) → chia cho 0, phải giữ điều
  kiện `totalCapacity > 0 ? ... : 0` như ví dụ.
- **Xoá nhầm `occupiedSlots`/`totalSlots` khỏi response** vì tưởng không cần nữa — 2 field này FE Dashboard
  đang dùng ở nơi khác (card "Số slot đang dùng"), phải giữ lại, chỉ đổi công thức của riêng
  `occupancyPercent`.
- **Đặt sai vị trí biến mới trong mảng destructure của `Promise.all`** → lấy nhầm giá trị cho biến khác, TypeScript vẫn build được nhưng chạy sai dữ liệu (không có type check theo vị trí mảng).

## 🔄 Cách test
1. `npm run start:dev --workspace=backend`, gọi `GET /dashboard/summary` qua Swagger.
2. Vào Prisma Studio, sửa tay `usedCapacity` của vài slot để tạo case dễ tính nhẩm (vd 2 slot, mỗi slot
   `maxCapacity = 100`, 1 slot `usedCapacity = 100`, 1 slot `usedCapacity = 0`) → gọi lại API, `occupancyPercent`
   phải ra 50 (trước đây công thức cũ cũng ra 50 vì tình cờ trùng do chỉ có 1/2 slot "có hàng" — thử thêm
   case slot thứ 3 `maxCapacity = 100, usedCapacity = 10` để thấy công thức cũ/mới thực sự khác nhau: cũ =
   66% (2/3 slot có hàng), mới = 36% (110/300 dung lượng) — mới đúng thực tế hơn).
3. Đối chiếu bằng mắt với % hiển thị ở trang Racking cho cùng bộ slot.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/dashboard/dashboard.service.ts
```

## 📝 Commit message
```
fix(dashboard): calculate occupancyPercent by capacity instead of slot count
```

## 🔀 PR title
```
[Task 86] Fix dashboard fill rate formula to match Racking (capacity-based)
```

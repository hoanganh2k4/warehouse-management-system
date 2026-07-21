# Task 94 [BACKEND] — Hàng nặng ưu tiên xếp xuống level thấp nhất còn hợp lệ

## 🎯 Mục tiêu
Sửa `SlotScoringService` để sản phẩm đánh dấu `isHeavy = true` được **ưu tiên thật sự** vào level thấp nhất
còn phù hợp (không chỉ loại bỏ level cao như hiện tại), còn sản phẩm tiêu chuẩn (`isHeavy = false`) **giữ
nguyên hành vi chấm điểm hiện tại**, không bị ảnh hưởng.

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
Đã xác nhận trong `apps/backend/src/common/services/slot-scoring.service.ts`:

- Hàm `isValidSlot` (dòng 86-88):
  ```ts
  if (product.isHeavy && slot.level.levelNumber > 2) {
    return false;
  }
  ```
  → Đây chỉ là bộ lọc **loại trừ** (hàng nặng không được vào level > 2), KHÔNG có nghĩa là hàng nặng sẽ
  **được ưu tiên** vào level 1 trước level 2. Cả 2 level (1 và 2) đều "hợp lệ" như nhau đối với thuật toán
  chấm điểm hiện tại.
- Hàm `computeScore` (dòng 93-109) hoàn toàn không dùng tham số `product` (đặt tên `_product` với dấu gạch
  dưới — quy ước TypeScript/ESLint để đánh dấu tham số **cố tình không dùng tới**). Công thức chấm điểm
  `0.4*D + 0.3*F + 0.2*C + 0.1*O` áp dụng y hệt cho mọi sản phẩm, không phân biệt hàng nặng/tiêu chuẩn, và
  không có thành phần nào ưu tiên level thấp. Slot ở level 2 hoàn toàn có thể được chọn trước slot ở level 1
  nếu nó gần cổng hơn (điểm D cao hơn) — đúng như hiện tượng "hàng nặng chưa được ưu tiên xếp xuống dưới".

## 🧠 Giải thích thuật toán cần biết
- Thêm 1 thành phần điểm mới **L (Level score)**: `L = 1 - (levelNumber - 1) / (maxLevelNumber - 1)` — level
  càng thấp, điểm càng cao (level 1 → L = 1, level cao nhất hợp lệ → L thấp nhất). Nếu chỉ có 1 level hợp lệ
  duy nhất, `maxLevelNumber - 1 = 0`, phải xử lý chia-cho-0 (trả `L = 1`).
- **Chỉ áp dụng trọng số cao cho `L` khi `product.isHeavy === true`.** Với sản phẩm tiêu chuẩn, giữ đúng
  công thức cũ (không đổi trọng số, không đổi kết quả) — đây là yêu cầu tường minh của anh: "hàng tiêu chuẩn
  thì xếp bình thường".
- Đề xuất bộ trọng số cho hàng nặng: `0.5*L + 0.2*D + 0.2*F + 0.1*C` (loại bỏ `O` — tần suất xuất không quan
  trọng bằng việc đặt đúng vị trí an toàn cho hàng nặng). Bộ trọng số cho hàng tiêu chuẩn giữ nguyên
  `0.4*D + 0.3*F + 0.2*C + 0.1*O` như cũ.

## 📖 Các file cần đọc trước
- `apps/backend/src/common/services/slot-scoring.service.ts` (toàn bộ, 129 dòng)
- `apps/backend/prisma/schema.prisma` — model `Product` (field `isHeavy`), model `Level` (field
  `levelNumber`)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/common/services/slot-scoring.service.ts` (hàm `computeScore`, thêm hàm private mới
  `computeLevelScore`, sửa lời gọi trong `findBestSlots` để truyền thêm dữ liệu cần thiết — ví dụ danh sách
  level hợp lệ để tính `maxLevelNumber`)

## 📂 File KHÔNG được sửa
- Hàm `isValidSlot` (Task này KHÔNG đổi điều kiện loại trừ level > 2 cho hàng nặng — giữ nguyên, chỉ thêm
  ưu tiên bên trong tập hợp level đã hợp lệ)
- Hàm `computeFefoScore`
- Bất kỳ file nào khác gọi `SlotScoringService` (ví dụ `schedules.service.ts`) — hàm `findBestSlots` giữ
  nguyên chữ ký (signature), không đổi cách gọi từ bên ngoài

## 🔌 API cần dùng
Không có API mới — đây là task thuật toán nội bộ, ảnh hưởng gián tiếp tới response của
`POST /schedules/inbound` (preview gợi ý vị trí).

## 🪜 Các bước thực hiện
1. Trong `findBestSlots`, sau khi có mảng `valid` (slot đã lọc qua `isValidSlot`), tính
   `const maxLevelNumber = Math.max(...valid.map((s) => s.level.levelNumber), 1);` (đặt cạnh
   `maxDistance`/`maxFrequency` hiện có, tái dùng đúng pattern code sẵn có).
2. Sửa lời gọi `this.computeScore(...)` trong `scored` — truyền thêm `maxLevelNumber` làm tham số mới:
   ```ts
   score: this.computeScore(slot, product, incomingExpiry, maxDistance, maxFrequency, maxLevelNumber),
   ```
3. Sửa chữ ký `computeScore` — đổi tên tham số `_product` thành `product` (bỏ dấu gạch dưới, giờ đã dùng
   tới), thêm tham số `maxLevelNumber: number`:
   ```ts
   private computeScore(
     slot: Slot & {
       currentProduct: Product | null;
       inventories: { batch: { expiryDate: Date } }[];
       level: { levelNumber: number };
     },
     product: Product,
     incomingExpiry: Date,
     maxDistance: number,
     maxFrequency: number,
     maxLevelNumber: number,
   ): number {
   ```
   (lưu ý: cần thêm `level: { levelNumber: number }` vào type của `slot` vì hàm này trước đó không khai báo
   field `level` trong type tham số dù dữ liệu thực tế đã có sẵn từ `include` ở `findBestSlots`).
4. Thêm hàm private mới `computeLevelScore`:
   ```ts
   private computeLevelScore(levelNumber: number, maxLevelNumber: number): number {
     if (maxLevelNumber <= 1) return 1;
     return 1 - (levelNumber - 1) / (maxLevelNumber - 1);
   }
   ```
5. Trong `computeScore`, sau khi tính `D, C, O, F` như cũ, thêm:
   ```ts
   const L = this.computeLevelScore(slot.level.levelNumber, maxLevelNumber);

   if (product.isHeavy) {
     return 0.5 * L + 0.2 * D + 0.2 * F + 0.1 * C;
   }
   return 0.4 * D + 0.3 * F + 0.2 * C + 0.1 * O;
   ```
6. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
Xem đầy đủ các đoạn ở mục "Các bước thực hiện" — ghép lại là toàn bộ thay đổi cần làm.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/94.txt`

## ✅ Checklist nghiệm thu
- ☐ Hàng nặng (`isHeavy = true`) với 2 slot cùng điều kiện khác nhau chỉ ở level (1 slot level 1, 1 slot
  level 2, còn lại các yếu tố khác như nhau) → slot level 1 luôn được chọn trước
- ☐ Hàng tiêu chuẩn (`isHeavy = false`) với cùng 2 slot trên → kết quả chọn **giống hệt như trước khi sửa**
  (không bị ảnh hưởng bởi thay đổi)
- ☐ `isValidSlot` không bị đổi (hàng nặng vẫn bị loại khỏi level > 2 như cũ)
- ☐ Chữ ký `findBestSlots(product, quantity, incomingExpiry)` không đổi — nơi gọi hàm này
  (`schedules.service.ts`) không cần sửa gì
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Áp dụng trọng số mới `L` cho cả hàng tiêu chuẩn** → vi phạm yêu cầu "hàng tiêu chuẩn xếp bình thường",
  đổi luôn cả hành vi cũ đang hoạt động đúng.
- **Quên xử lý `maxLevelNumber <= 1`** (chỉ có 1 level hợp lệ, ví dụ kho nhỏ chỉ có level 1-2 và hàng nặng
  bị giới hạn chỉ còn level 1) → chia cho 0, `NaN` lan ra toàn bộ điểm số, mọi slot đều có `score = NaN`,
  `sort` sẽ cho kết quả không xác định.
- **Đổi `isValidSlot`** (ví dụ nới lỏng hay siết thêm điều kiện level > 2) → không đúng phạm vi task này,
  Task 94 chỉ ưu tiên THỨ TỰ trong tập hợp đã hợp lệ, không đổi tập hợp hợp lệ.

## 🔄 Cách test
1. Vào Prisma Studio, tạo/kiểm tra 1 sản phẩm có `isHeavy = true`.
2. Đảm bảo có ít nhất 2 slot còn trống ở level 1 và level 2 của cùng 1 rack, dung lượng đủ chứa.
3. Gọi API preview đặt lịch nhập (`POST /schedules/inbound` với `dryRun`/preview nếu có, hoặc xem log/response
   `allocations` trả về) cho sản phẩm hàng nặng — slot ở level 1 phải xuất hiện với điểm cao hơn, được chọn
   trước.
4. Lặp lại bước 3 với 1 sản phẩm `isHeavy = false` — kết quả thứ tự chọn phải giống hệt trước khi sửa code
   (so sánh với kết quả chạy trên bản code cũ nếu cần).

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/common/services/slot-scoring.service.ts
```

## 📝 Commit message
```
feat(slot-scoring): prioritize lowest valid level for heavy products
```

## 🔀 PR title
```
[Task 94] Heavy products now prioritize the lowest valid rack level
```

# Task 95 [BACKEND] — Ưu tiên lấp Slot 1 trước khi điểm số ngang nhau (tie-break theo mã slot)

## 🎯 Mục tiêu
Đảm bảo trong cùng 1 level, khi nhiều slot có điểm số (`score`) gần bằng nhau, thuật toán **ưu tiên chọn
slot có mã số nhỏ nhất (Slot 1 trước Slot 2, Slot 2 trước Slot 3...)** — khắc phục hiện tượng "Slot 1 của
các level không được sử dụng hết, các slot khác lại được lấp đầy trước".

**Điều kiện tiên quyết: Task 94 nên merge trước** (để không bị conflict khi cả 2 task cùng sửa
`computeScore`/`findBestSlots` — nếu Task 94 chưa merge, làm Task 95 trước cũng được nhưng cần merge cẩn
thận, không bắt buộc thứ tự cứng).

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
`findBestSlots` (dòng 49): `scored.sort((a, b) => b.score - a.score);` — sort duy nhất theo điểm số giảm
dần, **không có tie-break nào khi 2 slot điểm bằng nhau hoặc gần bằng nhau**. Điểm số được tính chủ yếu từ
`distanceToGate` (trọng số 0.4, cao nhất) — nếu dữ liệu `distanceToGate` của Slot 1 trong 1 level không phải
là nhỏ nhất (ví dụ do cách seed/nhập liệu vị trí vật lý không tương quan trực tiếp với số thứ tự slot), Slot
1 hoàn toàn có thể bị xếp sau các slot khác có `distanceToGate` nhỏ hơn — đúng như hiện tượng anh mô tả.

Về mặt vận hành kho thực tế, nhân viên thường mong muốn lấp đầy theo thứ tự vật lý liền kề (Slot 1 → 2 → 3
trong cùng dãy) để dễ kiểm đếm, không nhảy cóc. Cách xử lý đúng: khi 2 slot có điểm số **đủ gần nhau** (chênh
lệch không đáng kể), ưu tiên mã slot nhỏ hơn thay vì để sai số tính toán nhỏ (do khác biệt `distanceToGate`
vài đơn vị) quyết định thứ tự lấp kho.

## 🧠 Giải thích thuật toán cần biết
- Dùng **ngưỡng dung sai (epsilon)** khi so sánh điểm, ví dụ `SCORE_TIE_EPSILON = 0.02` (2%): nếu
  `|scoreA - scoreB| < EPSILON`, coi như ngang điểm, so sánh tiếp bằng mã slot; ngược lại vẫn ưu tiên điểm
  cao hơn như cũ. Không so sánh bằng tuyệt đối (`===`) vì điểm số là số thực (float), hiếm khi bằng tuyệt
  đối dù về bản chất "gần như ngang nhau".
- Mã slot dạng `S01`, `S02`... (xem `seed.ts`, dòng tạo `code: \`S${String(s).padStart(2, '0')}\``) — phải
  tách phần số ra để so sánh SỐ, không so sánh CHUỖI trực tiếp (so chuỗi thì `"S10" < "S2"` theo alphabet,
  sai thứ tự thực tế). Viết hàm nhỏ trích số từ mã: lấy toàn bộ ký tự số trong chuỗi bằng
  `parseInt(code.replace(/\D/g, ''), 10)`.
- Chỉ so sánh tie-break bằng mã slot **giữa các slot cùng level** (so slot khác level theo mã số không có ý
  nghĩa nghiệp vụ) — nếu 2 slot ngang điểm nhưng khác level, vẫn giữ nguyên thứ tự theo điểm (không áp dụng
  tie-break mã slot).

## 📖 Các file cần đọc trước
- `apps/backend/src/common/services/slot-scoring.service.ts` (đặc biệt dòng 38-49, đoạn `sort`)
- `apps/backend/prisma/seed.ts` (dòng tạo `code` cho Slot, để xác nhận đúng định dạng `S01`, `S02`...)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/common/services/slot-scoring.service.ts` (chỉ đoạn `sort` trong `findBestSlots`,
  thêm 1 hàm helper trích số từ mã slot)

## 📂 File KHÔNG được sửa
- `isValidSlot`, `computeFefoScore` — không liên quan tới task này
- `computeScore` (Task 94 phụ trách nội dung công thức điểm; task này chỉ sửa cách SẮP XẾP sau khi đã có
  điểm, không đổi cách TÍNH điểm)

## 🔌 API cần dùng
Không có API mới — ảnh hưởng gián tiếp tới `POST /schedules/inbound` (preview gợi ý vị trí).

## 🪜 Các bước thực hiện
1. Thêm hằng số và hàm helper ở đầu file (sau import, trước class):
   ```ts
   const SCORE_TIE_EPSILON = 0.02;

   function extractSlotNumber(code: string): number {
     const digits = code.replace(/\D/g, '');
     return digits ? parseInt(digits, 10) : 0;
   }
   ```
2. Sửa dòng `scored.sort((a, b) => b.score - a.score);` thành:
   ```ts
   scored.sort((a, b) => {
     const scoreDiff = b.score - a.score;
     const sameLevel = a.level.levelNumber === b.level.levelNumber;

     if (sameLevel && Math.abs(scoreDiff) < SCORE_TIE_EPSILON) {
       return extractSlotNumber(a.code) - extractSlotNumber(b.code);
     }
     return scoreDiff;
   });
   ```
   (Lưu ý: `a.level`/`b.level` cần có sẵn trong object `ScoredSlot` — kiểm tra `include: { level: true }` đã
   có sẵn ở `findBestSlots` dòng 23, nên field này đã tồn tại trên `slot`, không cần thêm gì ở query.)
3. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
Xem đầy đủ ở mục "Các bước thực hiện" — đó là toàn bộ thay đổi.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/95.txt`

## ✅ Checklist nghiệm thu
- ☐ 2 slot cùng level, điểm chênh lệch < 0.02 → slot có mã số nhỏ hơn (S01 trước S02) được xếp lên trước
- ☐ 2 slot cùng level, điểm chênh lệch ≥ 0.02 → vẫn ưu tiên điểm cao hơn như cũ (không bị ép về thứ tự mã
  slot)
- ☐ 2 slot khác level, dù điểm gần bằng nhau → KHÔNG áp dụng tie-break mã slot, giữ nguyên theo điểm
- ☐ `extractSlotNumber("S01") === 1`, `extractSlotNumber("S10") === 10` (so sánh đúng theo số, không theo
  chuỗi)
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **So sánh mã slot bằng chuỗi (`a.code < b.code`)** thay vì trích số ra so sánh → `"S10" < "S2"` theo thứ
  tự chuỗi (ký tự '1' < '2'), dẫn tới Slot 10 bị coi là "nhỏ hơn" Slot 2, sai hoàn toàn so với thứ tự vật lý
  thực tế.
- **Đặt `SCORE_TIE_EPSILON` quá lớn** (vd 0.5) → gần như luôn tie-break theo mã slot, làm mất hết ý nghĩa
  chấm điểm theo khoảng cách/FEFO/dung lượng ban đầu — chỉ nên là ngưỡng nhỏ để xử lý đúng trường hợp "ngang
  điểm thật sự", không lấn át toàn bộ thuật toán.
- **Áp dụng tie-break cả khi khác level** → vô tình ép slot ở level 2 mã nhỏ lên trước slot level 1 mã lớn
  hơn dù điểm gần bằng nhau, sai nghiệp vụ (khác level thì không so sánh mã số).

## 🔄 Cách test
1. Chuẩn bị 1 level có ≥ 3 slot trống (S01, S02, S03), dung lượng và `distanceToGate` gần bằng nhau (chênh
   lệch nhỏ để rơi vào ngưỡng epsilon).
2. Gọi preview đặt lịch nhập cho 1 sản phẩm tiêu chu�3n, số lượng đủ lớn để cần nhiều slot (`splitRequired`)
   — thứ tự `allocations` trả về phải ưu tiên S01 trước S02 trước S03.
3. Test case slot khác level: 1 slot level 1 điểm thấp hơn 1 chút so với slot level 2 nhưng vẫn trong ngưỡng
   epsilon — vì khác level, thứ tự phải theo điểm số (không bị tie-break mã slot ép đổi).

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/common/services/slot-scoring.service.ts
```

## 📝 Commit message
```
fix(slot-scoring): prefer lower slot code as tie-break when scores are near-equal
```

## 🔀 PR title
```
[Task 95] Fill Slot 1 before other slots when scores are near-equal
```

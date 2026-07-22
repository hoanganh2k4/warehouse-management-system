# Task 103 [BACKEND] — Thêm sort ổn định cho "Detail Inventory" (`GET /inventory`)

## 🎯 Mục tiêu
`GET /inventory` (sẽ đóng vai trò **"Detail Inventory"** theo cách gọi mới của anh — xem giải thích Task
102) hiện **hoàn toàn không có `orderBy`** — vá lỗi này để dữ liệu trả về ổn định, liên tiếp giữa các lần
gọi/các trang phân trang, đúng yêu cầu "muốn số liệu... lúc mình tìm nó sẽ ra liên tiếp, liền kề nhau".

**Điều kiện tiên quyết: không phụ thuộc task nào khác trong Stage 17, có thể làm độc lập/song song với Task
101-102, nhưng nên merge sau Task 93 (đã thiết lập convention sort ổn định) để nhất quán cách làm.**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể — lỗi nghiêm trọng hơn cả Task 93)
Đã xác nhận: `apps/backend/src/inventory/inventory.service.ts`, hàm `findAll()`
(`this.prisma.inventory.findMany({ where, ...skipTake(page, limit), select: {...} })`) — **không có dòng
`orderBy` nào cả**, khác với `transactions.service.ts`/`schedules.service.ts` (đã có ít nhất 1 tiêu chí sort
trước khi Task 93 vá thêm tie-break). Đây là mức độ lỗi nặng hơn: không phải "thiếu tie-break khi trùng
nhau", mà là **hoàn toàn không sort** — PostgreSQL trả kết quả theo thứ tự vật lý lưu trữ trên đĩa (có thể
đổi bất cứ lúc nào do `VACUUM`, `UPDATE` làm di chuyển row, index scan khác nhau giữa các lần query) — hai
lần gọi `GET /inventory` liên tiếp, KHÔNG có bất kỳ thay đổi dữ liệu nào ở giữa, vẫn có thể trả về thứ tự
khác nhau. Đây chính là nguồn gốc trực tiếp của than phiền "dữ liệu không liên tiếp, không liền kề" khi tra
cứu.

## 🧠 Giải thích Prisma cần biết
- Thêm `orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }]` — `updatedAt` phản ánh đúng "lần biến động gần
  nhất" của record tồn kho (mỗi lần nhập/xuất đều làm `Inventory.updatedAt` thay đổi vì Prisma tự cập nhật
  field này), `id` làm tie-break tuyệt đối (UUID, không bao giờ trùng) cho trường hợp `updatedAt` bằng nhau
  (2 giao dịch cùng lúc trong 1 `prisma.$transaction`, giống tình huống đã xử lý ở Task 93).

## 📖 Các file cần đọc trước
- `apps/backend/src/inventory/inventory.service.ts` (hàm `findAll`, dòng 33-137)
- `apps/backend/src/schedules/schedules.service.ts` (hàm `findAll` — bản đã sửa ở Task 93, tham khảo đúng
  convention tie-break đã áp dụng)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/inventory/inventory.service.ts` (chỉ thêm `orderBy` vào `findAll()`)

## 📂 File KHÔNG được sửa
- `findOne()`, `inbound()`, `outbound()`, và method `getLedger()` (Task 102) trong cùng file — không liên
  quan tới task này
- Bất kỳ file nào khác

## 🔌 API cần dùng
`GET /inventory` — response shape không đổi, chỉ thứ tự các item trong mảng ổn định hơn.

## 🪜 Các bước thực hiện
1. Trong `inventory.service.ts`, hàm `findAll()`, tìm đoạn:
   ```ts
   this.prisma.inventory.findMany({
     where,
     ...skipTake(page, limit),
     select: { /* ... */ },
   }),
   ```
2. Thêm dòng `orderBy` (đặt giữa `...skipTake(...)` và `select`, theo đúng convention Prisma - thứ tự
   property trong object không ảnh hưởng hành vi nhưng nên đặt gần `skipTake` cho dễ đọc):
   ```ts
   this.prisma.inventory.findMany({
     where,
     ...skipTake(page, limit),
     orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
     select: { /* giữ nguyên toàn bộ */ },
   }),
   ```
3. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
Xem đầy đủ ở mục "Các bước thực hiện" — chỉ 1 dòng cần thêm.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/103.txt`

## ✅ Checklist nghiệm thu
- ☐ `findAll()` có `orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }]`
- ☐ Không đổi `where`, `select`, hay bất kỳ phần nào khác trong hàm
- ☐ Không đụng `findOne()`, `inbound()`, `outbound()`, `getLedger()`
- ☐ `npm run build --workspace=backend` không lỗi
- ☐ Test phân trang: gọi `GET /inventory?page=1&limit=5` rồi `page=2&limit=5` nhiều lần liên tiếp — thứ tự
  và nội dung từng trang phải giống hệt nhau giữa các lần gọi (không có row lặp/mất giữa 2 trang)

## ❌ Lỗi thường gặp
- **Chỉ thêm `orderBy: { updatedAt: 'desc' }` mà quên tie-break `id`** → vẫn có nguy cơ không ổn định khi 2
  record có `updatedAt` bằng nhau tới mili-giây (ví dụ nhập nhiều slot cùng lúc trong 1
  `prisma.$transaction` như Task 99 vừa làm) — bắt buộc có tie-break `id`.
- **Dùng `createdAt` thay vì `updatedAt`** → sai ngữ nghĩa "Detail Inventory" (tồn kho hiện tại, cần biết
  lần cập nhật GẦN NHẤT, không phải lần tạo record ban đầu — 1 record `Inventory` có thể được `update`
  nhiều lần qua nhiều giao dịch nhập/xuất khác nhau).

## 🔄 Cách test
1. `npm run start:dev --workspace=backend`.
2. Gọi `GET /inventory?limit=5` 3-5 lần liên tiếp (không có giao dịch nào chen giữa) — thứ tự trả về phải
   giống hệt nhau mỗi lần.
3. Gọi `GET /inventory?page=1&limit=2` và `page=2&limit=2` — cộng dồn item của 2 trang phải khớp đúng với
   gọi `limit=4` 1 lần (không thiếu, không lặp).
4. Thực hiện 1 giao dịch nhập kho (làm `Inventory.updatedAt` của 1 record đổi) → gọi lại `GET /inventory` —
   record đó phải nhảy lên đầu danh sách (vì `updatedAt desc`).

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/inventory/inventory.service.ts
```

## 📝 Commit message
```
fix(inventory): add stable orderBy to GET /inventory (was completely unsorted)
```

## 🔀 PR title
```
[Task 103] Fix unstable pagination in Detail Inventory (GET /inventory)
```

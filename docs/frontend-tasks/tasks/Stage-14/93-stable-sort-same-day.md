# Task 93 [BACKEND] — Sort ổn định (tie-break) để dữ liệu cùng ngày hiện liên tiếp, không đảo lộn

## 🎯 Mục tiêu
Thêm điều kiện sort phụ (tie-break) cho `GET /transactions` và `GET /schedules` để khi nhiều bản ghi có cùng
mốc thời gian chính (`createdAt` cùng mili-giây, hoặc `scheduledAt` cùng giờ), thứ tự trả về **luôn ổn định,
liên tiếp giữa các lần gọi/các trang phân trang** — đúng yêu cầu "khi nhập/xuất hàng cùng ngày, để số liệu
liên tiếp nhau" và "tìm nó sẽ ra liên tiếp, liền kề nhau".

**Điều kiện tiên quyết: Task 91 đã merge (field `dailySeq` đã được ghi khi tạo Transaction).**

## 📖 Giải thích nghiệp vụ — vì sao dữ liệu bị "không liên tiếp"
Đây là lỗi kỹ thuật database kinh điển, không phải do dữ liệu sai:

- `transactions.service.ts` hiện `orderBy: { createdAt: 'desc' }` — CHỈ 1 tiêu chí sort. Nếu 2 giao dịch có
  `createdAt` giống hệt nhau tới mili-giây (dễ xảy ra khi 1 lần xuất kho tạo nhiều `Transaction` liên tiếp
  cực nhanh trong cùng `prisma.$transaction`, xem `executeOutboundSchedule`), PostgreSQL **không đảm bảo thứ
  tự cố định** giữa các row có giá trị sort bằng nhau — có thể trả về thứ tự khác nhau giữa các lần gọi, đặc
  biệt rõ khi kết hợp phân trang (`skip`/`take`): 1 row có thể xuất hiện ở 2 trang, hoặc bị "biến mất" giữa
  trang 1 và trang 2 nếu thứ tự đổi ngay lúc chuyển trang.
- `schedules.service.ts` hàm `findAll` cũng chỉ có `orderBy: { scheduledAt: 'asc' }`, cùng vấn đề y hệt khi
  nhiều lịch có cùng `scheduledAt`.

Cách sửa chuẩn: thêm tiêu chí sort phụ **duy nhất về mặt giá trị** (không bao giờ trùng giữa 2 row) làm
tie-break — dùng `dailySeq` (đã ghi ở Task 91, tăng dần theo đúng thứ tự tạo thật) cho Transaction, và
`createdAt` + `id` cho Schedule.

## 🧠 Giải thích Prisma cần biết
- Prisma hỗ trợ `orderBy` dạng **mảng nhiều tiêu chí**: `orderBy: [{ createdAt: 'desc' }, { dailySeq: 'desc' }]`
  — tiêu chí sau chỉ có tác dụng khi tiêu chí trước bằng nhau (đúng ngữ nghĩa SQL `ORDER BY a DESC, b DESC`).
- `id` (uuid) không có thứ tự tự nhiên theo thời gian, nhưng vẫn đảm bảo **tính duy nhất tuyệt đối** — dùng
  làm tie-break cuối cùng (sau `createdAt`) để chắc chắn 100% không còn 2 row nào "ngang hàng" nhau về sort.

## 📖 Các file cần đọc trước
- `apps/backend/src/transactions/transactions.service.ts` (hàm `findAll`, sau khi Task 91 đã thêm
  `findOne`)
- `apps/backend/src/schedules/schedules.service.ts` (hàm `findAll` dòng ~775-794)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/transactions/transactions.service.ts` (chỉ `orderBy` trong `findAll`)
- Sửa: `apps/backend/src/schedules/schedules.service.ts` (chỉ `orderBy` trong `findAll`)

## 📂 File KHÔNG được sửa
- Điều kiện `where` (filter) trong cả 2 hàm — không đổi logic lọc, chỉ đổi `orderBy`.
- Bất kỳ hàm nào khác trong 2 file.

## 🔌 API cần dùng
`GET /transactions`, `GET /schedules` — response shape không đổi, chỉ thứ tự các item trong mảng ổn định
hơn.

## 🪜 Các bước thực hiện
1. Trong `transactions.service.ts`, hàm `findAll`, đổi:
   ```ts
   orderBy: { createdAt: 'desc' },
   ```
   thành:
   ```ts
   orderBy: [{ createdAt: 'desc' }, { dailySeq: 'desc' }],
   ```
2. Trong `schedules.service.ts`, hàm `findAll`, đổi:
   ```ts
   orderBy: { scheduledAt: 'asc' },
   ```
   thành:
   ```ts
   orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
   ```
3. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code (đoạn diff, mỗi chỗ chỉ 1 dòng)
```ts
// transactions.service.ts — findAll()
this.prisma.transaction.findMany({
  where,
  ...skipTake(page, limit),
  orderBy: [{ createdAt: 'desc' }, { dailySeq: 'desc' }], // <-- đổi từ { createdAt: 'desc' }
  select: { /* giữ nguyên toàn bộ */ },
}),
```

```ts
// schedules.service.ts — findAll()
this.prisma.schedule.findMany({
  where,
  ...skipTake(page, limit),
  orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }], // <-- đổi từ { scheduledAt: 'asc' }
  include: scheduleInclude,
}),
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/93.txt`

## ✅ Checklist nghiệm thu
- ☐ `transactions.service.ts` dùng `orderBy: [{ createdAt: 'desc' }, { dailySeq: 'desc' }]`
- ☐ `schedules.service.ts` dùng `orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }]`
- ☐ Không đổi `where`/filter nào trong cả 2 hàm
- ☐ `npm run build --workspace=backend` không lỗi
- ☐ Test phân trang: gọi `GET /transactions?page=1&limit=5` rồi `page=2&limit=5` nhiều lần liên tiếp — thứ
  tự và nội dung từng trang phải giống nhau y hệt giữa các lần gọi (không có row lặp/mất giữa 2 trang)

## ❌ Lỗi thường gặp
- **Chỉ đổi 1 trong 2 file** (vd chỉ sửa transactions, quên schedules) → vẫn còn 1 nửa hệ thống bị lỗi thứ
  tự không ổn định.
- **Dùng `dailySeq: 'asc'` thay vì `'desc'`** ở transactions trong khi `createdAt` đang là `'desc'` → 2 tiêu
  chí ngược chiều nhau, thứ tự hiển thị sẽ kỳ lạ (mới nhất theo ngày nhưng cũ nhất theo số thứ tự trong
  ngày đó lên đầu) — phải cùng chiều `desc` với `createdAt` để "mới nhất trong ngày mới nhất" lên đầu.
- **Quên rằng dữ liệu backfill/seed cũ có thể có `dailySeq = NULL`** (nếu tạo trước Task 91/85) — Prisma
  `orderBy` mặc định đẩy `NULL` xuống cuối khi `desc` (tuỳ DB), không gây lỗi runtime nhưng thứ tự các bản
  ghi cũ chưa có `dailySeq` có thể không như kỳ vọng — chấp nhận được vì đây là dữ liệu lịch sử trước khi có
  field, không cần backfill thêm ở task này.

## 🔄 Cách test
1. Tạo 3-4 giao dịch xuất kho liên tiếp trong cùng vài giây (test bằng cách gọi API execute nhiều lần
   nhanh, hoặc dùng 1 lịch xuất chia nhiều slot để tạo nhiều Transaction cùng lúc).
2. Gọi `GET /transactions?limit=5` 3-5 lần liên tiếp, so sánh thứ tự trả về — phải giống hệt nhau mỗi lần.
3. Gọi `GET /transactions?page=1&limit=2` và `page=2&limit=2` — cộng dồn item của 2 trang phải khớp đúng
   với gọi `limit=4` 1 lần (không thiếu, không lặp).

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/transactions/transactions.service.ts apps/backend/src/schedules/schedules.service.ts
```

## 📝 Commit message
```
fix(list-apis): add stable tie-break sort for transactions and schedules pagination
```

## 🔀 PR title
```
[Task 93] Fix unstable ordering for same-day transactions/schedules pagination
```

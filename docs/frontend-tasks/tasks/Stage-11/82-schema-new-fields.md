# Task 82 [BACKEND] — Thêm field mới vào Prisma schema (orderCode, expiryDate, before/after, dailySeq)

## 🎯 Mục tiêu
Bổ sung vào `schema.prisma` các field còn thiếu để làm nền tảng cho 5 vấn đề: mã đơn riêng, ngày hết hạn
lúc đặt lịch, chi tiết tồn kho trước/sau, và sắp xếp liên tiếp khi nhập/xuất cùng ngày.

**Nguyên tắc bắt buộc: CHỈ THÊM FIELD MỚI, KHÔNG xoá/đổi tên field cũ, KHÔNG đổi logic ở service trong
task này.** Việc dùng field mới trong logic thực tế là các task 89-99 ở Stage 13-16.

## 📖 Giải thích nghiệp vụ
- **Mã đơn riêng (`orderCode`)**: hiện `Schedule` chỉ có `id` dạng UUID (vd `a1b2c3d4-...`), nhân viên kho
  không thể đọc/nhớ để tra cứu. Cần 1 mã ngắn, dễ đọc (vd `SCH-20260721-0001`) để tra nhập/xuất theo đơn.
- **Ngày hết hạn lúc đặt lịch (`expiryDate` trên Schedule)**: hiện `Schedule` chỉ có `batchCode` (nhập tay,
  optional), hệ thống **không biết HSD thực tế** của lô hàng sắp nhập cho tới khi thực hiện lịch
  (`executeInboundSchedule` mới bắt `dto.expiryDate`). Vì thuật toán gợi ý vị trí (FEFO) cần biết HSD sớm để
  xếp vị trí chính xác ngay từ bước preview, phải thu thập field này ngay lúc đặt lịch.
- **`quantityBefore`/`quantityAfter` trên Transaction**: hiện mỗi `Transaction` chỉ ghi `quantity` (số thay
  đổi, vd +50 hoặc -20), không lưu lại tồn kho tại slot đó **trước và sau** giao dịch → không trả lời được
  câu "trước khi nhập có bao nhiêu, sau khi nhập còn bao nhiêu".
- **`dailySeq` trên Transaction**: khi nhiều giao dịch xảy ra cùng ngày, sort theo `createdAt` (độ phân giải
  mili-giây) đôi khi bị đảo thứ tự hiển thị do cách BE trả dữ liệu/FE phân trang. Thêm số thứ tự tăng dần
  trong ngày để đảm bảo khi tra cứu, dữ liệu luôn hiện liên tiếp đúng thứ tự phát sinh thật.

## 🧠 Giải thích Prisma cần biết
- Field mới thêm vào model đã có dữ liệu **phải để `String?`/`Int?` (optional)** hoặc có `@default(...)`,
  nếu không migration sẽ lỗi vì các row cũ không có giá trị cho cột NOT NULL mới.
- `orderCode` cần unique để tra cứu chính xác 1-1: `@unique`.
- Chạy migration ở Task 84 (không chạy trong task này) — task này chỉ sửa file `schema.prisma`, để tránh
  1 task vừa đổi schema vừa tự ý migrate khi chưa review.

## 📖 Các file cần đọc trước
- `apps/backend/prisma/schema.prisma` (toàn bộ, đặc biệt model `Schedule` dòng ~290-353 và `Transaction`
  dòng ~234-254)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/prisma/schema.prisma` (chỉ thêm field, không đổi field khác)

## 📂 File KHÔNG được sửa
- Bất kỳ file `.ts` nào trong `apps/backend/src` (service/controller/dto) — task này chỉ đổi schema.
- Không tạo migration ở task này (việc đó là Task 84).

## 🔌 API cần dùng
Không có — đây là task schema thuần.

## 🪜 Các bước thực hiện
1. Mở `schema.prisma`, tìm model `Schedule`. Thêm 2 field mới ngay dưới field `batchCode`:
   - `orderCode String? @unique` — mã đơn, sinh tự động ở Task 92, để optional vì dữ liệu cũ chưa có.
   - `expiryDate DateTime?` — HSD lô hàng, thu lúc đặt lịch (chỉ áp dụng cho `type = INBOUND`, không bắt buộc
     ở tầng DB vì Outbound không cần).
2. Tìm model `Transaction`, thêm 3 field mới ngay dưới field `quantity`:
   - `quantityBefore Int?` — tồn kho tại slot liên quan trước giao dịch.
   - `quantityAfter Int?` — tồn kho tại slot liên quan sau giao dịch.
   - `dailySeq Int?` — số thứ tự trong ngày (1, 2, 3... reset mỗi ngày).
3. Thêm index hỗ trợ sort liên tiếp theo ngày: trong model `Transaction`, thêm
   `@@index([createdAt, dailySeq])`.
4. Chạy `npx prisma format` (trong `apps/backend`) để Prisma tự canh lại định dạng file.
5. Chạy `npx prisma validate` để chắc chắn schema hợp lệ (KHÔNG chạy `migrate dev` — để Task 84 làm).

## 💻 Ví dụ code (đoạn diff minh hoạ)
```prisma
model Schedule {
  id     String         @id @default(uuid())
  type   ScheduleType
  status ScheduleStatus @default(PENDING)

  scheduledAt DateTime

  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int

  batchCode  String? // Mã lô hàng do người dùng nhập tay khi đặt lịch (không bắt buộc)
  orderCode  String? @unique // Mã đơn riêng, tự sinh, dùng để tra cứu (Task 92)
  expiryDate DateTime? // HSD lô hàng, thu ngay lúc đặt lịch (chỉ dùng khi type = INBOUND)

  // ... các field khác giữ nguyên, không đổi
}

model Transaction {
  id         String          @id @default(uuid())
  type       TransactionType
  batchId    String
  batch      Batch           @relation(fields: [batchId], references: [id])
  slotFromId String?
  slotFrom   Slot?           @relation("SlotFrom", fields: [slotFromId], references: [id])
  slotToId   String?
  slotTo     Slot?           @relation("SlotTo", fields: [slotToId], references: [id])
  quantity   Int

  quantityBefore Int? // Tồn kho tại slot liên quan TRƯỚC giao dịch (Task 91 sẽ điền)
  quantityAfter  Int? // Tồn kho tại slot liên quan SAU giao dịch (Task 91 sẽ điền)
  dailySeq       Int? // Thứ tự trong ngày, dùng để sort liên tiếp (Task 91/93)

  userId    String
  user      User     @relation(fields: [userId], references: [id])
  note      String?
  createdAt DateTime @default(now())

  schedule Schedule?

  @@index([batchId])
  @@index([type])
  @@index([createdAt, dailySeq])
  @@map("transactions")
}
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/82.txt`

## ✅ Checklist nghiệm thu
- ☐ `Schedule` có thêm `orderCode String? @unique` và `expiryDate DateTime?`
- ☐ `Transaction` có thêm `quantityBefore Int?`, `quantityAfter Int?`, `dailySeq Int?`
- ☐ `Transaction` có thêm `@@index([createdAt, dailySeq])`
- ☐ Không field nào khác trong 2 model bị đổi tên/kiểu dữ liệu/xoá
- ☐ `npx prisma validate` chạy không lỗi
- ☐ Chưa có migration nào được tạo (để dành Task 84)
- ☐ Không file `.ts` nào trong `src/` bị đụng tới

## ❌ Lỗi thường gặp
- **Để field mới là bắt buộc (không `?`)** → migration ở Task 84 sẽ lỗi vì các row `Schedule`/`Transaction`
  cũ trong DB không có giá trị. Luôn để `?` (optional) cho field thêm vào bảng đã có dữ liệu.
- **Quên `@unique` cho `orderCode`** → sau này 2 đơn có thể trùng mã, tra cứu sai đơn.
- **Chạy nhầm `npx prisma migrate dev` ở task này** → tạo migration thiếu (vì Task 83 còn thêm bảng
  `ScheduleAllocation` nữa) → phải xoá migration vừa tạo và làm lại đúng thứ tự Task 82 → 83 → 84.

## 🔄 Cách test
1. `cd apps/backend && npx prisma format && npx prisma validate` — không có lỗi.
2. Mở `schema.prisma`, đọc lại diff bằng `git diff prisma/schema.prisma` — chỉ có dòng thêm mới, không có
   dòng xoá/sửa field cũ.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/prisma/schema.prisma
```

## 📝 Commit message
```
feat(schema): add orderCode/expiryDate on Schedule, before/after/dailySeq on Transaction
```

## 🔀 PR title
```
[Task 82] Add new Prisma fields for order code, expiry capture and transaction detail
```

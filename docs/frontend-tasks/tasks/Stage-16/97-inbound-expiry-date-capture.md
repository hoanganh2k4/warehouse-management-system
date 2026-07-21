# Task 97 [BACKEND] — Thu thập ngày hết hạn (HSD) ngay lúc đặt lịch nhập

## 🎯 Mục tiêu
Thêm field `expiryDate` (không bắt buộc, nhưng khuyến khích nhập) vào form đặt lịch nhập, dùng giá trị này
làm mốc tính điểm FEFO trong `computeInboundSuggestion` — thay vì luôn phải xấp xỉ bằng `scheduledDate` như
hiện tại. Khi có HSD thật ngay từ lúc đặt lịch, gợi ý vị trí ngay từ bước preview sẽ chính xác hơn.

**Điều kiện tiên quyết: Task 82 đã merge (field `Schedule.expiryDate` đã có trong schema).**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể — đúng như comment trong code hiện tại)
`schedules.service.ts`, dòng 93-99, đã tự ghi chú rõ giới hạn đang tồn tại:
> "Lưu ý: tại thời điểm Đặt lịch, hệ thống CHƯA biết hạn sử dụng (HSD) thực tế của lô hàng sắp nhập (form
> Đặt lịch nhập không thu thập HSD - theo đúng yêu cầu)... Ta dùng tạm ngày nhập dự kiến (scheduledDate)
> làm mốc xấp xỉ."

Đây chính là hạn chế anh muốn gỡ bỏ: "Đặt lịch nhập thêm ngày hết hạn của mã lô hàng để xác định vị trí
chính xác cho lô hàng". Việc thu `expiryDate` sớm giúp thuật toán FEFO (trong `SlotScoringService`, thành
phần điểm `F`) so khớp đúng với các lô cùng SKU đã có trong kho ngay từ bước preview, không phải đợi tới lúc
"Thực hiện lịch" mới có số liệu chính xác.

**Lưu ý quan trọng: Task này KHÔNG bắt buộc `expiryDate`** ở tầng validation — nhân viên đặt lịch có thể
chưa biết chính xác HSD (hàng chưa về, chỉ đặt lịch dự kiến). Nếu không nhập, hệ thống **vẫn hoạt động như
cũ** (dùng `scheduledDate` làm proxy) — không phá vỡ luồng đang chạy.

## 🧠 Giải thích NestJS cần biết
- Thêm field optional vào 2 DTO: `InboundSuggestionPreviewDto` (dùng lúc preview) và
  `CreateInboundScheduleDto` (dùng lúc tạo lịch thật) — cả 2 đều gọi chung `computeInboundSuggestion`.
- Sửa chữ ký `computeInboundSuggestion` để nhận thêm tham số `expiryDate?: Date`, dùng
  `expiryDate ?? scheduledDate` làm mốc truyền vào `slotScoring.findBestSlots` — giữ logic fallback cũ
  nguyên vẹn khi không có `expiryDate`.

## 📖 Các file cần đọc trước
- `apps/backend/src/schedules/dto/inbound-schedule.dto.ts` (toàn bộ)
- `apps/backend/src/schedules/schedules.service.ts` (dòng 91-231: `computeInboundSuggestion`,
  `previewInboundSuggestion`, `createInboundSchedule`)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/backend/src/schedules/dto/inbound-schedule.dto.ts` (thêm field `expiryDate?: string` vào cả 2
  class)
- Sửa: `apps/backend/src/schedules/schedules.service.ts` (sửa `computeInboundSuggestion`,
  `previewInboundSuggestion`, `createInboundSchedule` — chỉ phần liên quan tới `expiryDate`, không đổi logic
  khác)

## 📂 File KHÔNG được sửa
- `apps/backend/src/common/services/slot-scoring.service.ts` (không đổi cách tính điểm, chỉ đổi giá trị
  `incomingExpiry` truyền vào)
- `executeInboundSchedule` (đã tự có logic thu `dto.expiryDate` riêng ở bước Thực hiện — KHÔNG đụng, đó là
  hành vi đúng, độc lập với việc thu HSD sớm ở bước Đặt lịch)

## 🔌 API cần dùng
- `POST /schedules/inbound/preview` (hoặc route preview tương ứng dùng `InboundSuggestionPreviewDto`) —
  thêm field optional `expiryDate` vào body request.
- `POST /schedules/inbound` (dùng `CreateInboundScheduleDto`) — thêm field optional `expiryDate` vào body
  request; response `schedule` (qua `toScheduleView`, đã có `orderCode` từ Task 92) giờ có thêm giá trị
  `expiryDate` (field đã tồn tại sẵn trong Prisma model, tự động có trong `include: scheduleInclude`, chỉ
  cần đảm bảo `toScheduleView` không bỏ sót — kiểm tra và thêm nếu thiếu, giống cách đã làm với `orderCode`
  ở Task 92).

## 🪜 Các bước thực hiện
1. Trong `inbound-schedule.dto.ts`, thêm vào CẢ HAI class:
   ```ts
   @ApiPropertyOptional({
     description: 'Hạn sử dụng (HSD) dự kiến của lô hàng, nếu đã biết trước khi hàng về',
   })
   @IsOptional()
   @IsDateString()
   expiryDate?: string;
   ```
   (import thêm `IsDateString` nếu class đó chưa import — `InboundSuggestionPreviewDto` đã có sẵn
   `IsDateString` dùng cho `scheduledDate`, dùng lại).
2. Trong `schedules.service.ts`, sửa chữ ký `computeInboundSuggestion`:
   ```ts
   private async computeInboundSuggestion(
     productId: string,
     quantity: number,
     scheduledDate: Date,
     expiryDate?: Date,
   ): Promise<InboundSuggestionResult> {
     // ...
     const allocations = await this.slotScoring.findBestSlots(
       product,
       quantity,
       expiryDate ?? scheduledDate, // <-- đổi từ chỉ dùng scheduledDate
     );
     // ...phần còn lại giữ nguyên...
   }
   ```
3. Sửa `previewInboundSuggestion`:
   ```ts
   async previewInboundSuggestion(dto: InboundSuggestionPreviewDto) {
     return this.computeInboundSuggestion(
       dto.productId,
       dto.quantity,
       new Date(dto.scheduledDate),
       dto.expiryDate ? new Date(dto.expiryDate) : undefined,
     );
   }
   ```
4. Sửa `createInboundSchedule`: truyền thêm `expiryDate` khi gọi `computeInboundSuggestion`, và lưu
   `expiryDate` vào `data` lúc tạo `Schedule`:
   ```ts
   const suggestion = await this.computeInboundSuggestion(
     dto.productId,
     dto.quantity,
     new Date(dto.scheduledDate),
     dto.expiryDate ? new Date(dto.expiryDate) : undefined,
   );

   const schedule = await this.prisma.schedule.create({
     data: {
       // ...các field cũ giữ nguyên...
       expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
     },
     include: scheduleInclude,
   });
   ```
5. Kiểm tra `toScheduleView` — nếu chưa có dòng `expiryDate: item.expiryDate,`, thêm vào (đặt cạnh
   `orderCode` đã thêm ở Task 92).
6. Cập nhật lại đoạn comment dòng 93-99 (giải thích nghiệp vụ) cho khớp thực tế mới — không còn "form không
   thu thập HSD", mà là "form CÓ thể thu thập HSD nếu nhân viên đã biết trước, nếu không sẽ dùng
   scheduledDate làm mốc tạm".
7. Chạy `npm run build --workspace=backend`.

## 💻 Ví dụ code
Xem đầy đủ trong mục "Các bước thực hiện".

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/97.txt`

## ✅ Checklist nghiệm thu
- ☐ `InboundSuggestionPreviewDto` và `CreateInboundScheduleDto` đều có field optional `expiryDate?: string`
- ☐ Không nhập `expiryDate` → hệ thống vẫn hoạt động y hệt trước (dùng `scheduledDate`), không lỗi
- ☐ Có nhập `expiryDate` → `slotScoring.findBestSlots` nhận đúng giá trị này thay vì `scheduledDate`
- ☐ Tạo lịch nhập có `expiryDate` → `Schedule.expiryDate` được lưu đúng trong DB
- ☐ `toScheduleView` trả về `expiryDate` cho FE
- ☐ `executeInboundSchedule` không bị đụng, vẫn hoạt động như cũ
- ☐ `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Đặt `expiryDate` là bắt buộc** (`@IsNotEmpty` hoặc bỏ `@IsOptional`) → phá vỡ luồng đặt lịch hiện tại
  của nhân viên chưa biết trước HSD, không đúng yêu cầu "không bắt buộc, biết trước thì nhập".
- **Nhầm lẫn giữa `expiryDate` ở bước Đặt lịch (Task này) và `expiryDate` ở `ExecuteScheduleDto`** (bước
  Thực hiện, đã có sẵn, dùng để tạo Batch chính thức) — đây là 2 khái niệm khác nhau về mặt luồng nghiệp vụ
  dù trùng tên field: 1 cái là ước lượng sớm để tính gợi ý, 1 cái là giá trị chính thức ghi vào Batch. KHÔNG
  gộp/xoá field nào ở `ExecuteScheduleDto`.
- **Quên cập nhật `toScheduleView`** → dù DB đã lưu đúng, FE vẫn không nhận được giá trị.

## 🔄 Cách test
1. Gọi preview với `expiryDate` khác xa `scheduledDate` (vd cách nhau vài tháng) — so sánh điểm/gợi ý trả về
   với trường hợp không truyền `expiryDate` (dùng `scheduledDate`) — nếu trong kho có nhiều lô cùng SKU với
   HSD khác nhau, kết quả gợi ý (điểm FEFO) phải khác nhau rõ rệt giữa 2 lần gọi.
2. Tạo lịch nhập có `expiryDate`, kiểm tra qua `GET /schedules/by-code/:orderCode` (Task 92) — phải thấy
   đúng giá trị `expiryDate` đã nhập.
3. Tạo lịch nhập KHÔNG có `expiryDate` — vẫn tạo thành công như trước.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src/schedules/dto/inbound-schedule.dto.ts apps/backend/src/schedules/schedules.service.ts
```

## 📝 Commit message
```
feat(schedules): collect expiryDate at inbound scheduling time to improve FEFO suggestion
```

## 🔀 PR title
```
[Task 97] Capture expiry date at inbound schedule creation for accurate suggestion
```

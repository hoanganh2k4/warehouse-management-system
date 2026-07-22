# Task 110 [FRONTEND] — Thêm field "Ngày hết hạn (dự kiến)" vào form Đặt lịch nhập

## 🎯 Mục tiêu
Thêm field không bắt buộc `expiryDate` vào `InboundScheduleModal`, gửi kèm khi gọi preview gợi ý vị trí và
khi tạo lịch — dùng đúng field mới `expiryDate` đã hỗ trợ ở backend (Task 97), giúp gợi ý vị trí chính xác
hơn ngay từ bước đặt lịch.

**Điều kiện tiên quyết: Task 97 (backend) đã merge.**

## 📖 Giải thích nghiệp vụ
`InboundScheduleModal.tsx` hiện có các field: `scheduledDate`, `scheduledTime`, `supplierId`, `productId`,
`quantity`, `batchCode`, `note` — **không có field HSD**. Đây chính xác là điều anh mô tả: "Đặt lịch nhập
thêm ngày hết hạn của mã lô hàng để xác định vị trí chính xác cho lô hàng". Field này **không bắt buộc**
(nhân viên có thể chưa biết trước HSD) — nếu bỏ trống, hệ thống vẫn hoạt động như cũ (dùng `scheduledDate`
làm proxy, theo đúng thiết kế fallback ở Task 97 backend).

## 🧠 Giải thích React cần biết
- Thêm field vào `FormState`, đưa vào `INITIAL_FORM`, thêm vào cả 2 chỗ gọi API: preview suggestion (trong
  `useEffect` phụ thuộc `form.productId/quantity/scheduledDate` — giờ thêm `form.expiryDate` vào dependency
  array) và submit tạo lịch thật (`payload` trong `handleSubmit`).
- Field KHÔNG có validation bắt buộc (khác với `scheduledDate` đang có `if (!state.scheduledDate) next.scheduledDate = ...`).

## 📖 Các file cần đọc trước
- `apps/frontend/src/components/InboundScheduleModal.tsx` (toàn bộ, 335 dòng)
- `apps/frontend/src/types.ts` (`InboundSuggestionPreviewPayload`, `CreateInboundSchedulePayload`)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/frontend/src/types.ts` (thêm `expiryDate?: string` vào cả 2 type payload liên quan)
- Sửa: `apps/frontend/src/components/InboundScheduleModal.tsx` (thêm field form, không đổi field khác)

## 📂 File KHÔNG được sửa
- Backend — task này thuần frontend
- `OutboundScheduleModal.tsx` (không liên quan, Outbound không cần field này)

## 🔌 API cần dùng
`POST /schedules/inbound/preview`, `POST /schedules/inbound` (đã dùng sẵn) — thêm field optional
`expiryDate` vào body.

## 🪜 Các bước thực hiện
1. Trong `types.ts`, thêm `expiryDate?: string;` vào `InboundSuggestionPreviewPayload` và
   `CreateInboundSchedulePayload`.
2. Trong `InboundScheduleModal.tsx`:
   - Thêm `expiryDate: string;` vào `type FormState` (dòng ~14), thêm `expiryDate: ''` vào `INITIAL_FORM`
     (dòng ~26).
   - Thêm `form.expiryDate` vào dependency array của `useEffect` gọi preview suggestion (dòng ~114), và
     thêm `expiryDate: form.expiryDate || undefined` vào object gọi API preview (dòng ~92 khu vực).
   - Thêm `expiryDate: form.expiryDate || undefined` vào `payload` trong `handleSubmit` (dòng ~160).
   - Thêm field input trong JSX form, đặt NGAY SAU field `scheduledDate` (dòng ~187-201), theo đúng cấu
     trúc `form-field`/`form-label`/`fieldError` đã dùng cho các field khác, nhưng KHÔNG gọi `handleBlur`
     hay thêm vào validation bắt buộc (vì field này optional):
     ```tsx
     <div className="form-field">
       <label className="form-label" htmlFor="in-expiryDate">
         Hạn sử dụng dự kiến (nếu đã biết)
       </label>
       <input
         id="in-expiryDate"
         type="date"
         className="form-input"
         value={form.expiryDate}
         onChange={(e) => updateField('expiryDate', e.target.value)}
       />
     </div>
     ```
3. Chạy `npm run build --workspace=frontend`.

## 💻 Ví dụ code
Xem đầy đủ ở mục "Các bước thực hiện".

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/110.txt`

## ✅ Checklist nghiệm thu
- ☐ Form đặt lịch nhập có field "Hạn sử dụng dự kiến", không bắt buộc
- ☐ Bỏ trống field này → đặt lịch vẫn thành công như trước (không lỗi validation)
- ☐ Nhập field này → gửi đúng `expiryDate` trong cả request preview và request tạo lịch
- ☐ Không đổi validation/behavior của các field khác trong form
- ☐ `npm run build --workspace=frontend` không lỗi

## ❌ Lỗi thường gặp
- **Thêm validation bắt buộc cho `expiryDate`** → sai yêu cầu, field này phải optional.
- **Quên thêm `form.expiryDate` vào dependency array của `useEffect` preview** → nhập HSD xong nhưng preview
  không tự chạy lại, người dùng phải đổi field khác mới thấy cập nhật, trải nghiệm tệ.
- **Gửi chuỗi rỗng `''` thay vì `undefined`** khi field trống → có thể khiến backend validate `@IsDateString`
  báo lỗi (chuỗi rỗng không phải ISO date hợp lệ) dù field là optional — luôn dùng `form.expiryDate || undefined`.

## 🔄 Cách test
1. `npm run dev --workspace=frontend`, mở modal "Đặt lịch nhập".
2. Không nhập HSD, điền các field khác, đặt lịch — phải thành công như trước.
3. Nhập HSD, quan sát preview gợi ý vị trí có tự động chạy lại không (network tab) — request preview phải
   có `expiryDate` trong body.
4. Đặt lịch với HSD đã nhập, kiểm tra qua Swagger/DB — `Schedule.expiryDate` phải được lưu đúng.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/types.ts apps/frontend/src/components/InboundScheduleModal.tsx
```

## 📝 Commit message
```
feat(schedules): add optional expiry date field to inbound scheduling form
```

## 🔀 PR title
```
[Task 110] Add expiry date input to Inbound Schedule form
```

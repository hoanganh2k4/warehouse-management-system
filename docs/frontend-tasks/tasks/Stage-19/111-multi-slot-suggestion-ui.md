# Task 111 [FRONTEND] — Hiển thị danh sách nhiều vị trí khi cần chia hàng (`alternativeSlots`)

## 🎯 Mục tiêu
Sửa `SmartLocationSuggestionCard` để khi `splitRequired = true`, hiển thị **đầy đủ danh sách các vị trí**
(`alternativeSlots`, từ Task 98 backend) thay vì chỉ hiện 1 dòng cảnh báo chung chung như hiện tại — đúng
yêu cầu "Đặt lịch, số lượng nhiều nên để nhiều lựa chọn chỗ nhập kho với khi gợi ý cũng phải để nhiều chỗ sẽ
nhập/xuất hàng".

**Điều kiện tiên quyết: Task 98, 100 (backend) đã merge.**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
`SmartLocationSuggestionCard.tsx`, dòng 68-72:
```tsx
{suggestion.splitRequired && (
  <p className="smart-card-warning">
    ⚠ Số lượng vượt sức chứa 1 Slot — hệ thống sẽ chia vào nhiều Slot khi thực hiện.
  </p>
)}
```
Chỉ là 1 dòng cảnh báo text, không cho nhân viên thấy **CỤ THỂ** sẽ chia vào những vị trí nào, mỗi vị trí
bao nhiêu — đúng thiếu sót anh mô tả. Sau Task 98 (backend), API preview đã trả `alternativeSlots` đầy đủ,
chỉ cần hiển thị ra.

## 🧠 Giải thích React cần biết
- `alternativeSlots` là mảng mới trong `InboundSuggestionResult` — cần thêm vào type ở `types.ts` trước.
- Khi `alternativeSlots.length <= 1`, giữ nguyên hiển thị hiện tại (1 vị trí chính, không cần danh sách) —
  chỉ hiện danh sách khi thực sự có ≥ 2 vị trí, tránh làm rối giao diện cho trường hợp đơn giản.

## 📖 Các file cần đọc trước
- `apps/frontend/src/components/SmartLocationSuggestionCard.tsx` (toàn bộ)
- `apps/frontend/src/types.ts` (`InboundSuggestionResult`)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/frontend/src/types.ts` (thêm `alternativeSlots` vào `InboundSuggestionResult`)
- Sửa: `apps/frontend/src/components/SmartLocationSuggestionCard.tsx`
- Sửa: file CSS chung của dự án (thêm style cho danh sách `smart-card-alt-list` nếu cần, dựa theo class
  `smart-card-reasons`/`smart-card-row` đã có, giữ đồng bộ)

## 📂 File KHÔNG được sửa
- `apps/frontend/src/components/InboundScheduleModal.tsx` (không đổi cách gọi
  `SmartLocationSuggestionCard`, component tự nhận prop `suggestion` đã có `alternativeSlots` bên trong)
- Backend

## 🔌 API cần dùng
`POST /schedules/inbound/preview` (đã dùng sẵn) — response giờ có thêm `alternativeSlots` (Task 98).

## 🪜 Các bước thực hiện
1. Trong `types.ts`, thêm vào `InboundSuggestionResult`:
   ```ts
   export type AlternativeSlot = {
     slotId: string;
     slotPath: string;
     allocateQty: number;
     score: number;
   };

   export type InboundSuggestionResult = {
     // ...các field cũ giữ nguyên...
     alternativeSlots: AlternativeSlot[];
   };
   ```
2. Trong `SmartLocationSuggestionCard.tsx`, thay khối `splitRequired` (dòng 68-72) bằng:
   ```tsx
   {suggestion.splitRequired && suggestion.alternativeSlots.length > 1 && (
     <div className="smart-card-alt-list">
       <p className="smart-card-warning">
         ⚠ Số lượng vượt sức chứa 1 Slot — hệ thống sẽ chia vào {suggestion.alternativeSlots.length} vị trí sau:
       </p>
       <ul>
         {suggestion.alternativeSlots.map((alt) => (
           <li key={alt.slotId}>
             <span className="smart-card-value">{alt.slotPath}</span>
             {' — '}
             <strong>{alt.allocateQty}</strong> đơn vị
             {' '}
             <span className="badge badge-info">{alt.score}%</span>
           </li>
         ))}
       </ul>
     </div>
   )}
   {suggestion.splitRequired && suggestion.alternativeSlots.length <= 1 && (
     <p className="smart-card-warning">
       ⚠ Số lượng vượt sức chứa 1 Slot — hệ thống sẽ chia vào nhiều Slot khi thực hiện.
     </p>
   )}
   ```
   (Giữ lại nhánh fallback text cũ cho trường hợp dữ liệu cũ/thiếu `alternativeSlots`, tránh crash.)
3. Thêm CSS `.smart-card-alt-list ul { margin: 4px 0 0; padding-left: 18px; }` (hoặc style tương tự đồng bộ
   với các danh sách khác trong `.smart-card-reasons ul` đã có) vào file CSS chung.
4. Chạy `npm run build --workspace=frontend`.

## 💻 Ví dụ code
Xem đầy đủ ở mục "Các bước thực hiện".

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/111.txt`

## ✅ Checklist nghiệm thu
- ☐ Trường hợp 1 slot đủ chứa (`splitRequired: false`) → giao diện không đổi so với trước
- ☐ Trường hợp cần chia ≥ 2 slot → hiển thị đầy đủ danh sách vị trí, số lượng từng vị trí, điểm phù hợp
- ☐ Tổng `allocateQty` hiển thị trong danh sách phải cộng đúng bằng số lượng đặt lịch
- ☐ Trường hợp `alternativeSlots` rỗng hoặc chỉ có 1 phần tử dù `splitRequired: true` (dữ liệu cũ/lỗi) →
  vẫn hiện được cảnh báo text fallback, không crash
- ☐ `npm run build --workspace=frontend` không lỗi

## ❌ Lỗi thường gặp
- **Không xử lý fallback khi `alternativeSlots` rỗng** → nếu vì lý do nào đó backend trả `splitRequired:
  true` nhưng `alternativeSlots` rỗng (dữ liệu cũ trước Task 98), component sẽ hiện danh sách trống không rõ
  ràng — phải có nhánh fallback như ví dụ.
- **Dùng `index` làm `key` thay vì `alt.slotId`** → risk re-render sai khi danh sách thay đổi thứ tự giữa
  các lần gọi preview.

## 🔄 Cách test
1. `npm run dev --workspace=frontend`, mở modal "Đặt lịch nhập".
2. Chọn sản phẩm/số lượng đủ lớn để vượt sức chứa 1 slot — quan sát card gợi ý phải hiện đầy đủ danh sách
   nhiều vị trí, không chỉ 1 dòng cảnh báo.
3. Cộng tổng `allocateQty` các dòng hiển thị — phải bằng đúng số lượng đã nhập.
4. Chọn số lượng nhỏ (1 slot đủ chứa) — card vẫn hiện như cũ (1 vị trí, không có danh sách).

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/types.ts apps/frontend/src/components/SmartLocationSuggestionCard.tsx
```

## 📝 Commit message
```
feat(schedules): display full multi-slot allocation list in Smart Location Suggestion card
```

## 🔀 PR title
```
[Task 111] Show full alternative-slot list for multi-location inbound suggestion
```

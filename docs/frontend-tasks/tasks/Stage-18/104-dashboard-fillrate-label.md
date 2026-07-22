# Task 104 [FRONTEND] — Làm rõ nhãn "Tỷ lệ lấp đầy" trên Dashboard (khớp công thức đã sửa ở backend)

## 🎯 Mục tiêu
Sau khi Task 86 (backend) sửa `occupancyPercent` từ "đếm slot có/không có hàng" sang "tính theo dung
lượng", cập nhật lại nhãn/mô tả trên Dashboard cho khớp ý nghĩa mới — tránh gây hiểu lầm giữa 2 khái niệm
"số slot đang dùng" (đếm slot) và "tỷ lệ lấp đầy" (theo dung lượng), vốn đã hiển thị tách biệt nhưng nhãn phụ
(hint) hiện đang mô tả sai.

**Điều kiện tiên quyết: Task 86 đã merge ở backend.**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể)
`apps/frontend/src/pages/dashboard/Dashboard.tsx`, dòng 60-65:
```tsx
<StatCard
  label="Tỉ lệ lấp đầy"
  value={loading ? '—' : `${summary?.occupancyPercent ?? 0}%`}
  hint="Slot đang sử dụng"
  icon={<WarehouseIcon />}
/>
```
Dòng `hint="Slot đang sử dụng"` mô tả SAI bản chất của con số sau khi Task 86 sửa công thức — giờ đây
`occupancyPercent` là **tỷ lệ dung lượng đã dùng**, không phải "có bao nhiêu slot đang dùng" (khái niệm đó
đã có card riêng "Slot trống" ngay bên cạnh, dòng 52-57, hiển thị `availableSlots / totalSlots`). Giữ nguyên
hint cũ sẽ khiến người dùng hiểu nhầm 2 card đang lặp lại cùng 1 ý nghĩa.

## 🧠 Giải thích React cần biết
- Đây là thay đổi thuần UI text (props của `StatCard`), không cần đổi logic hay gọi API khác — dữ liệu
  `summary.occupancyPercent` đã tự động đúng nhờ Task 86 (backend trả giá trị mới với đúng field cũ, không
  đổi shape).
- `StatCard` (component có sẵn) nhận `hint` là 1 chuỗi text đơn giản — không cần sửa component
  `StatCard.tsx`.

## 📖 Các file cần đọc trước
- `apps/frontend/src/pages/dashboard/Dashboard.tsx` (toàn bộ, 96 dòng)
- `apps/frontend/src/components/StatCard.tsx` (chỉ để xác nhận props, không sửa)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/frontend/src/pages/dashboard/Dashboard.tsx` (chỉ đổi `hint` của card "Tỉ lệ lấp đầy")

## 📂 File KHÔNG được sửa
- `apps/frontend/src/components/StatCard.tsx`
- `apps/frontend/src/hooks/useDashboard.ts`, `apps/frontend/src/services/dashboard.service.ts`
- `apps/frontend/src/types.ts`

## 🔌 API cần dùng
`GET /dashboard/summary` (đã dùng sẵn qua `useDashboard`) — không đổi cách gọi.

## 🪜 Các bước thực hiện
1. Trong `Dashboard.tsx`, tìm card "Tỉ lệ lấp đầy" (dòng 60-65).
2. Đổi `hint="Slot đang sử dụng"` thành `hint="Theo dung lượng đã dùng"`.
3. (Khuyến khích) Đổi `hint` của card "Slot trống" (dòng 52-57, hiện là `hint="Trống / tổng số slot"`) thành
   rõ ràng hơn: `hint="Số lượng slot, không tính dung lượng"` — để 2 card phân biệt rõ ràng "đếm slot" vs
   "đếm dung lượng" ngay trên UI, người dùng không cần đoán.
4. `npm run build --workspace=frontend` để chắc chắn không lỗi TypeScript/lint.

## 💻 Ví dụ code (đoạn diff)
```tsx
<StatCard
  label="Slot trống"
  value={loading ? '—' : `${summary?.availableSlots ?? 0} / ${summary?.totalSlots ?? 0}`}
  hint="Số lượng slot, không tính dung lượng"
  icon={<GridIcon />}
/>
<StatCard
  label="Tỉ lệ lấp đầy"
  value={loading ? '—' : `${summary?.occupancyPercent ?? 0}%`}
  hint="Theo dung lượng đã dùng"
  icon={<WarehouseIcon />}
/>
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/104.txt`

## ✅ Checklist nghiệm thu
- ☐ Card "Tỉ lệ lấp đầy" có `hint="Theo dung lượng đã dùng"`
- ☐ Card "Slot trống" có hint làm rõ đây là đếm theo SỐ LƯỢNG slot (không tính dung lượng)
- ☐ Không đổi `label`, `value`, `icon` của cả 2 card
- ☐ Không đổi logic gọi API/hook nào
- ☐ `npm run build --workspace=frontend` không lỗi

## ❌ Lỗi thường gặp
- **Nhầm sửa giá trị `value`** (tưởng cần đổi công thức hiển thị) → không cần, backend đã trả đúng giá trị
  sau Task 86, chỉ cần sửa TEXT mô tả.
- **Sửa nhầm sang `label`** thay vì `hint` → đổi tên card sẽ ảnh hưởng tới các nơi khác có thể đang tham
  chiếu tên card này (ví dụ tài liệu hướng dẫn nội bộ, ảnh chụp màn hình đào tạo).

## 🔄 Cách test
1. `npm run dev --workspace=frontend`, vào trang Dashboard.
2. Hover/xem 2 card "Slot trống" và "Tỉ lệ lấp đầy" — hint text phải rõ ràng, phân biệt được 2 khái niệm.
3. So sánh: nếu kho có nhiều slot chỉ dùng 1 phần nhỏ dung lượng, "Slot trống" sẽ ra số nhỏ (vì slot đó tính
   là "đang dùng") nhưng "Tỉ lệ lấp đầy" sẽ ra % nhỏ hơn nhiều — hint mới phải giúp người xem hiểu đúng vì
   sao 2 số này không "khớp" nhau về mặt trực giác.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/pages/dashboard/Dashboard.tsx
```

## 📝 Commit message
```
fix(dashboard): clarify occupancy vs slot-count labels after backend formula fix
```

## 🔀 PR title
```
[Task 104] Clarify Dashboard fill-rate label to match capacity-based formula
```

# Task 107 [FRONTEND] — Xác nhận & làm rõ hiển thị "Sản phẩm đã gán" sau khi backend đã sửa

## 🎯 Mục tiêu
Sau khi Task 87 (backend) sửa `_count.products` để loại sản phẩm đã xoá mềm, **con số trên FE tự động đúng**
(vì `CategoryList.tsx` chỉ cộng dồn `_count.products` có sẵn từ API, không tự tính toán gì thêm) — task này
KHÔNG cần sửa lỗi tính toán ở FE, chỉ cần: (1) xác nhận không có chỗ nào khác ở FE vô tình tính trùng/tính
sai, và (2) làm rõ thêm hint để người dùng hiểu đúng con số này chỉ tính sản phẩm đang hoạt động.

**Điều kiện tiên quyết: Task 87 đã merge (backend).**

## 📖 Giải thích nghiệp vụ (bằng chứng cụ thể — xác nhận KHÔNG có bug ở FE)
Đã kiểm tra `CategoryList.tsx`, dòng 19:
```tsx
const totalProducts = items.reduce((sum, c) => sum + (c._count?.products ?? 0), 0);
```
Đây chỉ là phép cộng dồn đơn giản từ dữ liệu `_count.products` mà API `GET /categories` trả về — **không có
logic tính sai ở tầng FE**. Sau khi Task 87 sửa đúng ở backend, `totalProducts` sẽ tự động ra đúng số mà
không cần đổi dòng code này. Task 107 do đó tập trung vào (a) viết 1 bước xác nhận thủ công (không phải sửa
code), và (b) cải thiện UX để tránh lỗi tương tự bị hiểu nhầm trong tương lai — thêm hint rõ ràng.

## 🧠 Giải thích React cần biết
- Đây là task **chủ yếu xác nhận + cải thiện text**, không phải sửa logic — tránh việc lập trình viên tự ý
  "vá" lại `totalProducts` bằng cách filter thêm ở FE (sẽ tạo ra 2 nơi lọc trùng logic, dễ lệch nhau sau
  này) — nguồn dữ liệu ĐÚNG duy nhất phải là API (Task 87), FE chỉ hiển thị lại.

## 📖 Các file cần đọc trước
- `apps/frontend/src/pages/categories/CategoryList.tsx` (toàn bộ)
- `apps/frontend/src/components/CategoryTable.tsx` (kiểm tra xem bảng chi tiết từng category có hiển thị
  `_count.products` riêng lẻ theo đúng dữ liệu API không, không tính lại)

## 📂 File được phép sửa / tạo mới
- Sửa: `apps/frontend/src/pages/categories/CategoryList.tsx` (chỉ đổi `hint` của StatCard "Sản phẩm đã
  gán")

## 📂 File KHÔNG được sửa
- Dòng tính `totalProducts` (dòng 19) — GIỮ NGUYÊN, không thêm logic filter/tính toán mới ở đây (nguồn dữ
  liệu đúng phải đến từ API, không phải patch thêm ở FE)
- `apps/frontend/src/components/CategoryTable.tsx` — chỉ đọc để xác nhận, không sửa nếu không phát hiện lỗi
  thật

## 🔌 API cần dùng
`GET /categories` (đã dùng sẵn qua `useCategories`) — không đổi cách gọi, chỉ hưởng lợi từ giá trị đã đúng
sau Task 87.

## 🪜 Các bước thực hiện
1. Đọc `CategoryTable.tsx`, xác nhận cột "Số sản phẩm" (hoặc tương đương) trong bảng chi tiết cũng chỉ hiển
   thị trực tiếp `category._count.products` từ API, không có phép tính/filter riêng nào khác. Nếu phát hiện
   có logic tính khác (ví dụ tự lọc theo điều kiện riêng) — DỪNG LẠI, báo cáo lại trước khi sửa, không tự ý
   đổi vì có thể có lý do nghiệp vụ khác chưa rõ.
2. Trong `CategoryList.tsx`, sửa `hint` của StatCard "Sản phẩm đã gán" (dòng ~73):
   ```tsx
   <StatCard
     label="Sản phẩm đã gán"
     value={loading ? '—' : String(totalProducts)}
     hint="Chỉ tính sản phẩm đang hoạt động (không tính sản phẩm đã xoá)"
     icon={<BoxIcon />}
   />
   ```
3. Chạy `npm run build --workspace=frontend`.

## 💻 Ví dụ code
Xem đầy đủ ở mục "Các bước thực hiện" — chỉ 1 dòng `hint` cần đổi.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/107.txt`

## ✅ Checklist nghiệm thu
- ☐ Đã xác nhận `CategoryTable.tsx` không có logic tính `_count.products` riêng (chỉ hiển thị trực tiếp từ
  API) — ghi chú lại kết quả kiểm tra trong PR description
- ☐ `hint` của StatCard "Sản phẩm đã gán" đã cập nhật, làm rõ chỉ tính sản phẩm đang hoạt động
- ☐ Dòng tính `totalProducts` (reduce cộng dồn) KHÔNG bị đổi
- ☐ Sau khi Task 87 (backend) đã merge, tổng "Sản phẩm đã gán" cộng dồn qua các category phải khớp với số
  "Tổng sản phẩm" ở Dashboard (nếu 1 sản phẩm chỉ thuộc đúng 1 category) — test thủ công xác nhận lại, không
  chỉ tin vào code
- ☐ `npm run build --workspace=frontend` không lỗi

## ❌ Lỗi thường gặp
- **Tự ý thêm logic filter sản phẩm ở FE** (ví dụ filter theo `product.deletedAt` phía client) → sai hướng
  tiếp cận, tạo ra nguồn dữ liệu thứ 2 dễ lệch với backend về sau (đúng bài học Task 86/87 đã rút ra) — FE
  chỉ nên hiển thị, không tự tính lại nghiệp vụ đã có ở backend.
- **Nhầm tưởng cần sửa dòng `totalProducts`** — không cần, dòng đó đã đúng từ đầu, chỉ có nguồn dữ liệu
  (`_count.products` từ API) là sai trước khi có Task 87.

## 🔄 Cách test
1. Đảm bảo Task 87 (backend) đã merge và deploy/chạy local.
2. Vào trang Danh mục, kiểm tra "Sản phẩm đã gán" — số hiển thị phải khớp tổng số sản phẩm đang hoạt động
   (không tính đã xoá) trên toàn hệ thống, nếu mỗi sản phẩm chỉ gán đúng 1 category.
3. Xoá mềm 1 sản phẩm (qua trang Products) → refresh trang Danh mục → số "Sản phẩm đã gán" phải giảm đúng 1.

## 🔙 Cách rollback nếu sai
```
git checkout apps/frontend/src/pages/categories/CategoryList.tsx
```

## 📝 Commit message
```
chore(categories): clarify assigned-products hint after backend count fix
```

## 🔀 PR title
```
[Task 107] Clarify "assigned products" hint and verify no duplicate FE logic
```

# Task 27 — UI Form tạo sản phẩm (`ProductCreate.tsx`)

**Nhóm:** D – Create
**Thời lượng ước tính:** 1.5 giờ
**File tạo mới:** `apps/frontend/src/pages/products/ProductCreate.tsx`
**File sửa (bổ sung ngoài bảng gốc — xem ghi chú):** `apps/frontend/src/App.tsx`, `apps/frontend/src/pages/products/ProductList.tsx`
**Phụ thuộc bắt buộc:** Task 12 (`ProtectedRoute.tsx` đã bọc route Create), Task 13 (`ProductCategory` type đã có)

## ⚠️ Ghi chú về file ngoài bảng gốc

Bảng 41 task chỉ liệt kê `ProductCreate.tsx` là file cho Task 27, không liệt kê `App.tsx`. Đây là một gap giống hệt lý do của Quyết định 1/2 (route/entry point là điều kiện bắt buộc để trang chạy được, không thể bỏ qua). Task này bổ sung:

- 1 route mới trong `App.tsx`: `products/new`, bọc trong `ProtectedRoute` (theo đúng Task 12).
- 1 nút "+ Thêm sản phẩm" trong `ProductList.tsx` (đặt trong `page-header`, cạnh tiêu đề "Products") để có lối vào trang — nếu không có nút này, trang tồn tại nhưng người dùng không có cách nào bấm vào từ UI.

Nếu anh Đăng muốn tách việc này thành task riêng, báo lại trước khi làm — mặc định task này sẽ làm cả 3 phần trên vì chúng phụ thuộc chặt vào nhau (route không có nút bấm thì vô dụng, nút bấm không có route thì lỗi).

## Bối cảnh

Backend (`CreateProductDto`) yêu cầu:

```ts
skuCode: string;   // required, không rỗng
name: string;      // required, không rỗng
category: 'MILK' | 'CRACKER'; // required, enum
unit: string;      // required, không rỗng — ví dụ "hộp"
isHeavy?: boolean; // optional, mặc định false
```

Task này **chỉ dựng UI tĩnh**, chưa bind state (Task 28), chưa validate (Task 29), chưa gọi API (Task 30/31). Endpoint `POST /products` yêu cầu Bearer token (`@ApiBearerAuth()`) — đây là lý do route phải nằm trong `ProtectedRoute` (Task 12), người chưa đăng nhập sẽ bị redirect về Login trước khi thấy trang này.

## Yêu cầu

1. Trong `App.tsx`, thêm route (nested trong `Layout`, bọc bởi `ProtectedRoute` theo đúng pattern Task 12):
   ```tsx
   <Route
     path="products/new"
     element={
       <ProtectedRoute>
         <ProductCreate />
       </ProtectedRoute>
     }
   />
   ```
2. Trong `ProductList.tsx`, thêm 1 nút/link trong `page-header` (cạnh `<h1>Products</h1>`), dùng `Link` từ `react-router-dom` trỏ tới `/products/new`. Style tối giản, không cần đẹp (Task 39 lo phần responsive/hoàn thiện).
3. Tạo `apps/frontend/src/pages/products/ProductCreate.tsx`, render form tĩnh với các field, **chưa có `value`/`onChange`** (input để React tự quản lý uncontrolled tạm thời — sẽ chuyển sang controlled ở Task 28):
   - `skuCode`: `<input type="text" />`
   - `name`: `<input type="text" />`
   - `category`: `<select>` chỉ 2 option, không có option rỗng/placeholder gây nhầm — mặc định chọn sẵn `MILK`:
     ```tsx
     <select name="category" defaultValue="MILK">
       <option value="MILK">Sữa (MILK)</option>
       <option value="CRACKER">Bánh quy (CRACKER)</option>
     </select>
     ```
   - `unit`: `<input type="text" placeholder="ví dụ: hộp, thùng, kg" />`
   - `isHeavy`: `<input type="checkbox" />` kèm label "Hàng nặng (cần xử lý đặc biệt)"
   - 1 nút submit "Tạo sản phẩm" (chưa gắn logic).
   - 1 link "Huỷ" quay lại `/` (trang danh sách).
4. Thêm vài class CSS tối giản mới vào `App.css` nếu chưa có (không đụng CSS của `ProductTable`): `.form-group`, `.form-label`, `.form-input`, `.form-actions`, `.btn-primary`, `.btn-secondary` — dùng lại các biến màu/spacing đã có trong file (xem các class `.panel`, `.chip` để lấy tông màu nhất quán).

## Không được làm

- Không bind state, không validate, không gọi API ở task này.
- Không đổi route/nav khác ngoài phần mô tả ở trên.
- Không sửa `ProductTable.tsx`.
- Không cho `category` có option thứ 3 hay option rỗng — chỉ đúng 2 giá trị backend chấp nhận.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Đăng nhập, bấm nút "+ Thêm sản phẩm" từ trang danh sách → vào đúng `/products/new`, thấy form.
- [ ] Chưa đăng nhập, gõ thẳng URL `/products/new` → bị redirect về trang Login (do `ProtectedRoute`).
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Form hiển thị đủ 5 field + nút submit + link huỷ, chưa có hành vi submit thật (bấm nút chưa làm gì, hoặc reload trang mặc định của `<form>` — chấp nhận được ở bước này).

## Prompt AI (copy nguyên văn)

```
Tôi cần làm 3 việc trong dự án React + TypeScript + react-router-dom:

1. Thêm route mới vào apps/frontend/src/App.tsx (dán nội dung thật vào đây):
[DÁN NỘI DUNG THẬT App.tsx VÀO ĐÂY]
Route mới: path="products/new", bọc bởi component ProtectedRoute đã có sẵn (import từ đúng đường dẫn đã dùng cho các route khác), element bên trong là component ProductCreate (import từ './pages/products/ProductCreate'). Đặt route này cùng cấp/nested giống các route con khác trong Layout.

2. Thêm 1 Link trong apps/frontend/src/pages/products/ProductList.tsx (dán nội dung thật vào đây):
[DÁN NỘI DUNG THẬT ProductList.tsx VÀO ĐÂY]
Thêm 1 <Link to="/products/new"> với text "+ Thêm sản phẩm", đặt trong phần page-header, cạnh tiêu đề "Products". Style đơn giản bằng class "btn-primary" (sẽ định nghĩa ở bước 3).

3. Tạo file mới apps/frontend/src/pages/products/ProductCreate.tsx — CHỈ dựng UI tĩnh, CHƯA bind state, CHƯA validate, CHƯA gọi API:
- Tiêu đề "Tạo sản phẩm mới"
- Field skuCode: input text
- Field name: input text
- Field category: select với đúng 2 option "MILK" (label "Sữa (MILK)") và "CRACKER" (label "Bánh quy (CRACKER)"), defaultValue="MILK", không có option rỗng
- Field unit: input text, placeholder "ví dụ: hộp, thùng, kg"
- Field isHeavy: checkbox với label "Hàng nặng (cần xử lý đặc biệt)"
- 1 nút submit "Tạo sản phẩm" (chưa gắn onClick/onSubmit thật)
- 1 Link "Huỷ" quay về "/"

Thêm vào apps/frontend/src/App.css vài class CSS đơn giản mới (không sửa class nào đã có): .form-group, .form-label, .form-input, .form-actions, .btn-primary, .btn-secondary — dùng tông màu/spacing nhất quán với các class hiện có trong file (xem .panel, .chip để tham khảo).

Trả về: (1) đoạn route thêm vào App.tsx, (2) đoạn Link thêm vào ProductList.tsx, (3) toàn bộ nội dung ProductCreate.tsx, (4) đoạn CSS mới thêm vào App.css.
```

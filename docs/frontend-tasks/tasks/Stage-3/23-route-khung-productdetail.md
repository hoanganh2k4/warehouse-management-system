# Task 23 — Route + khung `ProductDetail.tsx`

**Nhóm:** C – Detail
**Thời lượng ước tính:** 1.5 giờ
**File sửa/tạo:** `apps/frontend/src/pages/products/ProductDetail.tsx` (mới), `apps/frontend/src/App.tsx` (sửa — thêm route)
**Phụ thuộc bắt buộc:** Task 03 (Router + `Layout.tsx` đã có `<Outlet />`), Task 04 (route cho `ProductList` đã tồn tại trong `App.tsx`)

## Bối cảnh

⚠️ **Trước khi làm task này**, mở `App.tsx` thật và xem cấu trúc route hiện tại sau Task 03/04 — task này giả định cấu trúc dạng:

```tsx
<Routes>
  <Route element={<Layout />}>
    <Route index element={<ProductList />} />
    {/* các route khác sẽ thêm ở đây */}
  </Route>
</Routes>
```

Nếu route của `ProductList` không phải `index` mà là path cụ thể (ví dụ `/products`), điều chỉnh path của route detail bên dưới cho khớp (ví dụ `products/:id` thay vì đặt lẫn với path khác) — **không đổi lại route của `ProductList` đã có**, chỉ thêm route mới.

Task này **chỉ tạo khung trang**, chưa gọi API (Task 24/25), chưa render dữ liệu thật (Task 26). Mục tiêu là có 1 route `/products/:id` chạy được, hiển thị `id` lấy từ URL để xác nhận routing đúng.

## Yêu cầu

1. Trong `App.tsx`, thêm route con (nested trong `Layout`, cùng cấp với route của `ProductList`):
   ```tsx
   <Route path="products/:id" element={<ProductDetail />} />
   ```
   Import `ProductDetail` từ `./pages/products/ProductDetail`.
2. Tạo file `apps/frontend/src/pages/products/ProductDetail.tsx` với khung tối thiểu:
   ```tsx
   import { useParams, Link } from 'react-router-dom';

   export function ProductDetail() {
     const { id } = useParams<{ id: string }>();

     return (
       <main className="app-content">
         <div className="page-header">
           <div>
             <Link to="/" className="back-link">← Quay lại danh sách</Link>
             <p className="eyebrow">Catalog</p>
             <h1>Chi tiết sản phẩm</h1>
             <p className="page-desc">ID: {id}</p>
           </div>
         </div>
         {/* Nội dung chi tiết thật sẽ thêm ở Task 26 */}
       </main>
     );
   }
   ```
3. Đường dẫn `Link to="/"` ở trên giả định route danh sách là `index` (`/`) — chỉnh lại cho khớp path thật của `ProductList` nếu khác.
4. Không tự thêm nút/link điều hướng *vào* trang detail từ `ProductList`/`ProductTable` ở task này — theo đúng bảng 41 task, việc đó không nằm trong file list của Nhóm C. Test bằng cách gõ thẳng URL `http://localhost:5173/products/<id-thật>` (lấy 1 id thật từ response API hoặc Prisma Studio).

## Không được làm

- Không sửa `ProductList.tsx` hay `ProductTable.tsx` để thêm link điều hướng — nếu thấy cần link từ danh sách vào chi tiết, đó là một task bổ sung ngoài kế hoạch, báo anh Đăng trước khi tự thêm.
- Không gọi API trong task này — `id` chỉ hiển thị thô từ `useParams`, chưa fetch dữ liệu thật.
- Không đổi route/path của `ProductList` đã có.
- Không style phức tạp — CSS hoàn thiện thuộc Task 39.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Gõ URL `/products/<id-bất-kỳ>` (kể cả id không tồn tại) → trang hiện ra, hiển thị đúng `id` lấy từ URL, không bị lỗi 404 route hay crash.
- [ ] Bấm "← Quay lại danh sách" → điều hướng đúng về trang `ProductList`.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] Route `ProductList` cũ vẫn hoạt động bình thường (không bị route mới đè lên).

## Prompt AI (copy nguyên văn)

```
Tôi cần thêm 1 route mới vào dự án React + TypeScript đang dùng react-router-dom.

Trước tiên, đây là nội dung thật của apps/frontend/src/App.tsx hiện tại:
[DÁN NỘI DUNG THẬT CỦA App.tsx VÀO ĐÂY]

Yêu cầu:
1. Thêm 1 route mới, nested cùng cấp với route hiện có của trang ProductList, path là "products/:id", element là component ProductDetail (import từ './pages/products/ProductDetail').
2. Không đổi route/path đã có của ProductList.
3. Tạo file mới apps/frontend/src/pages/products/ProductDetail.tsx với nội dung:
   - Dùng useParams<{ id: string }>() từ react-router-dom để lấy "id" từ URL.
   - Render 1 link "← Quay lại danh sách" trỏ về đúng route của trang ProductList (dựa theo route thật tôi vừa dán ở trên).
   - Render tiêu đề "Chi tiết sản phẩm" và hiển thị "ID: {id}" tạm thời.
   - KHÔNG gọi API, chưa cần logic loading/error ở bước này.

Ràng buộc:
- Không sửa ProductList.tsx hay ProductTable.tsx.
- Không style phức tạp, dùng class CSS đơn giản tương tự các trang khác trong page-header hiện có (nếu thấy class "page-header", "eyebrow", "page-desc" trong App.tsx/ProductList.tsx thì tái sử dụng đúng class đó cho đồng bộ).

Trả về: (1) đoạn route cần thêm vào App.tsx và vị trí thêm, (2) toàn bộ nội dung file ProductDetail.tsx mới.
```

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

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-3/23.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

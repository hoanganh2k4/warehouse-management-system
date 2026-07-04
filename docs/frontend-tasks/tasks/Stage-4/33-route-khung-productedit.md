# Task 33 — Route + khung `ProductEdit.tsx`

**Nhóm:** E – Edit
**Thời lượng ước tính:** 1.5 giờ
**File sửa/tạo:** `apps/frontend/src/pages/products/ProductEdit.tsx` (mới), `apps/frontend/src/App.tsx` (sửa — thêm route)
**File sửa bổ sung ngoài bảng gốc (xem ghi chú):** `apps/frontend/src/pages/products/ProductDetail.tsx`
**Phụ thuộc bắt buộc:** Task 12 (`ProtectedRoute.tsx`), Task 26 (`ProductDetail.tsx` đã render xong, có chỗ trống dành cho nút hành động)

## ⚠️ Ghi chú về file ngoài bảng gốc

Bảng 41 task liệt kê đúng `ProductEdit.tsx` và `App.tsx` cho task này, nhưng không có lối vào từ đâu để tới trang Edit. Giống lý do đã nêu ở Task 27, task này bổ sung: 1 nút "Sửa" trong `ProductDetail.tsx` (Task 26 đã chừa sẵn ghi chú "chưa thêm nút Sửa/Xoá... thuộc Task 33–38"), trỏ tới `/products/:id/edit`.

## Bối cảnh

Endpoint `PUT /products/:id` yêu cầu Bearer token — route Edit phải nằm trong `ProtectedRoute` giống Create. Quan trọng: **`UpdateProductDto` không có field `skuCode`** — nghĩa là SKU không sửa được sau khi tạo. Task 34/35/36 phải tôn trọng điều này (hiển thị SKU dạng chỉ đọc, không phải input).

Task này **chỉ dựng khung + route**, chưa load dữ liệu thật (Task 34), chưa submit (Task 35).

## Yêu cầu

1. Trong `App.tsx`, thêm route (nested trong `Layout`, bọc bởi `ProtectedRoute`):
   ```tsx
   <Route
     path="products/:id/edit"
     element={
       <ProtectedRoute>
         <ProductEdit />
       </ProtectedRoute>
     }
   />
   ```
2. Trong `ProductDetail.tsx`, thêm 1 nút/link "Sửa" (dùng `Link` tới `` `/products/${id}/edit` ``), đặt cạnh khu vực tiêu đề sản phẩm — chưa thêm nút "Xoá" ở task này (thuộc Task 38).
3. Tạo `apps/frontend/src/pages/products/ProductEdit.tsx`, khung tối thiểu tương tự Task 23:
   ```tsx
   import { useParams, Link } from 'react-router-dom';

   export function ProductEdit() {
     const { id } = useParams<{ id: string }>();

     return (
       <main className="app-content">
         <div className="page-header">
           <div>
             <Link to={`/products/${id}`} className="back-link">← Quay lại chi tiết</Link>
             <p className="eyebrow">Catalog</p>
             <h1>Sửa sản phẩm</h1>
           </div>
         </div>
         {/* Form thật sẽ thêm ở Task 34/35/36 */}
       </main>
     );
   }
   ```

## Không được làm

- Không load dữ liệu thật hay dựng form ở task này (Task 34).
- Không thêm nút "Xoá" (Task 38).
- Không sửa `ProductTable.tsx` hay `ProductCreate.tsx`.
- Không cho phép sửa `skuCode` ở bất kỳ đâu trong toàn bộ Nhóm E — đây là ràng buộc xuyên suốt từ task này đến Task 36.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Từ trang chi tiết 1 sản phẩm, bấm "Sửa" → vào đúng `/products/<id>/edit`.
- [ ] Chưa đăng nhập, gõ thẳng URL → redirect về Login.
- [ ] Bấm "← Quay lại chi tiết" → về đúng trang detail của đúng sản phẩm đó (không phải về trang danh sách).
- [ ] `npx tsc --noEmit` không lỗi.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-4/33.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)

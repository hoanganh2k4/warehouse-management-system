# Task 26 — Render chi tiết sản phẩm trong `ProductDetail.tsx`

**Nhóm:** C – Detail
**Thời lượng ước tính:** 2 giờ
**File sửa:** `apps/frontend/src/pages/products/ProductDetail.tsx`
**Phụ thuộc bắt buộc:** Task 23 (khung trang + route đã có), Task 25 (`useProductDetail` đã có)

## Bối cảnh

Đây là task duy nhất trong Nhóm C **được phép** viết UI mới (khác với Nhóm B — Quyết định 3 chỉ áp dụng cho `ProductTable.tsx`, không áp dụng cho trang Detail vì trang này chưa có component con nào dựng sẵn). Vẫn cần giữ phong cách nhất quán với `ProductTable.tsx`/`StatCard.tsx` (dùng chung class CSS đã có trong `App.css` nếu tên class trùng ý nghĩa, ví dụ `chip`, `badge`, `badge-heavy`, `badge-standard`, `muted-cell`).

Dữ liệu trả về từ `useProductDetail` (`ProductDetail = Product & { batches: Batch[] }`) — `batches` đã được backend sắp theo `expiryDate` tăng dần sẵn, **không tự sort lại**.

## Yêu cầu

1. Thay nội dung tạm `ID: {id}` bằng gọi hook thật:
   ```tsx
   const { id } = useParams<{ id: string }>();
   const { product, loading, error, refetch } = useProductDetail(id);
   ```
2. Xử lý 3 trạng thái ngay trong `ProductDetail.tsx` (component này tự lo, không có component con để tách như `ProductTable`):
   - `loading === true` → hiện skeleton đơn giản (vài dòng `<span className="skeleton" />` tái dùng đúng class `skeleton` đã có trong CSS từ `ProductTable.tsx`, không cần tạo class mới).
   - `error` (có giá trị) → hiện panel lỗi, tái dùng class `state-panel state-error` đã có sẵn trong CSS (từ `ProductTable.tsx`), kèm nút "Thử lại" gọi `refetch()`.
   - `!product` sau khi hết loading và không có lỗi → coi như trường hợp hiếm, hiện thông báo "Không tìm thấy sản phẩm" (tái dùng class `state-panel`).
3. Khi có `product`, render:
   - Tên, SKU, category (dùng class `chip` như trong `ProductTable.tsx`), unit, badge heavy/standard (tái dùng đúng style `badge badge-heavy` / `badge badge-standard`).
   - Ngày tạo/cập nhật, format bằng hàm `formatDate` — **viết lại hàm format riêng trong file này** (không import từ `ProductTable.tsx` vì hàm đó không được export ra ngoài file gốc; nếu muốn dùng chung, phải sửa `ProductTable.tsx` để export hàm — điều này ngoài scope task, nên viết bản riêng, chấp nhận trùng lặp nhỏ).
   - Bảng danh sách `batches`: cột `Batch Code`, `Ngày sản xuất`, `Ngày hết hạn` — nếu `batches.length === 0`, hiện dòng "Chưa có lô hàng nào" thay vì bảng trống.
4. Không cần thêm nút "Sửa"/"Xoá" ở task này — thuộc Task 33–38 (Nhóm E/F), sẽ được thêm vào file này ở các task sau.

Code tham khảo khung xử lý trạng thái:

```tsx
if (loading) {
  return (
    <main className="app-content">
      <span className="skeleton" style={{ width: '200px', height: '28px' }} />
      <span className="skeleton" style={{ width: '120px', height: '18px', marginTop: 12 }} />
    </main>
  );
}

if (error) {
  return (
    <main className="app-content">
      <div className="state-panel state-error">
        <p className="state-title">Không tải được chi tiết sản phẩm</p>
        <p className="state-body">{error}</p>
        <button onClick={refetch}>Thử lại</button>
      </div>
    </main>
  );
}

if (!product) {
  return (
    <main className="app-content">
      <div className="state-panel">
        <p className="state-title">Không tìm thấy sản phẩm</p>
      </div>
    </main>
  );
}
```

## Không được làm

- Không sửa `ProductTable.tsx` để export `formatDate` dùng chung — viết bản riêng trong `ProductDetail.tsx`, chấp nhận trùng lặp nhỏ (đổi refactor chung là việc sau, không nằm trong 41 task).
- Không thêm nút Sửa/Xoá — thuộc nhóm E/F.
- Không tự sort lại `batches` — backend đã sort theo `expiryDate` sẵn.
- Không gọi `useProducts` (Task 15) trong file này — chỉ dùng `useProductDetail`.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Vào `/products/<id-thật-có-batches>` → thấy đủ thông tin sản phẩm và bảng batches đúng dữ liệu thật.
- [ ] Vào `/products/<id-không-tồn-tại>` → thấy panel lỗi, bấm "Thử lại" → gọi lại API (thấy request mới trong Network tab).
- [ ] Sản phẩm có `batches.length === 0` → thấy dòng "Chưa có lô hàng nào" thay vì bảng trống lỗi layout.
- [ ] `npx tsc --noEmit` không lỗi.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-3/26.txt`
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
